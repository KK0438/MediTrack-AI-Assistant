// src/pages/DashBoard.jsx
import React, { useContext, useRef, useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import API from "../api/axios";
import NotificationManager from "../components/NotificationManager";
import {
  FaBars,
  FaTimes,
  FaCamera,
  FaPills,
  FaUserFriends,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaDownload,
  FaHistory,
  FaCalendarAlt,
  FaRobot,
  FaClinicMedical,
  FaPlusCircle,
} from "react-icons/fa";

const DashBoard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, setUser, logout } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [caregiverAlertMsg, setCaregiverAlertMsg] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  const [stats, setStats] = useState({
    totalMedicines: 0,
    missedDoses: 0,
    todayDoses: 0,
    takenDoses: 0,
  });

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [lowStockMeds, setLowStockMeds] = useState([]);

  // Menu items with full feature coverage
  const menuItems = [
    { name: "Dashboard", icon: "📊", path: "" },
    { name: "Prescription Scanner", icon: "📷", path: "scanner" },
    { name: "Smart Refills", icon: "📦", path: "refills" },
    { name: "Family & Caregiver", icon: "👨‍👩‍👧", path: "family" },
    { name: "Add Medicine", icon: "💊", path: "add-medicine" },
    { name: "My Medicine", icon: "🏥", path: "my-medicine" },
    { name: "Adherence Analytics", icon: "📈", path: "analytics" },
    { name: "History", icon: "📜", path: "history" },
    { name: "Calendar", icon: "📅", path: "calendar" },
    { name: "AI Assistant", icon: "🤖", path: "chatbot" },
  ];

  // Mobile Bottom Navigation items
  const bottomNavItems = [
    { name: "Home", icon: "📊", path: "" },
    { name: "Scanner", icon: "📷", path: "scanner" },
    { name: "Refills", icon: "📦", path: "refills" },
    { name: "Family", icon: "👨‍👩‍👧", path: "family" },
    { name: "My Meds", icon: "🏥", path: "my-medicine" },
  ];

  const isActive = (path) =>
    location.pathname === (path === "" ? "/dashboard" : `/dashboard/${path}`);

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setIsAppInstalled(true);
    }
    setInstallPrompt(null);
  };

  // Fetch dashboard data and check refill stock
  const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      const [resStats, resMeds] = await Promise.all([
        API.get("/dashboard/stats"),
        API.get("/medicines").catch(() => ({ data: [] })),
      ]);

      setStats(resStats.data.stats || {});
      setTodaySchedule(resStats.data.todaySchedule || []);
      setUpcomingSchedule(resStats.data.upcomingSchedule || []);

      // Check low stock medicines (< 7 tablets or < threshold)
      const allMeds = resMeds.data || [];
      const low = allMeds.filter((m) => {
        const stock = Number(m.currentStock !== undefined ? m.currentStock : 30);
        const threshold = Number(m.refillThreshold) || 5;
        return stock <= threshold;
      });
      setLowStockMeds(low);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
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

  // Mark dose with caregiver alert dispatch and stock decrement
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

      // If dose is marked Missed, check family caregiver consent and dispatch notification
      if (status === "Missed") {
        const uId = user?._id || user?.id || "demo_patient_001";
        const consent = localStorage.getItem(`meditracker_family_consent_${uId}`) === "true";
        if (consent) {
          const familyMembers = JSON.parse(
            localStorage.getItem(`meditracker_family_${uId}`) || "[]"
          );
          const activeCaregivers = familyMembers.filter((m) => m.alertOnMissed);
          if (activeCaregivers.length > 0) {
            const names = activeCaregivers.map((c) => c.name).join(", ");
            setCaregiverAlertMsg(
              `⚠️ Caregiver Alert Dispatched: ${names} notified of missed ${log.name} dose.`
            );
            setTimeout(() => setCaregiverAlertMsg(""), 6000);

            // Log alert in history
            const alertKey = `meditracker_family_alerts_${uId}`;
            const existingAlerts = JSON.parse(localStorage.getItem(alertKey) || "[]");
            existingAlerts.unshift({
              id: `alert_${Date.now()}`,
              caregiverName: names,
              caregiverContact: activeCaregivers[0].email || activeCaregivers[0].phone,
              patientName: user?.name || "Patient",
              medication: log.name,
              doseTime: log.time,
              type: "Missed Dose Notification",
              status: "Delivered",
              timestamp: new Date().toISOString(),
              messageBody: `[URGENT MEDITRACK ALERT] ${user?.name || "Patient"} missed their scheduled ${log.time} dose of ${log.name}.`,
            });
            localStorage.setItem(alertKey, JSON.stringify(existingAlerts.slice(0, 20)));
          }
        }
      }

      // Refresh dashboard to reflect updated stock and schedule
      fetchDashboard();
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
    <div className="space-y-6">
      {/* Caregiver Alert Toast */}
      {caregiverAlertMsg && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-sm font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-600 text-base flex-shrink-0" />
            <span>{caregiverAlertMsg}</span>
          </div>
          <Link
            to="/dashboard/family"
            className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
          >
            Family Portal
          </Link>
        </div>
      )}

      {/* Low Refill Alert Banner */}
      {lowStockMeds.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-yellow-900 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-yellow-200 text-yellow-800 rounded-xl text-lg flex-shrink-0">
              <FaPills />
            </span>
            <div>
              <span className="font-bold text-sm block">
                Refill Reminder: {lowStockMeds.length} medicine(s) running low on tablets!
              </span>
              <span className="text-xs text-yellow-800">
                {lowStockMeds.map((m) => `${m.name} (${m.currentStock || 0} left)`).join(", ")}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/refills"
            className="self-start sm:self-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-bold rounded-xl shadow transition whitespace-nowrap"
          >
            📦 Refill Stock Now
          </Link>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <div className="text-xs uppercase font-semibold text-indigo-100">Total Medicines</div>
          <div className="text-3xl font-extrabold mt-2">{stats.totalMedicines}</div>
          <div className="text-xs text-indigo-200 mt-2">Active daily prescriptions</div>
        </div>

        <div className="bg-red-500 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <div className="text-xs uppercase font-semibold text-red-100">Missed Doses</div>
          <div className="text-3xl font-extrabold mt-2">{stats.missedDoses}</div>
          <div className="text-xs text-red-100 mt-2">Alerts tracked in Family Mode</div>
        </div>

        <div className="bg-green-600 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
          <div className="text-xs uppercase font-semibold text-green-100">Today's Doses</div>
          <div className="text-3xl font-extrabold mt-2">{stats.todayDoses}</div>
          <div className="text-xs text-green-100 mt-2">Taken: {stats.takenDoses} of {stats.todayDoses}</div>
        </div>
      </div>

      {/* Quick Action Feature Hub */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">
          Quick Feature Hub
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            to="/dashboard/scanner"
            className="p-4 rounded-xl border border-blue-100 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 transition flex flex-col items-center text-center group"
          >
            <span className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition">
              <FaCamera />
            </span>
            <span className="font-bold text-gray-800 text-sm">Scan Prescription</span>
            <span className="text-[11px] text-gray-500 mt-0.5">OCR Text Extraction</span>
          </Link>

          <Link
            to="/dashboard/refills"
            className="p-4 rounded-xl border border-indigo-100 hover:border-indigo-400 bg-indigo-50/50 hover:bg-indigo-50 transition flex flex-col items-center text-center group"
          >
            <span className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition">
              <FaPills />
            </span>
            <span className="font-bold text-gray-800 text-sm">Smart Refills</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Pill Stock Estimator</span>
          </Link>

          <Link
            to="/dashboard/family"
            className="p-4 rounded-xl border border-green-100 hover:border-green-400 bg-green-50/50 hover:bg-green-50 transition flex flex-col items-center text-center group"
          >
            <span className="w-12 h-12 rounded-xl bg-green-600 text-white flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition">
              <FaUserFriends />
            </span>
            <span className="font-bold text-gray-800 text-sm">Family Mode</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Caregiver Alerts</span>
          </Link>

          <Link
            to="/dashboard/analytics"
            className="p-4 rounded-xl border border-purple-100 hover:border-purple-400 bg-purple-50/50 hover:bg-purple-50 transition flex flex-col items-center text-center group"
          >
            <span className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center text-xl mb-2 group-hover:scale-105 transition">
              <FaChartLine />
            </span>
            <span className="font-bold text-gray-800 text-sm">Adherence Analytics</span>
            <span className="text-[11px] text-gray-500 mt-0.5">Consistency & Streaks</span>
          </Link>
        </div>
      </div>

      {/* Today Schedule */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Today’s Medication Schedule</h2>
          <span className="text-xs text-gray-400">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </span>
        </div>

        {todaySchedule.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No medicines scheduled for today.</p>
            <Link
              to="/dashboard/add-medicine"
              className="text-xs text-blue-600 font-bold hover:underline mt-2 inline-block"
            >
              + Add a medicine schedule
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {todaySchedule.map((item) => (
              <div
                key={item.logId}
                className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-50 hover:bg-white p-4 rounded-xl border border-gray-100 transition shadow-sm"
              >
                <div>
                  <div className="font-bold text-gray-800">
                    {item.name}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      ({item.dosage || "No dosage"})
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {new Date(item.date).toLocaleDateString()} • {item.time}
                  </div>
                  {item.status !== "Pending" && (
                    <div
                      className={`text-xs mt-1 font-bold ${
                        item.status === "Taken" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ✓ {item.status}
                    </div>
                  )}
                </div>

                {item.status === "Pending" && (
                  <div className="flex gap-2 mt-3 md:mt-0">
                    <button
                      type="button"
                      onClick={() => markDose(item.medicineId, "Missed", item)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 shadow-sm transition"
                    >
                      Missed
                    </button>
                    <button
                      type="button"
                      onClick={() => markDose(item.medicineId, "Taken", item)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-green-600 hover:bg-green-700 shadow-sm transition"
                    >
                      Taken
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Schedule */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Upcoming Schedule</h2>
        {upcomingSchedule.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming medicines scheduled</p>
        ) : (
          <div className="space-y-2">
            {upcomingSchedule.map((item) => (
              <div key={item.logId} className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-sm flex items-center justify-between">
                <div>
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <span className="text-xs text-gray-500 ml-2">({item.dosage || "1 dose"})</span>
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(item.date).toLocaleDateString()} • {item.time}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Sidebar content
  const SidebarContent = () => (
    <>
      <div className="flex flex-col items-center px-6 py-6 mb-4 border-b border-blue-800">
        <div
          className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-400 cursor-pointer shadow-md"
          onClick={() => fileInputRef.current.click()}
        >
          {user?.profilePic ? (
            <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-blue-800 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
        />
        {uploading && <p className="text-xs text-blue-200 mt-1">Uploading...</p>}
        <h2 className="text-base font-bold mt-3 text-white">{user?.name || "Guest"}</h2>
        <p className="text-xs text-blue-200">{user?.email || ""}</p>

        {/* PWA Install Button in Sidebar */}
        {installPrompt && !isAppInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="mt-3 w-full px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow flex items-center justify-center gap-1.5"
          >
            <FaDownload /> Install App
          </button>
        )}
      </div>

      <ul className="flex flex-col space-y-1 px-3 flex-1 overflow-y-auto">
        {menuItems.map((item, idx) => (
          <li key={idx}>
            <Link
              to={item.path === "" ? "/dashboard" : `/dashboard/${item.path}`}
              className={`flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive(item.path)
                  ? "bg-blue-700 text-white font-bold shadow-sm"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`}
            >
              <span className="mr-3 text-base">{item.icon}</span>
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
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition shadow"
        >
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-blue-900 text-white flex-shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        <aside
          className={`fixed left-0 top-0 w-64 h-full bg-blue-900 text-white p-2 transform transition-transform duration-300 md:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white text-xl"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <NotificationManager />

        {/* Mobile top header row */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-blue-900">MediTrack</span>
            {installPrompt && !isAppInstalled && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-xs font-bold flex items-center gap-1"
              >
                <FaDownload className="text-[10px]" /> Install
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-700 text-xl"
          >
            <FaBars />
          </button>
        </div>

        {/* Dashboard Home View */}
        {(location.pathname === "/dashboard" || location.pathname === "/dashboard/") && (
          <DashboardHome />
        )}

        {/* Render child routes */}
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar (PWA experience) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
        {bottomNavItems.map((item, idx) => {
          const active = isActive(item.path);
          return (
            <Link
              key={idx}
              to={item.path === "" ? "/dashboard" : `/dashboard/${item.path}`}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-semibold transition ${
                active ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default DashBoard;
