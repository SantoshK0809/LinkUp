import React, { useEffect, useRef, useState } from "react";
import { TextField, Button } from "@mui/material";
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

  let getUserMediaSuccess = (stream) => {};

  let getUserMedia = async () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      // Proceed with getting user media
      navigator.mediaDevices
        .getUserMedia({ video: videoAvailable, audio: audioAvailable })
        .then(() => {})
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

  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [video, audio]);

  let gotMessageFromServer = (fromId, message) => {
    if (fromId !== socketIdRef.current) {
      if (message.type === "offer") {
        let peer = new RTCPeerConnection(peerConfigConnections);
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
              connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit(
                  "signal",
                  id2,
                  JSON.stringify({ sdp: connections[id2].localDescription }),
                );
              })
              .catch(e => {
                console.log(e);
              })
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

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="username"
            variant="outlined"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Join
          </Button>
          <div>
            <video ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default VideoMeet;
