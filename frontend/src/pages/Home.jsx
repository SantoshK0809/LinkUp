// import React, { useState } from "react";
// import WithAuth from "../utils/WithAuth";
// import { NavLink, useNavigate } from "react-router-dom";
// import { Button, TextField } from "@mui/material";
// import LoggedInNav from "../components/LoggedInNav";

// const Home = () => {
//   const navigate = useNavigate();
//   const [meetingCode, setMeetingCode] = useState("");

//   let handleVideoCall = () => {
//     // const url = uuidv4();
//     navigate(`/${meetingCode}`);
//   };
//   return (
//     <div>
//       <LoggedInNav />
//       <div className="flex items-center w-1/2 justify-center absolute top-1/2 gap-4 rounded-">
//         <TextField
//           label="Meeting Code"
//           value={meetingCode}
//           onChange={(e) => setMeetingCode(e.target.value)}
//         />
//         <Button variant="contained" onClick={handleVideoCall}>
//           Join Call
//         </Button>
//       </div>
//       <div>
//         <img src="./VC_logo.mhtml" alt="logo" />
//       </div>
//     </div>
//   );
// };

// const HomeWithAuth = WithAuth(Home);

// export default HomeWithAuth;

import React, { useState } from "react";
import WithAuth from "../utils/WithAuth";
import { useNavigate } from "react-router-dom";
import { Button, TextField } from "@mui/material";
import LoggedInNav from "../components/LoggedInNav";
import { useContext } from "react";
import { AuthContextData } from "../context/AuthContext.jsx";

const Home = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContextData);

  const handleVideoCall = async () => {
    if (!meetingCode.trim()) return;
    const token = localStorage.getItem("token");
    await addToUserHistory(token, meetingCode);
    navigate(`/meet/${meetingCode}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <LoggedInNav />

      {/* Main Section */}
      <div className="flex flex-1 flex-col md:flex-row items-center justify-center px-6 gap-10">
        {/* LEFT: Meeting Join */}
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

        {/* RIGHT: Image */}
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
