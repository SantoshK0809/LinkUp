import { useState } from "react";
import "./App.css";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";

import AuthProvider from "./context/AuthContext";
import VideoMeet from "./pages/VideoMeet";
import Home from "./pages/Home";
import HistoryWithAuth from "./pages/History";
import CreateMeeting from "./pages/CreateMeeting";
import NotFound from "./pages/NotFound";
import Lobby from "./pages/Lobby";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/history" element={<HistoryWithAuth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/create-meeting" element={<CreateMeeting />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/meet/:url" element={<VideoMeet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
