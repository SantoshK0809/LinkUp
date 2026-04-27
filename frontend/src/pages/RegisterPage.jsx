import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContextData } from "../context/AuthContext";
// import { handleRegister } from "../context/AuthContext.jsx";

export const RegisterPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState(0);

  // const [form, setForm] = useState({
  //   fullname: "",
  //   email: "",
  //   password: "",
  // });

  // const handleChange = (e) => {
  //   setForm({ ...form, [e.target.name]: e.target.value });
  // };

  const { handleRegister } = useContext(AuthContextData);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !username || !password) {
      setError("All fields are required");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      const res = await handleRegister(name, username, password);
      console.log(res);
      if (res && res.message) {
        setName("");
        setUsername("");
        setPassword("");
        setMessage(res.message);
        setTimeout(() => setMessage(""), 3000);
      }

      setTimeout(() => navigate("/login"), 2000);
    } catch (e) {
      console.log(e);
      let errMsg =
        e?.response?.data?.message || "Something went wrong while registering";
      setError(errMsg);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Snackbar / Toast Notifications */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span>✓</span>
          {message}
        </div>
      )}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <span>⚠</span>
          {error}
        </div>
      )}

      <Link
        to="/"
        className="absolute right-[57%] top-[14%] text-gray-400 hover:text-gray-900 transition cursor-pointer"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md">
        {/* Heading */}

        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Create your account
        </h2>

        <p className="text-sm text-gray-500 text-center mt-2">
          Join LinkUp and start your meetings instantly
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-600">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
              }}
              placeholder="John Doe"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-sm text-gray-600">Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              placeholder="johndoe123"
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
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </section>
  );
};
