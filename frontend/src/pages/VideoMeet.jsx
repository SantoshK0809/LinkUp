import React, { useEffect, useRef, useState } from "react";
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
// import { set } from "mongoose";

const server = `${import.meta.env.VITE_BASE_URL}`;
var connections = {};
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
  const videoRef = useRef();

  let [audioAvailable, setAudioAvailable] = useState(true);
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState(true);

  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setShowModal] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState();
  let [newMessages, setNewMessages] = useState(0);

  let [askForUsername, setAskForUsername] = useState(true);
  let [userName, setUserName] = useState("");
  let [videos, setVideos] = useState([]);
  let [cam, setCam] = useState(true);

  const getPermission = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      const screenPermission = await navigator.mediaDevices.getDisplayMedia({
        screen: true,
      });
      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoPermission && audioPermission) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log("Error getting permissions: ", error);
    }
  };

  useEffect(() => {
    getPermission();
  }, []);

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      // Proceed with getting user media
      navigator.mediaDevices
        .getUserMedia({ video: videoAvailable, audio: audioAvailable })
        .then((stream) => {
          window.localStream = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.log("Error accessing media devices: ", error);
        });
    } else {
      try {
        let track = localVideoRef.current.srcObject.getTracks();
        track.forEach((t) => {
          t.stop();
        });
        localVideoRef.current.srcObject = null;
      } catch (error) {
        console.log("Error stopping media tracks: ", error);
      }
    }
  };

  // The useEffect below was removed because fetching a new stream on every toggle breaks WebRTC connections
  // useEffect(() => {
  //   if (video !== undefined && audio !== undefined) {
  //     getUserMedia();
  //   }
  // }, [video, audio]);

  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log("Error getting user media: ", error);
    }
    window.localStream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) {
        continue;
      }
      connections[id].addStream(window.localStream);
      connections[id]
        .createOffer()
        .then((description) => {
          connections[id].setLocalDescription(description);
        })
        .then(() => {
          socketIdRef.current.emit(
            "signal",
            id,
            JSON.stringify({ sdp: connections[id].localDescription }),
          );
        })
        .catch((err) => console.log("addStream Error: ", err));
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setVideo(false);
          setAudio(false);
          setScreen(false);
          try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            // localVideoRef.current.srcObject = null;
          } catch (error) {
            console.log("Error stopping track: ", error);
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;

          for (let id in connections) {
            // if(id === socketIdRef.current){
            //   continue;
            // }

            connections[id].addStream(window.localStream);
            connections[id]
              .createOffer()
              .then((description) => {
                connections[id].setLocalDescription(description);
              })
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id,
                  JSON.stringify({ sdp: connections[id].localDescription }),
                );
              })
              .catch((err) => console.log("addStream Error: ", err));

            // console.log("Error removing stream: ", error);
          }
        }),
    );
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

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        }),
                      );
                    })
                    .catch((err) =>
                      console.log("setLocalDescription Error: ", err),
                    );
                })
                .catch((err) => console.log("createAnswer Error: ", err));
            }
          })
          .catch((err) => console.log("setRemoteDescription Error: ", err));
      }
      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((err) => console.log("addIceCandidate Error: ", err));
      }
    }
  };

  let addMessage = (data, sender) => {};

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((prevVideos) => prevVideos.filter((v) => v.socketId !== id));
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(
            peerConfigConnections,
          );
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate !== null) {
              socketRef.current.emit(
                "signal",
                socketListId,
                JSON.stringify({ ice: event.candidate }),
              );
            }
          };

          connections[socketListId].onaddStream = (event) => {
            let videoExists = videoRef.current.find(
              (v) => v.socketId === socketListId,
            );
            if (videoExists) {
              setVideos((videos) => {
                const updatedVideo = videos.map((video) =>
                  video.socketId === socketListId
                    ? { ...video, stream: event.stream }
                    : video,
                );
                videoRef.current = updatedVideo;
                return updatedVideo;
              });
            } else {
              let newVideo = {
                socketId: socketListId,
                stream: event.stream,
                autoPlay: true,
                playsinline: true,
              };
              setVideos((videos) => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
              });
            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            // TODO BLACKSILENCE
            // let blackSlience
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) {
              continue;
            }

            try {
              connections[id2].addStream(window.localStream);
            } catch (error) {}
            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socketRef.current.emit(
                    "signal",
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription }),
                  );
                })
                .catch((e) => {
                  console.log(e);
                });
            });
          }
        }
      });
    });
  };

  let getMedia = async () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    setScreen(screenAvailable);
    connectToSocketServer();
  };

  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  const handleVideo = () => {
    const newState = !video;
    setVideo(newState);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
    }
  };

  const handleAudio = () => {
    const newState = !audio;
    setAudio(newState);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((track) => {
        track.enabled = newState;
      });
    }
  };

  const handleEndCall = () => {
    socketRef.current.disconnect();
    setAskForUsername(true);
    window.location.reload();
  };

  const handleScreen = () => {
    setScreen(!screenAvailable);
  };

  const handleChatOpen = () => {
    setModal(!showModal);
  };

  const handleChatClose = () => {
    setModal(false);
  };

  //   return (
  //     <div>
  //       {askForUsername === true ? (
  //         <div>
  //           <h2>Enter into Lobby</h2>
  //           <TextField
  //             id="outlined-basic"
  //             label="username"
  //             variant="outlined"
  //             value={userName}
  //             onChange={(e) => setUserName(e.target.value)}
  //           />
  //           <Button variant="contained" onClick={connect}>
  //             Join
  //           </Button>
  //           <div>
  //             <video ref={localVideoRef} autoPlay muted></video>
  //           </div>
  //         </div>
  //       ) : (
  //         <>
  //           <video ref={localVideoRef} autoPlay muted></video>
  //           {videos.map((video) => (
  //             <div key={video.socketId}>
  //               <h2>{video.socketId}</h2>
  //               <video
  //                 autoPlay
  //                 data-socket={video.socketId}
  //                 ref={(ref) => {
  //                   if (ref && video.stream) {
  //                     ref.srcObject = video.stream;
  //                   }
  //                 }}
  //               ></video>

  //             </div>
  //           ))}
  //         </>
  //       )}
  //     </div>
  //   );
  // };
  // export default VideoMeet;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ================= LOBBY ================= */}
      {askForUsername === true ? (
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md bg-gray-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold">Enter Lobby</h2>
              <p className="text-gray-400 text-sm">
                Set your name and preview camera
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Enter username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <button
                onClick={connect}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-medium"
              >
                Join
              </button>
            </div>

            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-gray-700">
              <video
                ref={(ref) => {
                  localVideoRef.current = ref;
                  if (ref && window.localStream) {
                    ref.srcObject = window.localStream;
                  }
                }}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ================= MEETING ================= */
        <div className="relative h-screen w-full overflow-hidden">
          {/* ===== Chat Drawer ===== */}
          {showModal && (
            <div className="absolute right-0 top-0 h-full w-full sm:w-96 bg-gray-800 shadow-2xl z-50 flex flex-col">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Chat</h2>
                <button onClick={() => setModal(false)}>✕</button>
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
            </div>
          )}

          {/* ===== Main Video (You) ===== */}
          <video
            ref={(ref) => {
              localVideoRef.current = ref;
              if (ref && window.localStream) {
                ref.srcObject = window.localStream;
              }
            }}
            autoPlay
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* ===== Participants Grid ===== */}
          <div className="absolute inset-0 p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {videos.map((video) => (
              <div
                key={video.socketId}
                className="bg-black rounded-xl overflow-hidden border border-gray-700"
              >
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream;
                    }
                  }}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* ===== Bottom Controls ===== */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-gray-800/80 backdrop-blur px-6 py-3 rounded-full shadow-lg">
            <button
              onClick={handleVideo}
              className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
            >
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </button>

            <button
              onClick={handleAudio}
              className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
            >
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </button>

            {screenAvailable && (
              <button
                onClick={handleScreen}
                className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600"
              >
                {screen === true ? (
                  <StopScreenShareIcon />
                ) : (
                  <ScreenShareIcon />
                )}
              </button>
            )}

            {/* <button
              onClick={() => setModal(!showModal)}
              className="relative p-3 bg-gray-700 rounded-full hover:bg-gray-600"
            >
              💬<ChatIcon/>
              {newMessages > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-xs px-1.5 rounded-full">
                  {newMessages}
                </span>
              )}
            </button> */}

            <Badge
              badgeContent={newMessages}
              color="secondary"
              onClick={() => setModal(!showModal)}
              className="relative cursor-pointer"
            >
              {showModal ? (
                <ChatBubbleIcon className="text-white bg-gray-700 rounded-full hover:bg-gray-600 text-2xl" />
              ) : (
                <ChatIcon className="text-white bg-gray-700 rounded-full hover:bg-gray-600 text-2xl" />
              )}
            </Badge>

            <button
              onClick={handleEndCall}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-500"
            >
              <CallEndIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default VideoMeet;
