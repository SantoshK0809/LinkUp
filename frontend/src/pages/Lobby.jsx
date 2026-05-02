import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@mui/material";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ArrowLeft,
} from "lucide-react";
import LoggedInNav from "../components/LoggedInNav";

const Lobby = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [username, setUsername] = useState("");
  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [permissionError, setPermissionError] = useState(null);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setPermissionError(
          "We couldn't access your camera or microphone. Please grant permission.",
        );
      }
    };

    start();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  //   const toggleCam = () => {
  //     if (camOn) {
  //       streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = false));
  //       setCamOn(false);
  //     } else {
  //       streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = true));
  //       setCamOn(true);
  //     }
  //   };

  const toggleCam = () => {
    const newState = !camOn;
    setCamOn(newState);
    if (window.localStream) {
      window.localStream.getVideoTracks().forEach((track) => {
        track.enabled = newState;
      });
    }
  };

  const toggleMic = () => {
    const next = !micOn;
    setMicOn(next);
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next));
  };

  const handleJoin = () => {
    if (!username.trim()) {
      toast.error("Please enter your name");
      return;
    }
    const getCode = localStorage.getItem("meetingCode");
    console.log(getCode);
    // setCode(getCode);
    navigate(`/meet/${getCode}`, {
      state: { username: username.trim(), camOn, micOn },
    });
  };

  return (
    <>
      <LoggedInNav />
      <div className="min-h-screen bg-white text-foreground">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <button
            onClick={() => navigate("/home")}
            className="mb-8 inline-flex items-center gap-2 text-sm text-black transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </button>

          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            {/* Video preview */}
            <div>
              <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-gray-300 shadow-sm">
                {camOn && !permissionError ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover [transform:scaleX(-1)]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="flex h-20 w-20 items-center justify-center bg-white rounded-full bg-card text-2xl font-semibold text-muted-foreground shadow-soft">
                      {username ? username[0].toUpperCase() : "?"}
                    </div>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/50 to-transparent p-4">
                  <button
                    onClick={toggleMic}
                    aria-label="Toggle microphone"
                    className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors ${
                      micOn ? "bg-white text-black" : "bg-red-500 text-red-100"
                    }`}
                  >
                    {micOn ? (
                      <Mic className="h-5 w-5" />
                    ) : (
                      <MicOff className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    onClick={toggleCam}
                    aria-label="Toggle camera"
                    className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors ${
                      camOn ? "bg-white text-black" : "bg-red-500 text-red-100"
                    }`}
                  >
                    {camOn ? (
                      <VideoIcon className="h-5 w-5" />
                    ) : (
                      <VideoOff className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {permissionError && (
                <p className="mt-3 text-sm text-destructive">
                  {permissionError}
                </p>
              )}
            </div>

            {/* Join form */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Meeting code
              </p>

              <p className="mt-1 font-mono text-sm text-gray-600">{code}</p>

              <h1 className="mt-6 text-3xl text-gray-700 font-medium tracking-tight sm:text-4xl">
                Ready to join?
              </h1>

              <p className="mt-2 text-gray-600">
                Enter your name to enter the meeting.
              </p>

              <div className="mt-6 space-y-3">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  placeholder="Your name"
                  className="w-full rounded-full bg-white text-gray-600 border border-border bg-card px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/30"
                />

                <button
                  onClick={handleJoin}
                  className="w-full rounded-full bg-blue-500 cursor-pointer text-white py-3 text-base hover:bg-blue-600"
                >
                  Join meeting
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lobby;
