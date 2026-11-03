// src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaChevronDown, FaBell, FaBars, FaTimes, FaDownload, FaCamera, FaPills, FaUserFriends } from "react-icons/fa";
import API from "../api/axios";

function Navbar() {
  const { user, logout } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsStandalone(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  // Fetch notifications for today
  const fetchNotifications = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await API.get("/dashboard/stats");

      const todaySchedule = res.data.todaySchedule || [];
      const pending = todaySchedule.filter((item) => item.status === "Pending");

      setNotifications(pending);
      setPendingCount(pending.length);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [user]);

  const handleNotifClick = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen) setPendingCount(0);
  };

  return (
    <nav className="bg-gray-300 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <img
              className="h-9 w-9 object-contain"
              src="/medicine-capsule.svg"
              alt="MediTrack Capsule"
            />
            <span className="font-bold text-2xl sm:text-3xl ml-2 flex">
              <span className="text-blue-600">Medi</span>
              <span className="text-green-600">Track</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-6 items-center">
            {menuItems.map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">

            {/* PWA Install Button (desktop & mobile navbar) */}
            {deferredPrompt && !isStandalone && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                <FaDownload className="text-xs" /> Install App
              </button>
            )}

            {/* Desktop Auth Buttons */}
            {!user && (
              <div className="hidden md:flex space-x-2">
                <Link
                  to="/login"
                  className="px-5 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Notification Bell */}
            {user && (
              <div className="relative cursor-pointer" onClick={handleNotifClick}>
                <FaBell className="text-gray-700 text-xl" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 font-bold border-b text-gray-800 text-sm bg-gray-50 flex items-center justify-between">
                      <span>Today's Notifications</span>
                      <span className="text-xs text-blue-600 font-normal">
                        {notifications.length} pending
                      </span>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-gray-500 text-sm text-center">
                        All doses taken for today! 🎉
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                        {notifications.map((item) => (
                          <div
                            key={item.logId}
                            onClick={() => {
                              navigate("/dashboard");
                              setNotifOpen(false);
                            }}
                            className="px-3.5 py-2.5 text-xs cursor-pointer hover:bg-blue-50 transition"
                          >
                            <div className="font-semibold text-gray-800">{item.name}</div>
                            <div className="text-gray-500 mt-0.5">
                              {item.dosage || "1 dose"} scheduled at <strong>{item.time}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border border-gray-400"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <FaChevronDown className="ml-2 text-gray-700 text-xs" />
                </div>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 py-1 divide-y divide-gray-100">
                    <div className="px-4 py-2 bg-gray-50">
                      <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() => {
                          navigate("/dashboard");
                          setDropdownOpen(false);
                        }}
                      >
                        📊 Dashboard
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() => {
                          navigate("/dashboard/scanner");
                          setDropdownOpen(false);
                        }}
                      >
                        📷 Scan Prescription
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() => {
                          navigate("/dashboard/refills");
                          setDropdownOpen(false);
                        }}
                      >
                        📦 Smart Refills
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() => {
                          navigate("/dashboard/family");
                          setDropdownOpen(false);
                        }}
                      >
                        👨‍👩‍👧 Family & Caregivers
                      </button>
                    </div>

                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-bold"
                        onClick={() => {
                          logout();
                          navigate("/");
                          setDropdownOpen(false);
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 text-2xl focus:outline-none"
              >
                {mobileMenuOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-200 px-4 pt-4 pb-6 space-y-3">
          {deferredPrompt && !isStandalone && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
            >
              <FaDownload /> Install App on Device
            </button>
          )}

          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              to={item.path}
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* Auth buttons in mobile menu if not logged in */}
          {!user && (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
