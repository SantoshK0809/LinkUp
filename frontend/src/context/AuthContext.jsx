import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import httpStatus from "http-status";

export const AuthContextData = createContext();

const client = axios.create({
  baseURL: "http://localhost:3000/api/v1/users",
  headers: {
    "Content-Type": "application/json",
  },
});

const AuthProvider = ({ children }) => {
  const authContext = useContext(AuthContextData);

  const [userData, setUserData] = useState(authContext);

  const handleRegister = async (name, username, password) => {
    try {
      const res = await client.post(`/register`, {
        name,
        username,
        password,
      });
      console.log(res.data);

      if (res.status === httpStatus.CREATED) {
        return res.data;
      }
    } catch (error) {
      console.log(`Error in handleRegister ${error}`);
      throw error;
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const res = await client.post("/login", { username, password });
      console.log(res.data);

      if (res.status === httpStatus.OK) {
        localStorage.setItem("token", res.data.token);
        setUserData(res.data);
        return res.data;
      }
    } catch (error) {
      console.log(`Error in handleLogin ${error}`);
      throw error;
    }
  };

  const getUserHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await client.get(`/get_all_activity?token=${token}`);
      // console.log(res.data);

      if (res.status === httpStatus.OK) {
        console.log(res.data.meetings);
        return res.data.meetings;
      }
    } catch (error) {
      console.log(`Error in getUserHistory ${error}`);
      throw error;
    }
  };

  const addToUserHistory = async (token, meetingCode) => {
    try {
      const res = await client.post("/add_to_activity", {
        token,
        meetingCode,
      });
      console.log(res.data);

      if (res.status === httpStatus.OK) {
        return res.data;
      }
    } catch (error) {
      console.log(`Error in addToHistory ${error.message}`);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserData(null);
    navigate("/");
  };

  const navigate = useNavigate();

  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
    getUserHistory,
    addToUserHistory,
  };

  return (
    <AuthContextData.Provider value={data}>{children}</AuthContextData.Provider>
  );
};

export default AuthProvider;
