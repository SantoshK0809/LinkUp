import React, { useState, useEffect, useRef } from "react";
import WithAuth from "../utils/WithAuth";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import LoggedInNav from "../components/LoggedInNav";
import { useContext } from "react";
import { AuthContextData } from "../context/AuthContext.jsx";
import { io } from "socket.io-client";
import servers from "../environment.js";

const server = servers;

const Home = () => {
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  const { addToUserHistory, userData } = useContext(AuthContextData);

  useEffect(() => {
    socketRef.current = io(server);
    const socket = socketRef.current;
    socket.on("join-approved", async ({ roomId }) => {
      setMessage("Join approved");

      const token = localStorage.getItem("token");

      await addToUserHistory(token, roomId);

      localStorage.setItem("meetingCode", roomId);

      setTimeout(() => {
        navigate(`/lobby/${roomId}`);
      }, 2000);
    });

    socket.on("join-error", (msg) => {
      setError(msg);

      setTimeout(() => {
        setError("");
      }, 2000);
    });

    return () => {
      socket.off("join-approved");
      socket.off("join-error");
      socket.disconnect();
    };
  }, []);

  const handleVideoCall = () => {
    if (!meetingCode.trim()) return;

    socketRef.current.emit("join-call", {
      roomId: meetingCode,
      userName: userData?.name || "User",
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <LoggedInNav />

      <div className="flex justify-center mt-4 top-20">
        {error && (
          <div className="p-3 fixed top-4 left-1/2 font-semibold transform -translate-x-1/2 bg-red-500 text-white rounded text-sm text-center z-50">
            ⚠ {error}
          </div>
        )}

        {message && (
          <div className="p-3 fixed top-4 left-1/2 font-semibold transform -translate-x-1/2 bg-green-500 text-white rounded text-sm text-center z-50">
            ✓ {message}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-6 gap-10">
        <div className="flex flex-col gap-4 w-full max-w-md">
          <h2 className="text-2xl font-semibold">Join a Meeting</h2>

          <TextField
            label="Meeting Code"
            variant="outlined"
            fullWidth
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
          />

          <Button variant="contained" onClick={handleVideoCall} fullWidth>
            Join Call
          </Button>
        </div>

        <div className="w-full max-w-md flex justify-center">
          <img
            src="/videocall.svg"
            alt="Video Call"
            className="w-full max-w-sm object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default WithAuth(Home);
