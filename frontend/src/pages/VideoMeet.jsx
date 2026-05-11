import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import Lobby from "./Lobby";
import { AuthContextData } from "../context/AuthContext";
import RemoteVideo from "../components/RemoteVideo";
import Avatar from "../components/Avatar";
import servers from "../environment";

const server = servers;

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:your-turn-server.com",
      username: "user",
      credential: "pass",
    },
  ],
};

const VideoMeet = () => {
  const { userData } = useContext(AuthContextData);
  console.log(`Current User Data in meeting : ${JSON.stringify(userData)}`);

  const socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  // const videoRef = useRef([]);
  const peerConnections = useRef({});
  const localStreamRef = useRef(null);
  const peerUserNames = useRef({});

  let [audioAvailable, setAudioAvailable] = useState(true);
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);

  let [video, setVideo] = useState(true);
  let [audio, setAudio] = useState(true);
  let [screen, setScreen] = useState(true);
  let [showModal, setShowModal] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  const [activeUser, setActiveUser] = useState(null);

  // let [askForUsername, setAskForUsername] = useState(true);
  let [userName, setUserName] = useState("");
  let [videos, setVideos] = useState([]);
  // let [cam, setCam] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // If we can't see the username, it means it's a new session
  // const { username, camOn, micOn } = location.state || {};

  useEffect(() => {
    if (location.state?.username) {
      setUserName(location.state.username);
    } else {
      console.warn("No username provided");
    }
  }, [location.state]);

  const getPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setVideoAvailable(true);
      setAudioAvailable(true);

      // stop tracks after checking
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      setVideoAvailable(false);
      setAudioAvailable(false);
    }

    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
  };

  //  useEffect(() => {
  //   getPermission();

  //   const init = async () => {
  //     await connectToSocketServer();
  //   };
  //   init();
  // }, []);

  const selfUser = {
    socketId: socketIdRef.current,
    stream: localStreamRef.current,
    userName: userName,
    videoEnabled: video,
  };

  const participants = [selfUser, ...videos];

  const stripUsers = participants.filter(
    (u) => u.socketId !== activeUser?.socketId,
  );

  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      console.log("Stream from get media stream:", stream);

      if (!stream) {
        console.error("Stream not available");
      }

      localStreamRef.current = stream;
      setMediaReady(true);

      // Apply initial cam/mic states from Lobby
      if (location.state) {
        const { camOn, micOn } = location.state;

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = camOn ?? true;
          setVideo(camOn ?? true);
        }

        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = micOn ?? true;
          setAudio(micOn ?? true);
        }
      } else {
        setVideo(true);
        setAudio(true);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error("Media error:", err);
      setVideo(false);
      setAudio(false);
      return null;
    }
  };

  const cleanupPeer = (socketId) => {
    const pc = peerConnections.current[socketId];

    if (pc) {
      pc.close();
      delete peerConnections.current[socketId];
    }

    setVideos((prev) => prev.filter((v) => v.socketId !== socketId));
  };

  const createPeerConnection = (socketId) => {
    // Prevent duplicate connections
    if (peerConnections.current[socketId]) {
      console.warn("Peer connection already exists for:", socketId);
      return peerConnections.current[socketId];
    }

    // Validate dependencies
    if (!localStreamRef.current) {
      console.warn(
        "Local stream not available. Proceeding to create peer connection for receiving only.",
      );
    }

    if (!socketRef.current) {
      console.error("Socket not initialized.");
      return null;
    }

    // Create connection
    const pc = new RTCPeerConnection(peerConfigConnections);
    // Add recvonly transceivers if no local media
    if (!localStreamRef.current) {
      pc.addTransceiver("audio", {
        direction: "recvonly",
      });

      pc.addTransceiver("video", {
        direction: "recvonly",
      });
    }
    pc.iceQueue = []; // 🔥 Queue for early ICE candidates

    // Store AFTER validation
    peerConnections.current[socketId] = pc;

    // Add tracks safely
    if (localStreamRef.current) {
      try {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      } catch (err) {
        console.error("Error adding tracks:", err);
      }
    }

    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit(
          "signal",
          socketId,
          JSON.stringify({ ice: event.candidate }),
        );
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      // if (!stream) return;

      let remoteStream = new MediaStream();

      event.streams[0]
        ?.getTracks()
        .forEach((track) => remoteStream.addTrack(track));

      const peerUserName = peerUserNames.current[socketId] || "User";

      // Only set active user if none exists
      setActiveUser((prev) => {
        if (!prev) {
          return {
            socketId,
            stream,
            userName: peerUserName,
            videoEnabled: true,
          };
        }
        return prev;
      });

      setVideos((prev) => {
        const exists = prev.find((v) => v.socketId === socketId);

        if (exists) {
          return prev.map((v) =>
            v.socketId === socketId
              ? { ...v, stream, userName: peerUserName }
              : v,
          );
        }

        return [
          ...prev,
          { socketId, stream: remoteStream, userName: peerUserName },
        ];
      });
    };

    // Debugging hooks (VERY IMPORTANT)
    pc.onconnectionstatechange = () => {
      console.log(`Connection state (${socketId}):`, pc.connectionState);

      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        cleanupPeer(socketId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`ICE state (${socketId}):`, pc.iceConnectionState);
    };

    return pc;
  };

  const connectToSocketServer = async () => {
    await getMediaStream(); // Attempt to get media, but proceed even if it fails

    socketRef.current = io(server);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      setActiveUser({
        socketId: socketRef.current.id,
        stream: localStreamRef.current,
        userName: location.state?.username || "You",
        videoEnabled: !!localStreamRef.current,
      });
      const roomId = window.location.pathname.split("/").pop();
      socketRef.current.emit("join-call", {
        roomId,
        userName: location.state?.username || "User",
      });
    });

    // EXISTING USERS
    socketRef.current.on("existing-users", async (users) => {
      // Immediately add all existing users to the UI with null streams
      setVideos((prev) => {
        const newVideos = [...prev];
        let changed = false;
        users.forEach((u) => {
          if (
            u.socketId !== socketIdRef.current &&
            !newVideos.find((v) => v.socketId === u.socketId)
          ) {
            newVideos.push({
              socketId: u.socketId,
              stream: null,
              userName: u.userName,
            });
            changed = true;
          }
        });
        return changed ? newVideos : prev;
      });

      for (const user of users) {
        console.log("Existing user:", user);
        const userId = user.socketId;
        if (userId === socketIdRef.current) continue; // skip self
        peerUserNames.current[userId] = user.userName;

        if (peerConnections.current[userId]) continue;

        const pc = createPeerConnection(userId);
        if (!pc) continue;

        // If we don't have a local stream, explicitly add transceivers to receive media
        // before creating the offer. This ensures the SDP offer has audio/video sections.
        // if (!localStreamRef.current) {
        //   try {
        //     pc.addTransceiver("audio", { direction: "recvonly" });
        //     pc.addTransceiver("video", { direction: "recvonly" });
        //   } catch (err) {
        //     console.error("Error adding transceivers:", err);
        //   }
        // }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit(
          "signal",
          userId,
          JSON.stringify({ sdp: pc.localDescription }),
        );
      }
    });

    // NEW USER JOINED → DO NOT CREATE OFFER
    socketRef.current.on("user-joined", (user) => {
      const userId = typeof user === "string" ? user : user.socketId; // fallback
      const joinedUserName = user.userName || "User";
      
      peerUserNames.current[userId] = joinedUserName;
      
      console.log("User joined:", userId, joinedUserName);
      
      // Immediately add new user to the UI
      setVideos((prev) => {
        if (!prev.find((v) => v.socketId === userId)) {
          return [
            ...prev,
            { socketId: userId, stream: null, userName: joinedUserName },
          ];
        }
        return prev;
      });

      // Wait for them to send offer
    });

    // SIGNAL HANDLING
    socketRef.current.on("signal", async (fromId, message) => {
      const signal = JSON.parse(message);

      let pc = peerConnections.current[fromId];
      if (!pc) {
        pc = createPeerConnection(fromId);
      }

      if (!pc) return;

      // HANDLE SDP
      if (signal.sdp) {
        const desc = new RTCSessionDescription(signal.sdp);

        if (desc.type === "offer") {
          if (pc.signalingState !== "stable") {
            console.warn("Skipping offer due to unstable state");
            return;
          }

          await pc.setRemoteDescription(desc);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({ sdp: pc.localDescription }),
          );
        } else if (desc.type === "answer") {
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(desc);
          }
        }

        // Process queued ICE candidates after remote description is set
        if (pc.iceQueue && pc.iceQueue.length > 0) {
          for (const ice of pc.iceQueue) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(ice));
            } catch (err) {
              console.warn("Error adding queued ICE:", err);
            }
          }
          pc.iceQueue = [];
        }
      }

      // HANDLE ICE
      if (signal.ice) {
        if (pc.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
          } catch (err) {
            console.warn("ICE error:", err);
          }
        } else {
          pc.iceQueue.push(signal.ice);
        }
      }
    });

    // USER LEFT
    socketRef.current.on("user-left", (id) => {
      cleanupPeer(id);
      setActiveUser((prev) => {
        if (prev?.socketId === id) {
          return null; // or fallback to self
        }
        return prev;
      });
    });

    socketRef.current.on("chat-message", addMessage);
  };

  // let silence = () => {
  //   let ctx = new AudioContext();
  //   let oscillator = ctx.createOscillator();
  //   let gain = ctx.createGain();

  //   let dst = oscillator.connect(ctx.createMediaStreamDestination());
  //   // dst.channelCount = 2;

  //   oscillator.start();
  //   ctx.resume();
  //   return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  // };

  // let black = ({ width = 640, height = 480 } = {}) => {
  //   let canvas = Object.assign(document.createElement("canvas"), {
  //     width,
  //     height,
  //   });
  //   canvas.getContext("2d").fillRect(0, 0, width, height);
  //   let stream = canvas.captureStream();
  //   return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  // };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  let getMedia = async () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    setScreen(false);
    connectToSocketServer();
  };

  // let connect = () => {
  //   setAskForUsername(false);
  //   getMedia();
  // };

  const handleVideo = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];

    if (!videoTrack) {
      console.warn("Video track not ready yet");
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;
    setVideo(videoTrack.enabled);
  };

  const handleAudio = () => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (!audioTrack) {
      console.warn("Audio track not ready yet");
      return;
    }
    audioTrack.enabled = !audioTrack.enabled;
    setAudio(audioTrack.enabled);
  };

  const handleScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const originalStream = localStreamRef.current;

      localStreamRef.current = screenStream;
      localVideoRef.current.srcObject = screenStream;

      const screenTrack = screenStream.getVideoTracks()[0];

      // 🔥 Replace track (THIS IS THE KEY FIX)
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc
          .getSenders()
          .find(
            (s) =>
              s.track?.kind === "video" ||
              (s.track === null &&
                pc.getTransceivers().find((t) => t.sender === s)?.receiver.track
                  .kind === "video"),
          );

        // If we don't have a sender for video yet (because we joined without media), we might need to change transceiver direction and replace track.
        // For simplicity, let's just handle if sender exists. If not, they might need to reconnect to share screen.
        if (sender) {
          sender.replaceTrack(screenTrack);
        } else {
          // Find a video transceiver and upgrade it to sendrecv
          const transceiver = pc
            .getTransceivers()
            .find((t) => t.receiver.track.kind === "video");
          if (transceiver) {
            transceiver.direction = "sendrecv";
            transceiver.sender.replaceTrack(screenTrack);
          }
        }
      });

      localVideoRef.current.srcObject = screenStream;

      screenTrack.onended = () => {
        const cameraTrack = originalStream?.getVideoTracks()[0];

        localStreamRef.current = originalStream;
        localVideoRef.current.srcObject = originalStream;

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");

          if (sender) {
            sender.replaceTrack(cameraTrack || null);

            // If we didn't have a camera originally, we should probably set direction back to recvonly
            if (!cameraTrack) {
              const transceiver = pc
                .getTransceivers()
                .find((t) => t.sender === sender);
              if (transceiver) {
                transceiver.direction = "recvonly";
              }
            }
          }
        });

        localVideoRef.current.srcObject = localStreamRef.current;
      };
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const handleEndCall = () => {
    try {
      // Stop all local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Close all peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};

      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Clear video UI
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } catch (error) {
      console.error("Error ending call:", error);
    }

    navigate("/home");
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      await getPermission();
      if (!isMounted) return;
      await connectToSocketServer();
    };

    init();

    return () => {
      isMounted = false;
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, userName);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  const totalUsers = videos.length + 1;

  return (
    <div className="flex flex-col h-screen bg-gray-800 text-white">
      {/* HEADER */}
      <header className="px-6 py-3 bg-gray-900 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-sm font-semibold">LinkUp</h1>
        <span className="text-xs text-gray-400">
          {videos.length + 1} participants
        </span>
      </header>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">
        {/* MAIN VIDEO */}
        <div className="flex-1 p-3 flex justify-center items-center">
          <div className="relative w-[60%] h-[90%] bg-black rounded overflow-hidden">
            {activeUser?.stream?.getVideoTracks?.()[0]?.enabled ? (
              activeUser?.socketId === socketIdRef.current ? (
                <video
                  ref={(ref) => {
                    localVideoRef.current = ref;
                    if (ref && localStreamRef.current) {
                      if (ref.srcObject !== localStreamRef.current) {
                        ref.srcObject = localStreamRef.current;
                      }
                    }
                  }}
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <RemoteVideo
                  key={activeUser?.socketId}
                  stream={activeUser?.stream}
                />
              )
            ) : (
              <Avatar userName={activeUser?.userName} />
            )}

            <div className="absolute bottom-3 left-3 text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
              {activeUser?.userName || "You"}
            </div>
          </div>
        </div>

        {/* CHAT PANEL */}
        {/* ===== SIDE PANEL (NOT MODAL ANYMORE) ===== */}
        {showModal && (
          <aside className="hidden md:flex w-80 flex-col bg-gray-800 border-l border-gray-700">
            <div className="p-4 border-b border-gray-700 flex justify-between">
              <h2 className="text-sm font-semibold">Chat</h2>
              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length !== 0 ? (
                messages.map((item, index) => (
                  <div key={index}>
                    <p className="text-sm font-semibold text-blue-400">
                      {item.sender}
                    </p>
                    <p className="text-sm text-gray-300">{item.data}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No messages yet</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-700 flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg bg-gray-700 outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 px-4 rounded-lg"
              >
                Send
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* 🔥 BOTTOM STRIP (IMPORTANT FIX) */}
      <div className="flex gap-2 p-2 overflow-x-auto bg-gray-900 border-t border-gray-800">
        {stripUsers.map((user) => {
          console.log("User in strip Users are: " + JSON.stringify(user));
          console.log(
            "User in strip User Stream : " + JSON.stringify(user.stream),
          );
          const isVideoOn = user.stream?.getVideoTracks?.()[0]?.enabled;

          return (
            <div
              key={user.socketId}
              onClick={() => setActiveUser(user)}
              className="relative w-40 aspect-video bg-black mb-2 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition"
            >
              {isVideoOn ? (
                user.socketId === socketIdRef.current ? (
                  <video
                    ref={(ref) => {
                      localVideoRef.current = ref;
                      if (ref && localStreamRef.current) {
                        if (ref.srcObject !== localStreamRef.current) {
                          ref.srcObject = localStreamRef.current;
                        }
                      }
                    }}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <RemoteVideo userName={user.userName} stream={user.stream} />
                )
              ) : (
                <Avatar userName={user.userName} />
              )}

              <div className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-2 py-0.5 rounded">
                {user.userName || "User"}
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTROLS */}
      <footer className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-4 bg-gray-900/80 backdrop-blur px-6 py-3 rounded-full">
        <button
          onClick={handleVideo}
          className={`p-3 rounded-full ${video ? "bg-gray-700" : "bg-red-500"}`}
        >
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </button>

        <button
          onClick={handleAudio}
          className={`p-3 rounded-full ${audio ? "bg-gray-700" : "bg-red-500"}`}
        >
          {audio ? <MicIcon /> : <MicOffIcon />}
        </button>

        {screenAvailable && (
          <button
            disabled={!mediaReady}
            onClick={handleScreen}
            className={
              screen
                ? "p-3 bg-gray-700 rounded-full hover:bg-gray-600"
                : "p-3 bg-red-500 rounded-full hover:bg-red-600"
            }
          >
            {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
          </button>
        )}

        <button
          onClick={() => setShowModal(!showModal)}
          className="p-3 bg-gray-700 rounded-full"
        >
          <ChatIcon />
        </button>

        <button onClick={handleEndCall} className="p-3 bg-red-600 rounded-full">
          <CallEndIcon />
        </button>
      </footer>
    </div>
  );
};
export default VideoMeet;
