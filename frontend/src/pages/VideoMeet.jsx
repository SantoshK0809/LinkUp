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

const server = import.meta.env.VITE_BASE_URL;

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
      console.error(
        "Local stream not available. Cannot create peer connection.",
      );
      return null;
    }

    if (!socketRef.current) {
      console.error("Socket not initialized.");
      return null;
    }

    // Create connection
    const pc = new RTCPeerConnection(peerConfigConnections);

    // Store AFTER validation
    peerConnections.current[socketId] = pc;

    // Add tracks safely
    try {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    } catch (err) {
      console.error("Error adding tracks:", err);
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

    // Remote stream handling
    pc.ontrack = (event) => {
      const stream = event.streams[0];
      if (!stream) return;

      setVideos((prev) => {
        const exists = prev.find((v) => v.socketId === socketId);
        const peerUserName = peerUserNames.current[socketId] || "User";

        if (exists) {
          return prev.map((v) =>
            v.socketId === socketId
              ? { ...v, stream, userName: peerUserName }
              : v,
          );
        }

        return [...prev, { socketId, stream, userName: peerUserName }];
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
    const stream = await getMediaStream();
    if (!stream) {
      console.error("No media stream. Aborting connection.");
      return;
    }

    socketRef.current = io(server);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;
      socketRef.current.emit(
        "join-call",
        window.location.pathname,
        location.state?.username || "User",
      );
    });

    // EXISTING USERS
    socketRef.current.on("existing-users", async (users) => {
      for (const user of users) {
        console.log("Existing user:", user);
        const userId = user.socketId;
        if (userId === socketIdRef.current) continue; // skip self
        peerUserNames.current[userId] = user.userName;

        if (peerConnections.current[userId]) continue;

        const pc = createPeerConnection(userId);
        if (!pc) continue;

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
      if (user.userName) {
        peerUserNames.current[userId] = user.userName;
      }
      console.log("User joined:", userId, user.userName);
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
      }

      // HANDLE ICE
      if (signal.ice) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
        } catch (err) {
          console.warn("ICE error:", err);
        }
      }
    });

    // USER LEFT
    socketRef.current.on("user-left", (id) => {
      cleanupPeer(id);
    });

    socketRef.current.on("chat-message", addMessage);
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let gain = ctx.createGain();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    // dst.channelCount = 2;

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), {
      width,
      height,
    });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false });
  };

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

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const handleVideo = () => {
    // const videoTrack = localStreamRef.current.getVideoTracks()[0];
    // if (!videoTrack) return;
    // videoTrack.enabled = !videoTrack.enabled;
    // setVideo(videoTrack.enabled);

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
        const sender = pc.getSenders().find((s) => s.track.kind === "video");

        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      localVideoRef.current.srcObject = screenStream;

      screenTrack.onended = () => {
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        if (!cameraTrack) return;

        localStreamRef.current = originalStream;
        localVideoRef.current.srcObject = originalStream;

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track.kind === "video");

          if (sender) {
            sender.replaceTrack(cameraTrack);
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
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between border-b border-gray-300 px-6 py-3">
        <h1 className="text-sm font-medium text-white">LinkUp Meeting</h1>
        <span className="text-xs text-white">
          {videos.length + 1} participants
        </span>
      </header>

      {/* ===== MAIN ===== */}
      <div className="flex flex-1 overflow-hidden">
        {/* ===== VIDEO GRID ===== */}
        <main className="flex-1 p-4">
          <div className="grid h-full gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            {/* SELF */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-700">
              {video ? (
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
                <div className="flex items-center justify-center h-full w-full bg-gray-800 text-gray-400 text-xl">
                  {userName ? userName[0].toUpperCase() : "?"}
                </div>
              )}
              <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                {userName} (You)
              </div>
            </div>

            {/* OTHERS */}
            {videos.map((video) => (
              <div
                key={video.socketId}
                className="relative aspect-video bg-black rounded-xl overflow-hidden border border-gray-700"
              >
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      if (ref.srcObject !== video.stream) {
                        ref.srcObject = video.stream;
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                  {video.userName || "User"}
                </div>
              </div>
            ))}
          </div>
        </main>

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

      {/* ===== FOOTER ===== */}
      <footer className="flex items-center justify-center gap-4 border-t border-gray-300 px-6 py-4">
        <button
          disabled={!mediaReady}
          onClick={handleVideo}
          className={
            video
              ? "p-3 bg-gray-700 rounded-full hover:bg-gray-600"
              : "p-3 bg-red-500 rounded-full hover:bg-red-600"
          }
        >
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </button>

        <button
          disabled={!mediaReady}
          onClick={handleAudio}
          className={
            audio
              ? "p-3 bg-gray-700 rounded-full hover:bg-gray-600"
              : "p-3 bg-red-500 rounded-full hover:bg-red-600"
          }
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
          className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 flex items-center justify-center"
        >
          <Badge badgeContent={newMessages} color="secondary">
            {showModal ? <ChatBubbleIcon /> : <ChatIcon />}
          </Badge>
        </button>

        <button
          onClick={handleEndCall}
          className="p-3 bg-red-600 rounded-full hover:bg-red-500"
        >
          <CallEndIcon />
        </button>
      </footer>
    </div>
  );
};
export default VideoMeet;
