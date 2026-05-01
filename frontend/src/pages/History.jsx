import React, { useContext, useEffect } from "react";
import WithAuth from "../utils/WithAuth";
import { AuthContextData } from "../context/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoggedInNav from "../components/LoggedInNav";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";

const History = () => {
  const { getUserHistory } = useContext(AuthContextData);
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const routeTo = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    const fetchHistory = async () => {
      try {
        const historyData = await getUserHistory(token);
        console.log("History Data", historyData);
        setMeetings(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  return (
    <>
      <LoggedInNav />
      <div className="min-h-screen bg-white text-black p-6">
        {/* ===== HEADER ===== */}
        {/* <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <IconButton
            onClick={() => routeTo("/home")}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <HomeIcon />
          </IconButton>

          <h1 className="text-2xl font-semibold tracking-wide">
            Meeting History
          </h1>
        </div>

        <p className="text-gray-400 text-sm">
          {meetings.length} {meetings.length === 1 ? "meeting" : "meetings"}
        </p>
      </div> */}

        {/* ===== GRID ===== */}
        {meetings.length !== 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {meetings.map((e, i) => (
              <div
                key={i}
                className="group relative bg-gray-300/70 backdrop-blur-md border border-gray-700 rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-blue-500/10 to-purple-500/10" />

                {/* Content */}
                <div className="relative z-10 flex flex-col gap-4">
                  {/* Meeting Code */}
                  <div>
                    <p className="text-gray-700 text-xs uppercase tracking-wide">
                      Meeting Code
                    </p>
                    <h2 className="text-lg font-semibold text-black break-all">
                      {e.meetingCode}
                    </h2>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 text-xs uppercase tracking-wide">
                        Date
                      </p>
                      <p className="text-sm text-gray-700">
                        {formatDate(e.date)}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span className="text-xs px-3 py-1 rounded-full bg-green-400/20 text-green-700">
                      Completed
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2  text-white mt-2">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm py-2 rounded-lg transition">
                      Rejoin
                    </button>
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-sm py-2 rounded-lg transition">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ===== EMPTY STATE ===== */
          <div className="flex flex-col items-center justify-center mt-24 text-center text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-lg font-medium">No meetings yet</h2>
            <p className="text-sm">Your meeting history will appear here</p>
          </div>
        )}
      </div>
    </>
  );
};

const HistoryWithAuth = WithAuth(History);
export default HistoryWithAuth;
