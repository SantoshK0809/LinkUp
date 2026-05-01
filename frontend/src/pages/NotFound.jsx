import React from "react";
import { useNavigate } from "react-router-dom";
import LoggedInNav from "../components/LoggedInNav";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <>
      <LoggedInNav />

      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* ===== LEFT: ILLUSTRATION ===== */}
          <div className="flex justify-center">
            <img
              src="/Notfound.svg"
              alt="Not Found"
              className="w-full max-w-md"
            />
          </div>

          {/* ===== RIGHT: CONTENT ===== */}
          <div className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-6 text-center md:text-left">
            {/* TITLE */}
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Page Not Found
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                The page you are looking for doesn’t exist or has been moved.
              </p>
            </div>

            {/* EXTRA INFO (optional but useful) */}
            <div className="text-sm text-gray-400">
              <p>If you entered a meeting code, it may be:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Incorrect</li>
                <li>Expired</li>
                <li>Not started yet</li>
              </ul>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/home")}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm transition"
              >
                Go Home
              </button>

              <button
                onClick={() => navigate("/meet/")}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg text-sm transition"
              >
                Join Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
