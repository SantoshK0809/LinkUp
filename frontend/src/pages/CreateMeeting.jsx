import React, { useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideocamIcon from "@mui/icons-material/Videocam";
import WithAuth from "../utils/WithAuth";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoggedInNav from "../components/LoggedInNav";
import axios from "axios";

const CreateMeeting = () => {
  const navigate = useNavigate();

  const [created, setCreated] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduleDate: "",
    startTime: "",
    endTime: "",
    allowEarlyJoin: true,
    earlyJoinMinutes: 10,
    requireHostToStart: true,
  });

  const validateInputs = () => {
    let newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Meeting title is required";
    }

    if (!formData.scheduleDate) {
      newErrors.scheduleDate = "Date is required";
    }

    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    const startDateTime = new Date(
      `${formData.scheduleDate}T${formData.startTime}`,
    );

    const endDateTime = new Date(
      `${formData.scheduleDate}T${formData.endTime}`,
    );

    const now = new Date();

    if (startDateTime <= now) {
      newErrors.startTime = "Start time must be in future";
    }

    if (endDateTime <= startDateTime) {
      newErrors.endTime = "End time must be after start time";
    }

    if (
      formData.allowEarlyJoin &&
      (!formData.earlyJoinMinutes || formData.earlyJoinMinutes < 1)
    ) {
      newErrors.earlyJoinMinutes = "Early join minutes must be greater than 0";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const generateMeetingCode = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const handleCreateMeeting = async () => {
    try {
      if (!validateInputs()) return;

      setLoading(true);

      const generatedCode = generateMeetingCode();

      const scheduledStart = new Date(
        `${formData.scheduleDate}T${formData.startTime}`,
      );

      const scheduledEnd = new Date(
        `${formData.scheduleDate}T${formData.endTime}`,
      );

      const payload = {
        title: formData.title,
        description: formData.description,
        meetingCode: generatedCode,
        startDate: formData.scheduleDate,
        startTime: scheduledStart,
        endTime: scheduledEnd,

        settings: {
          allowEarlyJoin: formData.allowEarlyJoin,
          earlyJoinMinutes: Number(formData.earlyJoinMinutes),
          requireHostToStart: formData.requireHostToStart,
        },
      };

      const token = localStorage.getItem("token");

      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/v1/users/create-meeting`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMeetingCode(generatedCode);
      setCreated(true);
    } catch (error) {
      console.error("Meeting creation failed", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingCode);
  };

  return (
    <>
      <LoggedInNav />

      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* LEFT IMAGE */}
          <div className="flex justify-center">
            <img
              src="/meeting.svg.svg"
              alt="meeting"
              className="w-full max-w-md"
            />
          </div>

          {/* RIGHT CARD */}
          <div className="w-full max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
            {!created ? (
              <>
                {/* HEADER */}
                <div>
                  <h1 className="text-2xl font-semibold text-gray-800">
                    Schedule Meeting
                  </h1>

                  <p className="text-sm text-gray-500 mt-1">
                    Fill meeting details below
                  </p>
                </div>

                {/* TITLE */}
                <div className="space-y-1">
                  <input
                    type="text"
                    placeholder="Meeting Title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        title: e.target.value,
                      })
                    }
                    className={`w-full border px-4 py-3 rounded-xl text-sm outline-none ${
                      errors.title ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  {errors.title && (
                    <p className="text-red-500 text-xs">{errors.title}</p>
                  )}
                </div>

                {/* DESCRIPTION */}
                <div>
                  <textarea
                    rows={4}
                    placeholder="Meeting Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 px-4 py-3 rounded-xl text-sm outline-none resize-none"
                  />
                </div>

                {/* DATE */}
                <div className="space-y-1">
                  <label className="text-sm m-2">Date</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.scheduleDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleDate: e.target.value,
                      })
                    }
                    className={`w-full border px-4 py-3 rounded-xl text-sm outline-none ${
                      errors.scheduleDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  {errors.scheduleDate && (
                    <p className="text-red-500 text-xs">
                      {errors.scheduleDate}
                    </p>
                  )}
                </div>

                {/* TIME */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label id="start" className="text-sm m-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          startTime: e.target.value,
                        })
                      }
                      className={`w-full border px-4 py-3 rounded-xl text-sm outline-none ${
                        errors.startTime ? "border-red-500" : "border-gray-300"
                      }`}
                    />

                    {errors.startTime && (
                      <p className="text-red-500 text-xs">{errors.startTime}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm m-2">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          endTime: e.target.value,
                        })
                      }
                      className={`w-full border px-4 py-3 rounded-xl text-sm outline-none ${
                        errors.endTime ? "border-red-500" : "border-gray-300"
                      }`}
                    />

                    {errors.endTime && (
                      <p className="text-red-500 text-xs">{errors.endTime}</p>
                    )}
                  </div>
                </div>

                {/* SETTINGS */}
                <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 space-y-4">
                  <h2 className="text-sm font-semibold text-gray-700">
                    Meeting Settings
                  </h2>

                  {/* ALLOW EARLY JOIN */}
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.allowEarlyJoin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowEarlyJoin: e.target.checked,
                        })
                      }
                    />
                    Allow Early Join
                  </label>

                  {/* EARLY JOIN MINUTES */}
                  {formData.allowEarlyJoin && (
                    <div className="space-y-1">
                      <input
                        type="number"
                        min={1}
                        placeholder="Early Join Minutes"
                        value={formData.earlyJoinMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            earlyJoinMinutes: e.target.value,
                          })
                        }
                        className={`w-full border px-4 py-3 rounded-xl text-sm outline-none ${
                          errors.earlyJoinMinutes
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />

                      {errors.earlyJoinMinutes && (
                        <p className="text-red-500 text-xs">
                          {errors.earlyJoinMinutes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* REQUIRE HOST */}
                  <label className="flex items-center gap-3 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.requireHostToStart}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requireHostToStart: e.target.checked,
                        })
                      }
                    />
                    Require Host To Start
                  </label>
                </div>

                {/* BUTTON */}
                <button
                  onClick={handleCreateMeeting}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl text-sm font-medium transition"
                >
                  <VideocamIcon fontSize="small" />

                  {loading ? "Creating..." : "Create Scheduled Meeting"}
                </button>
              </>
            ) : (
              <>
                {/* SUCCESS */}
                <div className="space-y-1">
                  <h1 className="text-2xl font-semibold text-green-600">
                    Meeting Created Successfully
                  </h1>

                  <p className="text-sm text-gray-500">
                    Share this meeting code with participants
                  </p>
                </div>

                {/* MEETING CODE */}
                <div className="flex items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50">
                  <span className="font-mono text-lg tracking-widest">
                    {meetingCode}
                  </span>

                  <IconButton onClick={copyToClipboard}>
                    <ContentCopyIcon />
                  </IconButton>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate(`/lobby/${meetingCode}`)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium"
                  >
                    Join Meeting
                  </button>

                  <button
                    onClick={() => navigate("/home")}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl text-sm font-medium"
                  >
                    Home
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
