import React, { useRef, useState } from "react";

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

  return <div>VideoMeet</div>;
};

export default VideoMeet;
