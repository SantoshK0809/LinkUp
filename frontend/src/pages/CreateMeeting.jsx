import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideocamIcon from "@mui/icons-material/Videocam";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WithAuth from "../utils/WithAuth";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoggedInNav from "../components/LoggedInNav";

const CreateMeeting = () => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [meetingCode, setMeetingCode] = useState("");
  const [created, setCreated] = useState(false);

  const validateInputs = () => {
    let newErrors = {};

    if (!date) {
      newErrors.date = "Date is required";
    }

    if (!time) {
      newErrors.time = "Time is required";
    }

    if (date && time) {
      const selectedDateTime = new Date(`${date}T${time}`);
      const now = new Date();

      if (selectedDateTime <= now) {
        newErrors.time = "Time must be in the future";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // TEMP: simulate backend
  const generateCode = () => {
    if (!validateInputs()) {
      return;
    }

    const code = Math.random().toString(36).substring(2, 10);
    setMeetingCode(code);
    setCreated(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingCode);
  };

  return (
    <>
      <LoggedInNav />

      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-25 items-center">
          {/* ===== LEFT: ILLUSTRATION ===== */}
          <div className="flex justify-center">
            <img
              src="/meeting.svg.svg"
              alt="meeting"
              className="w-full max-w-md"
            />
          </div>

          {/* ===== RIGHT: CARD ===== */}
          <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6">
            {!created ? (
              <>
                {/* HEADER */}
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold text-gray-800">
                    Create Meeting
                  </h1>
                  <p className="text-sm text-gray-500">
                    Start instantly or schedule for later
                  </p>
                </div>

                {/* TOGGLE */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsScheduled(false)}
                    className={`flex-1 py-2 text-sm rounded-md transition ${
                      !isScheduled
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    Instant
                  </button>
                  <button
                    onClick={() => setIsScheduled(true)}
                    className={`flex-1 py-2 text-sm rounded-md transition ${
                      isScheduled
                        ? "bg-white shadow text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    Schedule
                  </button>
                </div>

                {/* DATE + TIME */}
                {isScheduled && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* <input
                      type="date"
                      value={date}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    /> */}

                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setDate(e.target.value)}
                      className={`flex-1 border px-3 py-2 rounded-lg text-sm outline-none ${
                        errors.date ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                    )}

                    {/* <input
                      type="time"
                      value={time}
                      required
                      min={new Date().toISOString().split("T")[1]}
                      onChange={(e) => setTime(e.target.value)}
                      className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    /> */}

                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      min={new Date().toISOString().split("T")[1]}
                      className={`flex-1 border px-3 py-2 rounded-lg text-sm outline-none ${
                        errors.time ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.time && (
                      <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                    )}
                  </div>
                )}

                {/* BUTTON */}
                <button
                  onClick={generateCode}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  <VideocamIcon fontSize="small" />
                  {isScheduled ? "Schedule Meeting" : "Start Meeting"}
                </button>
              </>
            ) : (
              <>
                {/* SUCCESS */}
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold text-green-600">
                    Meeting Created
                  </h1>
                  <p className="text-sm text-gray-500">
                    Share this code to join
                  </p>
                </div>

                {/* CODE */}
                <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                  <span className="font-mono text-sm tracking-wider">
                    {meetingCode}
                  </span>

                  <IconButton onClick={copyToClipboard}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/meet/${meetingCode}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm"
                  >
                    Create Meeting
                  </button>

                  <button
                    onClick={generateCode}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm"
                  >
                    New Code
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const CreateMeetingWithAuth = WithAuth(CreateMeeting);
export default CreateMeetingWithAuth;
