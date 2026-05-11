// import React, { useState } from "react";
// import WithAuth from "../utils/WithAuth";
// import { useNavigate } from "react-router-dom";
// import { Button, TextField } from "@mui/material";
// import LoggedInNav from "../components/LoggedInNav";
// import { useContext } from "react";
// import { AuthContextData } from "../context/AuthContext.jsx";
// import { Import } from "lucide-react";
// import axios from "axios";
// import { io } from "socket.io-client";

// const Home = () => {
//   const navigate = useNavigate();
//   const [meetingCode, setMeetingCode] = useState("");
//   const [error, setError] = useState("");
//   const [message, setMessage] = useState("");
//   const { addToUserHistory } = useContext(AuthContextData);
//   const server = import.meta.env.VITE_BASE_URL;
//   const socket = io(server);

//   const handleVideoCall = async () => {
//     try {
//       if (!meetingCode.trim()) return;

//       // const res = await axios.post(
//       //   `${Import.meta.env.VITE_BASE_URL}/api/v1/users/validate-meeting`,
//       //   {
//       //     meetingCode,
//       //   },
//       // );

//       // socket.emit('join-call', meetingCode);

//       // // if (res.status === 200) {
//       //   const token = localStorage.getItem("token");
//       //   await addToUserHistory(token, meetingCode);
//       //   localStorage.setItem("meetingCode", meetingCode);
//       //   // addToUserHistory(meetingCode);
//       //   navigate(`/lobby/${meetingCode}`);
//       // //}

//       socket.emit("join-call", {
//         roomId: meetingCode,
//         userName: "Santosh",
//       });

//       socket.on("join-approved", ({ roomId }) => {
//         setMessage("Join approved");
//         setTimeout(() => {
//           // setMessage("");
//           navigate(`/lobby/${roomId}`);
//         }, 2000);
//       });

//       socket.on("join-error", (message) => {
//         // alert(message)
//         setError(message);
//         setTimeout(() => {
//           setError("");
//         }, 2000);
//       });
//     } catch (error) {
//       console.error("Error validating meeting code:", error);
//     }
//   };

//   return (
//     <div className="h-screen flex flex-col">
//       <LoggedInNav />

//       {/* {error && (
//         <Snackbar
//           open={!!error}
//           autoHideDuration={3000}
//           onClose={() => setError("")}
//           message={error}
//         />
//       )} */}

//       {error && (
//         <div className="p-3 fixed top-4 left-1/2 font-semibold transform -translate-x-1/2 bg-red-500 text-white border border-red-400 text-red-700 rounded text-sm text-center">
//           <span> ⚠ </span>
//           {error}
//         </div>
//       )}
//       {message && (
//         <div className="p-3 fixed top-4 left-1/2 font-semibold transform -translate-x-1/2 bg-green-400 text-white border border-green-400 text-green-700 rounded text-sm text-center">
//           <span> ✓ </span>
//           {message}
//         </div>
//       )}

//       {/* Main Section */}
//       <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-6 gap-10">
//         {/* LEFT: Meeting Join */}
//         <div className="flex flex-col gap-4 w-full max-w-md">
//           <h2 className="text-2xl font-semibold">Join a Meeting</h2>

//           <TextField
//             label="Meeting Code"
//             variant="outlined"
//             fullWidth
//             value={meetingCode}
//             onChange={(e) => setMeetingCode(e.target.value)}
//           />

//           <Button variant="contained" onClick={handleVideoCall} fullWidth>
//             Join Call
//           </Button>
//         </div>

//         {/* RIGHT: Image */}
//         <div className="w-full max-w-md flex justify-center">
//           <img
//             src="/videocall.svg"
//             alt="Video Call"
//             className="w-full max-w-sm object-contain"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default WithAuth(Home);

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
