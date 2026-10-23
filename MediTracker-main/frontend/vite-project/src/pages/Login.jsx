// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { getActiveBackendUrl, setCustomBackendUrl } from "../api/axios";
import { AppContext } from "../context/AppContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaCog, FaCheck, FaRocket, FaUserCheck } from "react-icons/fa";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AppContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(() => getActiveBackendUrl());
  const [serverSavedMsg, setServerSavedMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveServerUrl = (e) => {
    e.preventDefault();
    setCustomBackendUrl(serverUrlInput);
    setServerSavedMsg("Backend URL updated successfully!");
    setError("");
    setTimeout(() => setServerSavedMsg(""), 3000);
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: "demo@meditracker.com",
      password: "demo123",
    });
    setError("");
  };

  const handleQuickDemoLogin = async () => {
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
      setError(err.response?.data?.message || "Failed to sign in to demo mode");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send login request
      const res = await API.post("/auth/login", formData);

      // Save user & token in context
      login(res.data.user, res.data.token);

      // Clear form
      setFormData({ email: "", password: "" });

      // Redirect to Dashboard upon successful login
      navigate("/dashboard");
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      if (!err.response || [502, 503, 504].includes(err.response?.status)) {
        const activeUrl = getActiveBackendUrl() || "http://localhost:5000";
        setError(`Cannot reach backend server at ${activeUrl}. You can use the Quick Demo Sign In below or configure your backend URL.`);
        setShowServerConfig(true);
      } else {
        setError(serverMessage || "Invalid email or password. Please check your credentials and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 text-blue-600 rounded-full mb-3 shadow-inner">
            <FaSignInAlt className="text-2xl" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign In to <span className="text-blue-600">Medi</span><span className="text-green-600">Track</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Manage your daily doses, reminders, and health tracking
          </p>
        </div>

        {/* 1-Click Demo Sign In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-lg transition transform active:scale-[0.99] text-sm"
          >
            <FaRocket className="text-base text-yellow-300" />
            <span>Instant Demo Sign In (1-Click)</span>
          </button>
          
          <div className="mt-2.5 flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Or use credentials:</span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
            >
              <FaUserCheck /> demo@meditracker.com / demo123
            </button>
          </div>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">Or enter credentials</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600 border-t pt-4">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:text-blue-500 hover:underline"
          >
            Create an Account
          </Link>
        </div>

        {/* Server Connection Config Toggle */}
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
              <label htmlFor="serverUrlInput" className="block text-xs font-medium text-gray-700 mb-1">
                Active Backend API URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="serverUrlInput"
                  value={serverUrlInput}
                  onChange={(e) => setServerUrlInput(e.target.value)}
                  placeholder="https://your-tunnel.trycloudflare.com or http://localhost:5000"
                  className="flex-1 px-2.5 py-1.5 border border-gray-300 rounded text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSaveServerUrl}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium shadow-sm transition"
                >
                  Save
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

export default Login;
