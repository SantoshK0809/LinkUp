import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TextField, Button, IconButton, Badge } from "@mui/material";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
// import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import Lobby from "./Lobby";
// import { set } from "mongoose";

const server = `${import.meta.env.VITE_BASE_URL}`;
// var connections = {};

const peerConfigConnections = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const VideoMeet = () => {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef();
  const videoRef = useRef([]);
  const peerConnections = useRef({});
  const localStreamRef = useRef(null);

  let [audioAvailable, setAudioAvailable] = useState(true);
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(true);
  const [mediaReady, setMediaReady] = useState(false);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState(false);
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  let [cam, setCam] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.username) {
      setUsername(location.state.username);
    }
  }, [location.state]);

  // const getPermission = async () => {
  //   try {
  //     const videoPermission = await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //     });
  //     if (videoPermission) {
  //       setVideoAvailable(true);
  //     } else {
  //       setVideoAvailable(false);
  //     }
  //     const audioPermission = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //     });
  //     if (audioPermission) {
  //       setAudioAvailable(true);
  //     } else {
  //       setAudioAvailable(false);
  //     }

  //     if (navigator.mediaDevices.getDisplayMedia) {
  //       setScreenAvailable(true);
  //     } else {
  //       setScreenAvailable(false);
  //     }

  //     if (videoPermission && audioPermission) {
  //       const userMediaStream = await navigator.mediaDevices.getUserMedia({
  //         video: videoAvailable,
  //         audio: audioAvailable,
  //       });
  //       if (userMediaStream) {
  //         window.localStream = userMediaStream;
  //         if (localVideoRef.current) {
  //           localVideoRef.current.srcObject = userMediaStream;
  //         }
  //       }
  //     }
  //   } catch (error) {
  //     console.log("Error getting permissions: ", error);
  //   }
  // };

  // const getPermission = async () => {
  //   try {
  //     await navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     });

  //     setVideoAvailable(true);
  //     setAudioAvailable(true);
  //     setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const getPermission = () => {
    setVideoAvailable(true);
    setAudioAvailable(true);
    setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
  };

  useEffect(() => {
    getPermission();

    //const init = async () => {
    //   await getPermission();
    //   connectToSocketServer();
    // };
    // init();
  }, []);

  // let getUserMedia = async () => {
  //   if ((video && videoAvailable) || (audio && audioAvailable)) {
  //     // Proceed with getting user media
  //     navigator.mediaDevices
  //       .getUserMedia({ video: videoAvailable, audio: audioAvailable })
  //       .then((stream) => {
  //         window.localStream = stream;
  //         if (localVideoRef.current) {
  //           localVideoRef.current.srcObject = stream;
  //         }
  //       })
  //       .catch((error) => {
  //         console.log("Error accessing media devices: ", error);
  //       });
  //   } else {
  //     try {
  //       let track = localVideoRef.current.srcObject.getTracks();
  //       track.forEach((t) => {
  //         t.stop();
  //       });
  //       localVideoRef.current.srcObject = null;
  //     } catch (error) {
  //       console.log("Error stopping media tracks: ", error);
  //     }
  //   }
  // };

  // The useEffect below was removed because fetching a new stream on every toggle breaks WebRTC connections
  // useEffect(() => {
  //   if (video !== undefined && audio !== undefined) {
  //     getUserMedia();
  //   }
  // }, [video, audio]);

  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;
      setMediaReady(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error("Media error:", err);
    }
  };

  const createPeerConnection = (socketId) => {
    const pc = new RTCPeerConnection(peerConfigConnections);

    peerConnections.current[socketId] = pc;

    // Add tracks
    if (!localStreamRef.current) return;

    localStreamRef.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit(
          "signal",
          socketId,
          JSON.stringify({ ice: event.candidate }),
        );
      }
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];

      setVideos((prev) => {
        const exists = prev.find((v) => v.socketId === socketId);
        if (exists) {
          return prev.map((v) =>
            v.socketId === socketId ? { ...v, stream } : v,
          );
        }
        return [...prev, { socketId, stream }];
      });
    };

    return pc;
  };

  const connectToSocketServer = async () => {
    const stream = await getMediaStream();

    socketRef.current = io(server);

    socketRef.current.on("connect", () => {
      socketIdRef.current = socketRef.current.id;

      socketRef.current.emit("join-call", window.location.href);
    });

    // 🔥 EXISTING USERS (INITIAL LOAD)
    socketRef.current.on("existing-users", (users) => {
      users.forEach(async (userId) => {
        if (peerConnections.current[userId]) return;
        const pc = createPeerConnection(userId);

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socketRef.current.emit(
          "signal",
          userId,
          JSON.stringify({ sdp: pc.localDescription }),
        );
      });
    });

    // 🔥 NEW USER JOINED
    socketRef.current.on("user-joined", async (userId) => {
      if (peerConnections.current[userId]) return;
      const pc = createPeerConnection(userId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.emit(
        "signal",
        userId,
        JSON.stringify({ sdp: pc.localDescription }),
      );
      // To prevent WebRTC glare (both sides sending an offer simultaneously),
      // we do not create an offer here. The newly joined user will send us
      // an offer, which will be handled in the "signal" event.
    });

    // 🔥 SIGNAL HANDLING
    socketRef.current.on("signal", async (fromId, message) => {
      console.log("Received signal from:", fromId, message);
      const signal = JSON.parse(message);

      if (!peerConnections.current[fromId]) {
        createPeerConnection(fromId);
      }

      const pc = peerConnections.current[fromId];

      if (signal.sdp) {
        // await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));

        if (pc.signalingState !== "closed") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        }

        if (signal.sdp.type === "offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socketRef.current.emit(
            "signal",
            fromId,
            JSON.stringify({ sdp: pc.localDescription }),
          );
        }
      }

      if (signal.ice) {
        await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
      }
    });

    // 🔥 USER LEFT
    socketRef.current.on("user-left", (id) => {
      if (peerConnections.current[id]) {
        peerConnections.current[id].close();
        delete peerConnections.current[id];
      }

      setVideos((prev) => prev.filter((v) => v.socketId !== id));
    });

    socketRef.current.on("chat-message", addMessage);
  };

  // let getUserMediaSuccess = (stream) => {
  //   try {
  //     window.localStream.getTracks().forEach((track) => track.stop());
  //   } catch (error) {
  //     console.log("Error getting user media: ", error);
  //   }
  //   window.localStream = stream;
  //   if (localVideoRef.current) {
  //     localVideoRef.current.srcObject = stream;
  //   }

  //   for (let id in connections) {
  //     if (id === socketIdRef.current) {
  //       continue;
  //     }
  //     connections[id].addStream(window.localStream);
  //     connections[id]
  //       .createOffer()
  //       .then((description) => {
  //         connections[id].setLocalDescription(description);
  //       })
  //       .then(() => {
  //         socketIdRef.current.emit(
  //           "signal",
  //           id,
  //           JSON.stringify({ sdp: connections[id].localDescription }),
  //         );
  //       })
  //       .catch((err) => console.log("addStream Error: ", err));
  //   }

  //   stream.getTracks().forEach(
  //     (track) =>
  //       (track.onended = () => {
  //         // setVideo(false);
  //         // setAudio(false);
  //         setScreen(false);
  //         try {
  //           let tracks = localVideoRef.current.srcObject.getTracks();
  //           tracks.forEach((track) => track.stop());
  //           // localVideoRef.current.srcObject = null;
  //         } catch (error) {
  //           console.log("Error stopping track: ", error);
  //         }

  //         let blackSilence = (...args) =>
  //           new MediaStream([black(...args), silence()]);
  //         window.localStream = blackSilence();
  //         localVideoRef.current.srcObject = window.localStream;

  //         for (let id in connections) {
  //           // if(id === socketIdRef.current){
  //           //   continue;
  //           // }

  //           connections[id].addStream(window.localStream);
  //           connections[id]
  //             .createOffer()
  //             .then((description) => {
  //               connections[id].setLocalDescription(description);
  //             })
  //             .then(() => {
  //               socketRef.current.emit(
  //                 "signal",
  //                 id,
  //                 JSON.stringify({ sdp: connections[id].localDescription }),
  //               );
  //             })
  //             .catch((err) => console.log("addStream Error: ", err));

  //           // console.log("Error removing stream: ", error);
  //         }
  //       }),
  //   );
  // };

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

  // let gotMessageFromServer = (fromId, message) => {
  //   var signal = JSON.parse(message);
  //   if (fromId !== socketIdRef.current) {
  //     if (signal.sdp) {
  //       connections[fromId]
  //         .setRemoteDescription(new RTCSessionDescription(signal.sdp))
  //         .then(() => {
  //           if (signal.sdp.type === "offer") {
  //             connections[fromId]
  //               .createAnswer()
  //               .then((description) => {
  //                 connections[fromId]
  //                   .setLocalDescription(description)
  //                   .then(() => {
  //                     socketRef.current.emit(
  //                       "signal",
  //                       fromId,
  //                       JSON.stringify({
  //                         sdp: connections[fromId].localDescription,
  //                       }),
  //                     );
  //                   })
  //                   .catch((err) =>
  //                     console.log("setLocalDescription Error: ", err),
  //                   );
  //               })
  //               .catch((err) => console.log("createAnswer Error: ", err));
  //           }
  //         })
  //         .catch((err) => console.log("setRemoteDescription Error: ", err));
  //     }
  //     if (signal.ice) {
  //       connections[fromId]
  //         .addIceCandidate(new RTCIceCandidate(signal.ice))
  //         .catch((err) => console.log("addIceCandidate Error: ", err));
  //     }
  //   }
  // };

  let addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [...prevMessages, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  };

  // let connectToSocketServer = () => {
  //   socketRef.current = io.connect(server, { secure: false });

  //   socketRef.current.on("signal", gotMessageFromServer);
  //   socketRef.current.on("connect", () => {
  //     socketRef.current.emit("join-call", window.location.href);
  //     socketIdRef.current = socketRef.current.id;
  //     socketRef.current.on("chat-message", addMessage);

  //     socketRef.current.on("user-left", (id) => {
  //       setVideos((prevVideos) => prevVideos.filter((v) => v.socketId !== id));
  //     });

  //     socketRef.current.on("user-joined", (id, clients) => {
  //       clients.forEach((socketListId) => {
  //         connections[socketListId] = new RTCPeerConnection(
  //           peerConfigConnections,
  //         );
  //         connections[socketListId].onicecandidate = (event) => {
  //           if (event.candidate !== null) {
  //             socketRef.current.emit(
  //               "signal",
  //               socketListId,
  //               JSON.stringify({ ice: event.candidate }),
  //             );
  //           }
  //         };

  //         connections[socketListId].onaddstream = (event) => {
  //           let videoExists = videoRef.current.find(
  //             (v) => v.socketId === socketListId,
  //           );
  //           if (videoExists) {
  //             setVideos((videos) => {
  //               const updatedVideo = videos.map((video) =>
  //                 video.socketId === socketListId
  //                   ? { ...video, stream: event.stream }
  //                   : video,
  //               );
  //               videoRef.current = updatedVideo;
  //               return updatedVideo;
  //             });
  //           } else {
  //             let newVideo = {
  //               socketId: socketListId,
  //               stream: event.stream,
  //               autoPlay: true,
  //               playsinline: true,
  //             };
  //             setVideos((videos) => {
  //               const updatedVideos = [...videos, newVideo];
  //               videoRef.current = updatedVideos;
  //               return updatedVideos;
  //             });
  //           }
  //         };
  //         if (window.localStream !== undefined && window.localStream !== null) {
  //           connections[socketListId].addStream(window.localStream);
  //         } else {
  //           // TODO BLACKSILENCE
  //           // let blackSlience
  //           let blackSilence = (...args) =>
  //             new MediaStream([black(...args), silence()]);
  //           window.localStream = blackSilence();
  //           connections[socketListId].addStream(window.localStream);
  //         }
  //       });
  //       if (id === socketIdRef.current) {
  //         for (let id2 in connections) {
  //           if (id2 === socketIdRef.current) {
  //             continue;
  //           }

  //           try {
  //             connections[id2].addStream(window.localStream);
  //           } catch (error) {}
  //           connections[id2].createOffer().then((description) => {
  //             connections[id2]
  //               .setLocalDescription(description)
  //               .then(() => {
  //                 socketRef.current.emit(
  //                   "signal",
  //                   id2,
  //                   JSON.stringify({ sdp: connections[id2].localDescription }),
  //                 );
  //               })
  //               .catch((e) => {
  //                 console.log(e);
  //               });
  //           });
  //         }
  //       }
  //     });
  //   });
  // };

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

  // const handleVideo = () => {
  //   const newState = !video;
  //   setVideo(newState);
  //   if (window.localStream) {
  //     window.localStream.getVideoTracks().forEach((track) => {
  //       track.enabled = newState;
  //     });
  //   }
  // };

  // const handleAudio = () => {
  //   const newState = !audio;
  //   setAudio(newState);
  //   if (window.localStream) {
  //     window.localStream.getAudioTracks().forEach((track) => {
  //       track.enabled = newState;
  //     });
  //   }
  // };

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

  // const handleEndCall = () => {
  //   try {
  //     let tracks = localVideoRef.current.srcObject.getTracks();
  //     tracks.forEach((track) => track.stop());
  //   } catch (error) {
  //     console.log(error);
  //   }
  //   navigate("/home");
  // };

  const handleEndCall = () => {
    try {
      // 🔴 Stop all local media tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // 🔴 Close all peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};

      // 🔴 Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // 🔴 Clear video UI
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } catch (error) {
      console.error("Error ending call:", error);
    }

    navigate("/home");
  };

  // let getDisplayMediaSuccess = (stream) => {
  //   try {
  //     window.localStream.getTracks().forEach((track) => {
  //       track.stop();
  //     });
  //     // window.localStream.addTrack(stream);
  //   } catch (error) {
  //     console.log("error: ", error);
  //   }
  //   window.localStream = stream;
  //   // update the video player
  //   localVideoRef.current.srcObject = window.localStream;

  //   // for(let id in connections){
  //   //   if(id === socketIdRef.current) continue;

  //   //   connections[id].addStream(window.localStream);
  //   //   connections[id].createOffer().then((description) => {
  //   //     connections[id]
  //   //     .setLocalDescription(description)
  //   //     .then(() => {
  //   //       socketRef.current.emit("signal",id,JSON.stringify({"sdp": connections[id].localDescription}))
  //   //     })
  //   //   })

  //   // }

  //   getUserMedia();
  // };

  // let getDisplayMedia = async () => {
  //   console.log("getDisplayMedia started ", screen);
  //   if (screen) {
  //     if (navigator.mediaDevices.getDisplayMedia) {
  //       navigator.mediaDevices
  //         .getDisplayMedia({ video: true, audio: true })
  //         .then(getDisplayMediaSuccess)
  //         .then((stream) => {
  //           {
  //           }
  //         })
  //         .catch((error) => console.log("error: ", error));
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (screen !== undefined) {
  //     getDisplayMedia();
  //   }
  // }, [screen]);

  useEffect(() => {
    return () => {
      Object.values(peerConnections.current).forEach((pc) => pc.close());

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // const handleScreen = () => {
  //   setScreen(!screen);
  // };

  const handleChatOpen = () => {
    setShowModal(!showModal);
  };

  const handleChatClose = () => {
    setShowModal(false);
  };

  let openChat = () => {
    setShowModal(true);
    setNewMessages(0);
  };
  let closeChat = () => {
    setShowModal(false);
  };
  let handleMessage = (e) => {
    setMessage(e.target.value);
  };

  // const addMessage = (data, sender, socketIdSender) => {
  //     setMessages((prevMessages) => [
  //         ...prevMessages,
  //         { sender: sender, data: data }
  //     ]);
  //     if (socketIdSender !== socketIdRef.current) {
  //         setNewMessages((prevNewMessages) => prevNewMessages + 1);
  //     }
  // };

  let sendMessage = () => {
    console.log(socketRef.current);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");

    // this.setState({ message: "", sender: username })
  };

  const totalUsers = videos.length + 1;

  // const getGrid = () => {
  //   if (totalUsers <= 1) return "grid-cols-1";
  //   if (totalUsers === 2) return "grid-cols-2";
  //   if (totalUsers <= 4) return "grid-cols-2";
  //   if (totalUsers <= 6) return "grid-cols-3";
  //   return "grid-cols-4";
  // };

  return (
    <div className="flex min-h-screen flex-col bg-gray-800 text-white">
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
              <video
                ref={(ref) => {
                  localVideoRef.current = ref;
                  // if (ref && window.localStream) {
                  if (ref && localStreamRef.current) {
                    ref.srcObject = localStreamRef.current;
                  }
                }}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                You
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
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-1 rounded">
                  User
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
          className="p-3 bg-gray-700 rounded-full hover:bg-gray-600"
        >
          {video ? <VideocamIcon /> : <VideocamOffIcon />}
        </button>

        <button
          disabled={!mediaReady}
          onClick={handleAudio}
          className="p-3 bg-gray-700 rounded-full hover:bg-gray-600"
        >
          {audio ? <MicIcon /> : <MicOffIcon />}
        </button>

        {screenAvailable && (
          <button
            disabled={!mediaReady}
            onClick={handleScreen}
            className="p-3 bg-gray-700 rounded-full hover:bg-gray-600"
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
