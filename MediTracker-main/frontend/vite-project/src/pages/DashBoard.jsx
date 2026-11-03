// src/pages/DashBoard.jsx
import React, { useContext, useRef, useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import API from "../api/axios";
import NotificationManager from "../components/NotificationManager";
import { FaBars, FaTimes } from "react-icons/fa";

const DashBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, logout } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalMedicines: 0,
    missedDoses: 0,
    todayDoses: 0,
    takenDoses: 0,
  });

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);

  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "" },
    { name: "Add Medicine", icon: "💊", path: "add-medicine" },
    { name: "My Medicine", icon: "🏥", path: "my-medicine" },
    { name: "History", icon: "📜", path: "history" },
    { name: "Analytics", icon: "📈", path: "analytics" },
    { name: "Calendar", icon: "📅", path: "calendar" },
    { name: "Assistants", icon: "🤖", path: "chatbot" },
  ];

  const isActive = (path) =>
    location.pathname === (path === "" ? "/dashboard" : `/dashboard/${path}`);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const res = await API.get("/dashboard/stats");

      setStats(res.data.stats || {});
      setTodaySchedule(res.data.todaySchedule || []);
      setUpcomingSchedule(res.data.upcomingSchedule || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    // Reset stats immediately when user switches to prevent showing previous user's data
    setStats({
      totalMedicines: 0,
      missedDoses: 0,
      todayDoses: 0,
      takenDoses: 0,
    });
    setTodaySchedule([]);
    setUpcomingSchedule([]);

    if (user) {
      fetchDashboard();
    }
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [user?._id || user?.id || user?.email]);

  // Mark dose
  const markDose = async (medicineId, status, log) => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      await API.put(`/dashboard/mark-dose/${medicineId}`, {
        status,
        date: log.date,
        time: log.time,
      });

      setTodaySchedule((prev) =>
        prev.map((item) =>
          item.logId === log.logId ? { ...item, status } : item
        )
      );

      setStats((prev) => ({
        ...prev,
        takenDoses: status === "Taken" ? prev.takenDoses + 1 : prev.takenDoses,
        missedDoses: status === "Missed" ? prev.missedDoses + 1 : prev.missedDoses,
      }));
    } catch (error) {
      console.error("Mark dose error:", error);
      alert(error.response?.data?.message || "Failed to mark dose");
    }
  };

  // Upload profile picture
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      setUploading(true);
      const res = await API.post("/user/upload-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser((prev) => ({ ...prev, profilePic: res.data.profilePic }));
      setUploading(false);
    } catch (error) {
      console.error("Profile upload error:", error);
      setUploading(false);
    }
  };

  // Dashboard Home Component
  const DashboardHome = () => (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-500 text-white p-6 rounded-2xl shadow">
          <div>Total Medicines</div>
          <div className="text-2xl font-semibold mt-2">{stats.totalMedicines}</div>
        </div>
        <div className="bg-red-500 text-white p-6 rounded-2xl shadow">
          <div>Missed Doses</div>
          <div className="text-2xl font-semibold mt-2">{stats.missedDoses}</div>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-2xl shadow">
          <div>Today's Doses</div>
          <div className="text-2xl font-semibold mt-2">{stats.todayDoses}</div>
          <div className="text-sm mt-1">Taken: {stats.takenDoses}</div>
        </div>
      </div>

      {/* Today Schedule */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Today’s Schedule</h2>
        {todaySchedule.length === 0 ? (
          <p className="text-gray-500 text-sm">No medicines for today</p>
        ) : (
          todaySchedule.map((item) => (
            <div
              key={item.logId}
              className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 p-3 rounded-xl mb-2"
            >
              <div>
                <div className="font-medium">
                  {item.name} ({item.dosage || "No dosage"})
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()} • {item.time}
                </div>
                {item.status !== "Pending" && (
                  <div
                    className={`text-xs mt-1 font-semibold ${
                      item.status === "Taken" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.status}
                  </div>
                )}
              </div>
              {item.status === "Pending" && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => markDose(item.medicineId, "Missed", item)}
                    className="px-4 py-1 rounded-lg text-sm text-white bg-red-500 hover:bg-red-600"
                  >
                    Missed
                  </button>
                  <button
                    onClick={() => markDose(item.medicineId, "Taken", item)}
                    className="px-4 py-1 rounded-lg text-sm text-white bg-green-500 hover:bg-green-600"
                  >
                    Taken
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white p-5 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-4">Upcoming Schedule</h2>
        {upcomingSchedule.length === 0 ? (
          <p className="text-gray-500 text-sm">No upcoming medicines</p>
        ) : (
          upcomingSchedule.map((item) => (
            <div key={item.logId} className="bg-gray-50 p-3 rounded-xl mb-2">
              <div className="font-medium">{item.name} ({item.dosage || "No dosage"})</div>
              <div className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()} • {item.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Sidebar content as reusable component
  const SidebarContent = () => (
    <>
      <div className="flex flex-col items-center px-6 py-6 mb-6 border-b border-blue-700">
        <div
          className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400 cursor-pointer"
          onClick={() => fileInputRef.current.click()}
        >
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-500 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
        {uploading && <p className="text-xs text-white mt-1">Uploading...</p>}
        <h2 className="text-lg font-semibold mt-3">{user?.name || "Guest"}</h2>
        <p className="text-sm text-blue-200">{user?.email || ""}</p>
      </div>

      <ul className="flex flex-col space-y-2 px-2 flex-1">
        {menuItems.map((item, idx) => (
          <li key={idx}>
            <Link
              to={item.path === "" ? "/dashboard" : `/dashboard/${item.path}`}
              className={`flex items-center px-4 py-3 rounded transition ${
                isActive(item.path) ? "bg-blue-700 font-semibold" : "hover:bg-blue-700"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-blue-800">
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition shadow"
        >
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-900 text-white flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <aside
          className={`fixed left-0 top-0 w-64 h-full bg-blue-900 text-white p-4 transform transition-transform duration-300 md:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <NotificationManager />

        {/* Mobile menu button */}
        <div className="md:hidden flex justify-end mb-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 text-2xl">
            <FaBars />
          </button>
        </div>

        {/* Dashboard Home */}
        {(location.pathname === "/dashboard" || location.pathname === "/dashboard/") && <DashboardHome />}

        {/* Render other routes */}
        <Outlet />
      </main>

    </div>
  );
};

export default DashBoard;