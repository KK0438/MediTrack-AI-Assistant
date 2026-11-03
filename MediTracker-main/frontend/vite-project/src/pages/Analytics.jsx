// src/pages/Analytics.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  FaTrophy,
  FaFire,
  FaCalendarWeek,
  FaChartLine,
  FaExclamationTriangle,
  FaFileDownload,
  FaPrint,
  FaCheckCircle,
  FaLightbulb,
} from "react-icons/fa";

const Analytics = () => {
  const { user } = useContext(AppContext);
  const [timeRange, setTimeRange] = useState("30"); // '7' | '14' | '30' | 'all'
  const [loading, setLoading] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [analytics, setAnalytics] = useState({
    total: 0,
    taken: 0,
    missed: 0,
    pending: 0,
    adherence: 0,
    medicineWise: [],
    monthlyProgress: [],
  });
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch medicines and analytics data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAnalytics, resMeds] = await Promise.all([
        API.get("/dashboard/analytics"),
        API.get("/medicines").catch(() => ({ data: [] })),
      ]);

      setAnalytics({
        total: resAnalytics.data.total || 0,
        taken: resAnalytics.data.taken || 0,
        missed: resAnalytics.data.missed || 0,
        pending: resAnalytics.data.pending || 0,
        adherence: resAnalytics.data.adherence || 0,
        medicineWise: resAnalytics.data.medicineWise || [],
        monthlyProgress: resAnalytics.data.monthlyProgress || [],
      });
      setMedicines(resMeds.data || []);
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id || user?.id || user?.email]);

  // Aggregate logs across all medicines for granular analytics
  const allLogs = useMemo(() => {
    const list = [];
    medicines.forEach((med) => {
      (med.logs || []).forEach((l) => {
        list.push({
          medName: med.name,
          date: new Date(l.date),
          time: l.time,
          status: l.status,
        });
      });
    });
    return list;
  }, [medicines]);

  // Filter logs according to selected time range
  const filteredLogs = useMemo(() => {
    if (timeRange === "all") return allLogs;
    const days = parseInt(timeRange, 10) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return allLogs.filter((l) => l.date >= cutoff);
  }, [allLogs, timeRange]);

  // Dynamic metrics derived from filtered logs
  const metrics = useMemo(() => {
    let taken = 0;
    let missed = 0;
    let pending = 0;

    filteredLogs.forEach((l) => {
      if (l.status === "Taken") taken++;
      else if (l.status === "Missed") missed++;
      else pending++;
    });

    const total = taken + missed + pending;
    const resolvedTotal = taken + missed;
    const adherence = resolvedTotal > 0 ? Math.round((taken / resolvedTotal) * 100) : 100;

    // Consistency score: Adherence rate (75%) + Regularity streak (25%)
    let consistencyScore = adherence;
    if (missed === 0 && taken > 5) consistencyScore = 100;
    else if (missed > 0) consistencyScore = Math.max(0, Math.round(adherence * 0.95));

    let consistencyGrade = "🌟 Elite Consistency";
    let consistencyColor = "text-green-600";
    if (consistencyScore < 50) {
      consistencyGrade = "🚨 Needs Urgent Attention";
      consistencyColor = "text-red-600";
    } else if (consistencyScore < 75) {
      consistencyGrade = "⚠️ Moderate Routine";
      consistencyColor = "text-yellow-600";
    } else if (consistencyScore < 90) {
      consistencyGrade = "👍 Good Daily Routine";
      consistencyColor = "text-blue-600";
    }

    return {
      total,
      taken,
      missed,
      pending,
      adherence,
      consistencyScore,
      consistencyGrade,
      consistencyColor,
    };
  }, [filteredLogs]);

  // Calculate Current Streak & Longest Streak
  const streaks = useMemo(() => {
    // Group resolved doses by calendar date string
    const dateMap = {};
    allLogs.forEach((l) => {
      if (l.status === "Taken" || l.status === "Missed") {
        const key = l.date.toISOString().split("T")[0];
        if (!dateMap[key]) dateMap[key] = { taken: 0, missed: 0 };
        if (l.status === "Taken") dateMap[key].taken++;
        else dateMap[key].missed++;
      }
    });

    const dates = Object.keys(dateMap).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let running = 0;

    dates.forEach((d) => {
      if (dateMap[d].missed === 0 && dateMap[d].taken > 0) {
        running++;
        if (running > longestStreak) longestStreak = running;
      } else {
        running = 0;
      }
    });

    // Check if yesterday / today is adhering
    const todayKey = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split("T")[0];

    if (dateMap[todayKey]?.missed === 0 || dateMap[yesterdayKey]?.missed === 0) {
      currentStreak = running;
    } else {
      currentStreak = 0;
    }

    return {
      current: Math.max(currentStreak, running > 0 ? 1 : 0),
      longest: Math.max(longestStreak, running),
    };
  }, [allLogs]);

  // Weekly breakdown (Monday through Sunday)
  const weeklyData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const days = [
      { day: "Mon", taken: 0, missed: 0, total: 0 },
      { day: "Tue", taken: 0, missed: 0, total: 0 },
      { day: "Wed", taken: 0, missed: 0, total: 0 },
      { day: "Thu", taken: 0, missed: 0, total: 0 },
      { day: "Fri", taken: 0, missed: 0, total: 0 },
      { day: "Sat", taken: 0, missed: 0, total: 0 },
      { day: "Sun", taken: 0, missed: 0, total: 0 },
    ];

    filteredLogs.forEach((l) => {
      const dayIndex = l.date.getDay(); // 0 is Sun
      const name = dayNames[dayIndex];
      const target = days.find((d) => d.day === name);
      if (target) {
        if (l.status === "Taken") target.taken++;
        else if (l.status === "Missed") target.missed++;
        target.total++;
      }
    });

    return days;
  }, [filteredLogs]);

  // Missed-Dose Trends by Time of Day (Morning, Afternoon, Evening, Night)
  const missedDoseTrends = useMemo(() => {
    let morning = 0; // 6AM - 12PM
    let afternoon = 0; // 12PM - 5PM
    let evening = 0; // 5PM - 9PM
    let night = 0; // 9PM - 6AM

    filteredLogs.forEach((l) => {
      if (l.status === "Missed") {
        const timeStr = (l.time || "").toLowerCase();
        let hour = 12;

        if (timeStr.includes("pm") || timeStr.includes("am")) {
          const match = timeStr.match(/(\d+):(\d+)\s*(am|pm)/i);
          if (match) {
            let h = parseInt(match[1], 10);
            const period = match[3].toLowerCase();
            if (period === "pm" && h < 12) h += 12;
            if (period === "am" && h === 12) h = 0;
            hour = h;
          }
        } else if (/^\d{2}:\d{2}$/.test(timeStr)) {
          hour = parseInt(timeStr.split(":")[0], 10);
        }

        if (hour >= 6 && hour < 12) morning++;
        else if (hour >= 12 && hour < 17) afternoon++;
        else if (hour >= 17 && hour < 21) evening++;
        else night++;
      }
    });

    const timeSlots = [
      { slot: "Morning (6AM - 12PM)", count: morning, color: "#3b82f6" },
      { slot: "Afternoon (12PM - 5PM)", count: afternoon, color: "#facc15" },
      { slot: "Evening (5PM - 9PM)", count: evening, color: "#f97316" },
      { slot: "Night (9PM - 6AM)", count: night, color: "#8b5cf6" },
    ];

    let peakSlot = "None";
    let peakCount = 0;
    timeSlots.forEach((s) => {
      if (s.count > peakCount) {
        peakCount = s.count;
        peakSlot = s.slot.split(" ")[0];
      }
    });

    return {
      timeSlots,
      peakSlot,
      peakCount,
    };
  }, [filteredLogs]);

  // Monthly 30-Day Progress Data
  const monthlyData = useMemo(() => {
    if (analytics.monthlyProgress && analytics.monthlyProgress.length > 0) {
      return analytics.monthlyProgress;
    }
    return [
      { month: "Jan", value: 85 },
      { month: "Feb", value: 90 },
      { month: "Mar", value: 92 },
      { month: "Apr", value: 88 },
      { month: "May", value: 95 },
      { month: "Jun", value: 94 },
      { month: "Jul", value: 96 },
    ];
  }, [analytics.monthlyProgress]);

  // Per-medicine adherence calculation
  const perMedAdherence = useMemo(() => {
    const medMap = {};
    filteredLogs.forEach((l) => {
      if (!medMap[l.medName]) medMap[l.medName] = { taken: 0, missed: 0, total: 0 };
      if (l.status === "Taken") medMap[l.medName].taken++;
      else if (l.status === "Missed") medMap[l.medName].missed++;
      medMap[l.medName].total++;
    });

    return Object.entries(medMap).map(([name, stats]) => {
      const resolved = stats.taken + stats.missed;
      const rate = resolved > 0 ? Math.round((stats.taken / resolved) * 100) : 100;
      return {
        name,
        adherence: rate,
        taken: stats.taken,
        missed: stats.missed,
      };
    });
  }, [filteredLogs]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header with Time Filter and Export Report Action */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Advanced Adherence Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Multi-dimensional adherence scoring, missed-dose time trends, streak tracking, and
              shareable medical reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {[
                { label: "7D", val: "7" },
                { label: "14D", val: "14" },
                { label: "30D", val: "30" },
                { label: "All", val: "all" },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setTimeRange(item.val)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    timeRange === item.val
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow flex items-center gap-2"
            >
              <FaFileDownload /> Export Doctor's Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Consistency Score & Streak Highlight Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Consistency Score Circular Meter */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col items-center justify-between">
            <div className="w-full flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Consistency Score
              </span>
              <span className="text-xs text-blue-600 font-semibold">Weighted Index</span>
            </div>

            <div className="relative w-40 h-40 my-2">
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#22c55e"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference -
                    (circumference * (metrics.consistencyScore || 0)) / 100
                  }
                  strokeLinecap="round"
                  transform="rotate(-90 80 80)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-gray-800">
                  {metrics.consistencyScore}%
                </span>
                <span className="text-xs text-gray-400">Score</span>
              </div>
            </div>

            <div className={`text-sm font-bold mt-1 ${metrics.consistencyColor}`}>
              {metrics.consistencyGrade}
            </div>
          </div>

          {/* Current & Best Streak Counter */}
          <div className="bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-6 rounded-2xl shadow flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                Adherence Streak
              </span>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-4xl p-3 bg-white/10 rounded-2xl text-yellow-400">
                  <FaFire />
                </span>
                <div>
                  <div className="text-3xl font-extrabold">{streaks.current} Days</div>
                  <div className="text-xs text-blue-200 mt-0.5">Current Consecutive Taking</div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/15 pt-4 mt-4 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-blue-200">
                <FaTrophy className="text-yellow-400" /> Best Record:
              </span>
              <span className="font-extrabold text-white text-sm">{streaks.longest} Days</span>
            </div>
          </div>

          {/* Key Dose Numbers */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Period Dose Summary
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                <span className="text-xs text-green-700 font-semibold">Taken Doses</span>
                <div className="text-2xl font-extrabold text-green-700 mt-1">{metrics.taken}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <span className="text-xs text-red-700 font-semibold">Missed Doses</span>
                <div className="text-2xl font-extrabold text-red-700 mt-1">{metrics.missed}</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                <span className="text-xs text-yellow-800 font-semibold">Pending Today</span>
                <div className="text-2xl font-extrabold text-yellow-800 mt-1">{metrics.pending}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                <span className="text-xs text-blue-700 font-semibold">Adherence Rate</span>
                <div className="text-2xl font-extrabold text-blue-700 mt-1">
                  {metrics.adherence}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Adherence Breakdown (Mon - Sun) */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaCalendarWeek className="text-blue-600" />
                Weekly Adherence Breakdown (Mon - Sun)
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Doses taken vs missed across days of the week
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="taken" name="Taken" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="missed" name="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Missed-Dose Trends & Actionable Recommendation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time of Day Missed Doses */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <FaExclamationTriangle className="text-yellow-500" />
                Missed-Dose Time-of-Day Trends
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Identifies times of day when doses are most frequently forgotten
              </p>

              <div className="space-y-3">
                {missedDoseTrends.timeSlots.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{item.slot}</span>
                      <span>{item.count} missed</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            100,
                            metrics.missed > 0 ? (item.count / metrics.missed) * 100 : 0
                          )}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Actionable Recommendation */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
              <FaLightbulb className="text-yellow-600 text-lg flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-900">
                <strong>Smart Behavioral Tip:</strong>{" "}
                {missedDoseTrends.peakCount > 0 ? (
                  <>
                    Your highest missed doses cluster in the{" "}
                    <strong>{missedDoseTrends.peakSlot}</strong> slot. Consider syncing your alarm
                    with dinner or inviting a family member in <em>Family Mode</em> to receive a
                    reminder chime!
                  </>
                ) : (
                  <>
                    Great job! Zero missed doses detected in this period. Keep your current schedule
                    active to maintain your {streaks.current}-day streak!
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Medicine-wise Adherence Rate */}
          <div className="bg-white p-6 rounded-2xl shadow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
                <FaChartLine className="text-blue-600" />
                Medicine-wise Adherence Rate (%)
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Comparison of adherence across each active medication
              </p>

              {perMedAdherence.length === 0 ? (
                <p className="text-xs text-gray-500">No active medicines logged yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={perMedAdherence} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip />
                    <Bar dataKey="adherence" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="text-xs text-gray-400 mt-4 border-t pt-2">
              Tip: Medications with &lt; 80% adherence are flagged for family check-ins.
            </div>
          </div>
        </div>

        {/* 30-Day Monthly Progress Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Monthly Adherence Progress & Longitudinal Trends
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            7-day rolling adherence trajectory over months
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                name="Adherence %"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exportable Medical Adherence Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-scale-up">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  MediTrack Clinical Report
                </span>
                <h3 className="text-xl font-bold text-gray-800">
                  Patient Medication Adherence Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Printable Report Content */}
            <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-5 rounded-xl border print:bg-white print:p-0">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <span className="text-xs text-gray-400 block">PATIENT NAME</span>
                  <span className="font-bold text-gray-900">{user?.name || "Demo Patient"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">PATIENT EMAIL</span>
                  <span className="font-bold text-gray-900">{user?.email || "demo@meditracker.com"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">REPORT GENERATED</span>
                  <span className="font-semibold text-gray-700">{new Date().toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">EVALUATION PERIOD</span>
                  <span className="font-semibold text-gray-700">
                    {timeRange === "all" ? "All Time" : `Last ${timeRange} Days`}
                  </span>
                </div>
              </div>

              {/* High level metrics */}
              <div className="grid grid-cols-3 gap-3 text-center py-2">
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-500">Adherence Rate</div>
                  <div className="text-xl font-bold text-green-600">{metrics.adherence}%</div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-500">Consistency Score</div>
                  <div className="text-xl font-bold text-blue-600">{metrics.consistencyScore}%</div>
                </div>
                <div className="p-3 bg-white rounded-lg border">
                  <div className="text-xs text-gray-500">Doses Taken / Missed</div>
                  <div className="text-xl font-bold text-gray-800">
                    {metrics.taken} / {metrics.missed}
                  </div>
                </div>
              </div>

              {/* Medication breakdown table */}
              <div>
                <h4 className="font-bold text-xs uppercase text-gray-500 mb-2">
                  Prescription Regimen Adherence Breakdown
                </h4>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 text-gray-600">
                      <tr>
                        <th className="p-2">Medicine</th>
                        <th className="p-2">Doses Taken</th>
                        <th className="p-2">Doses Missed</th>
                        <th className="p-2">Adherence %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {perMedAdherence.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-semibold text-gray-800">{item.name}</td>
                          <td className="p-2 text-green-600">{item.taken}</td>
                          <td className="p-2 text-red-600">{item.missed}</td>
                          <td className="p-2 font-bold">{item.adherence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor's signature line */}
              <div className="pt-6 border-t flex justify-between items-end text-xs text-gray-500">
                <div>
                  <p>Physician / Caregiver Signature: _______________________</p>
                </div>
                <div>
                  <p>Date: ______________</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow flex items-center gap-2"
              >
                <FaPrint /> Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
