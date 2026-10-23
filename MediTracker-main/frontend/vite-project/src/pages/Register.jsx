import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { getActiveBackendUrl, setCustomBackendUrl } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus, FaCog, FaCheck, FaRocket, FaUndo } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => getActiveBackendUrl());
  const [serverSavedMsg, setServerSavedMsg] = useState("");

  const handleSaveServerUrl = () => {
    setCustomBackendUrl(serverUrlInput);
    setServerSavedMsg("Backend URL saved!");
    setError("");
    setTimeout(() => setServerSavedMsg(""), 3000);
  };

  const handleResetServerUrl = () => {
    setCustomBackendUrl("");
    setServerUrlInput("");
    setServerSavedMsg("Reset to standalone demo mode!");
    setError("");
    setTimeout(() => setServerSavedMsg(""), 3000);
  };

  const handleQuickDemoRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", {
        email: "demo@meditracker.com",
        password: "demo123",
      });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to enter demo mode");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send data to backend
      const res = await API.post("/auth/signup", formData);

      // Save user + token in context & localStorage
      if (res.data?.user && res.data?.token) {
        login(res.data.user, res.data.token);
      }

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
      });

      // Redirect to Dashboard after registration
      navigate("/dashboard");
    } catch (err) {
      const serverError = err.response?.data?.message || err.response?.data?.error;
      const validationError = err.response?.data?.errors?.[0]?.msg;

      setError(
        serverError ||
          validationError ||
          (!err.response
            ? "Cannot reach the backend server. Please verify your connection or use the Demo mode below."
            : "Registration failed. Please check your information and try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 text-green-600 rounded-full mb-3 shadow-inner">
            <FaUserPlus className="text-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Start tracking your medications with <span className="text-blue-600 font-medium">Medi</span><span className="text-green-600 font-medium">Track</span>
          </p>
        </div>

        {/* 1-Click Demo Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleQuickDemoRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition transform active:scale-[0.99] text-sm"
          >
            <FaRocket className="text-base text-yellow-300" />
            <span>Instant Demo Patient (1-Click)</span>
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">Or create your own account</span>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaUser />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                placeholder="John Doe"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="name@example.com"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FaLock />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account & Go to Dashboard"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6 border-t pt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>

        {/* Server Config Accordion */}
        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <button
            type="button"
            onClick={() => setShowServerConfig(!showServerConfig)}
            className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 transition gap-1"
          >
            <FaCog className="text-xs" />
            <span>{showServerConfig ? "Hide Backend URL Settings" : "Configure Backend Server URL"}</span>
          </button>

          {showServerConfig && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-left">
              <label htmlFor="serverUrlInputRegister" className="block text-xs font-medium text-gray-700 mb-1">
                Active Backend API URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="serverUrlInputRegister"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="https://your-tunnel.trycloudflare.com or leave empty"
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleResetServerUrl}
                  title="Reset to Demo Mode"
                  className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition flex items-center gap-1"
                >
                  <FaUndo className="text-[10px]" /> Reset
                </button>
              </div>
              {serverSavedMsg && (
                <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1 font-medium">
                  <FaCheck /> {serverSavedMsg}
                </p>
              )}
              <p className="mt-1 text-[11px] text-gray-400">
                Leave empty for built-in high-performance Demo Mode, or enter custom URL for live Express backend.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Register;