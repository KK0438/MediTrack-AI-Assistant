// src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { FaChevronDown, FaBell, FaBars, FaTimes } from "react-icons/fa";
import axios from "axios";

function Navbar() {
  const { user, logout } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Blogs", path: "/blogs" },
    { name: "Contact", path: "/contact" },
  ];

  // Fetch notifications for today
  const fetchNotifications = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
          <div className="flex-shrink-0 flex items-center">
            <img
              className="h-9 w-9 object-contain"
              src="/medicine-capsule.svg"
              alt=""
              aria-hidden="true"
            />
            <span className="font-bold text-2xl sm:text-3xl ml-2 flex">
              <span className="text-blue-600">Medi</span>
              <span className="text-green-600">Track</span>
            </span>
          </div>

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
          <div className="flex items-center space-x-4">

            {/* Desktop Auth Buttons */}
            {!user && (
              <div className="hidden md:flex space-x-2">
                <Link
                  to="/login"
                  className="px-5 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {pendingCount}
                  </span>
                )}
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
                    <div className="p-2 font-semibold border-b">Today’s Notifications</div>
                    {notifications.length === 0 ? (
                      <div className="p-2 text-gray-500 text-sm">No pending medicines</div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.logId}
                          className="px-3 py-2 border-b last:border-b-0 text-sm cursor-pointer hover:bg-gray-100"
                        >
                          {item.name} ({item.dosage || "No dosage"}) at {item.time}
                        </div>
                      ))
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
                    <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-semibold">
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <FaChevronDown className="ml-2 text-gray-700" />
                </div>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        navigate("/dashboard");
                        setDropdownOpen(false);
                      }}
                    >
                      Dashboard
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        logout();
                        navigate("/");
                        setDropdownOpen(false);
                      }}
                    >
                      Logout
                    </button>
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
            <>
              <Link
                to="/login"
                className="block w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;