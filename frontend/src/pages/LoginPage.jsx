import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContextData } from "../context/AuthContext";

export const LoginPage = () => {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState(0);

  // const handleChange = (e) => {
  //   setUsername(e.target.value);
  //   setPassword(e.target.value);
  // };

  const { handleLogin } = useContext(AuthContextData);
  const navigate = useNavigate();

  // const token = localStorage.getItem("token");
  // if (token) {
  //   navigate("/home");
  // }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError("All fields are required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await handleLogin(username, password);

      console.log(
        `Username : ${username} Password : ${password} of LoggedIn user.`,
      );

      if (res && res.message) {
        setPassword("");
      setUsername("");
        setMessage(res.message);
        setTimeout(() => setMessage(""), 3000);
      }
      
      setTimeout(() => navigate("/home"), 2000);
    } catch (e) {
      console.log(e);
      let errMsg =
        e?.response?.data?.message || "Something went wrong while logging in";
      console.log(" errMsg", errMsg);
      // setMessage(errMsg)
      setError(errMsg);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {error && (
        <div className="p-3 fixed top-4 left-1/2 font-semibold transform -translate-x-1/2 bg-red-500 text-white border border-red-400 text-red-700 rounded text-sm text-center">
          <span> ⚠ </span>
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 fixed top-4 left-1/2 font-semibold transform -translate-x-1/2 bg-green-400 text-white border border-green-400 text-green-700 rounded text-sm text-center">
          <span> ✓ </span>
          {message}
        </div>
      )}

      <Link
        to="/"
        className="absolute right-[57%] top-[18%] text-gray-400 hover:text-gray-900 transition cursor-pointer"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        <div className="flex justify-between items-center">
          {/* Heading */}
          <h2 className="text-2xl font-semibold text-gray-900 w-full text-center">
            Welcome back
          </h2>
        </div>

        <p className="text-sm text-gray-500 text-center mt-2">
          Sign in to continue to LinkUp
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Create one
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
