// src/pages/RefillTracker.jsx
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";
import {
  FaPills,
  FaExclamationTriangle,
  FaCheckCircle,
  FaPlus,
  FaCalendarAlt,
  FaHistory,
  FaClock,
  FaPrescriptionBottleAlt,
  FaSortAmountDown,
} from "react-icons/fa";

const RefillTracker = () => {
  const { user } = useContext(AppContext);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'low' | 'critical' | 'good'
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [refillAmount, setRefillAmount] = useState(30);
  const [refillNotes, setRefillNotes] = useState("");
  const [refillHistory, setRefillHistory] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Fetch medicines and calculate refill projections
  const fetchRefillData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/medicines");
      const meds = res.data || [];
      setMedicines(meds);

      // Load stored refill history from localStorage
      const historyKey = `meditracker_refill_history_${user?._id || user?.id || "demo"}`;
      const savedHistory = JSON.parse(localStorage.getItem(historyKey) || "[]");
      setRefillHistory(savedHistory);
    } catch (error) {
      console.error("Error fetching refill data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefillData();
  }, [user?._id || user?.id || user?.email]);

  // Calculate daily consumption and days of supply remaining
  const calculateRefillMetrics = (med) => {
    const timesPerDay = Array.isArray(med.times) && med.times.length > 0 ? med.times.length : 1;
    const dosePerIntake = Number(med.dosePerIntake) || 1;
    let dailyIntake = timesPerDay * dosePerIntake;
    if (med.frequency === "Weekly") dailyIntake = dosePerIntake / 7;
    if (med.frequency === "Once") dailyIntake = dosePerIntake;

    const currentStock = Math.max(0, Number(med.currentStock !== undefined ? med.currentStock : 30));
    const threshold = Number(med.refillThreshold) || 5;

    const daysRemaining = dailyIntake > 0 ? Math.floor(currentStock / dailyIntake) : 30;
    
    const runOutDate = new Date();
    runOutDate.setDate(runOutDate.getDate() + daysRemaining);

    let status = "good"; // 'good' | 'low' | 'critical' | 'empty'
    if (currentStock <= 0) status = "empty";
    else if (daysRemaining <= 3 || currentStock <= threshold) status = "critical";
    else if (daysRemaining <= 7) status = "low";

    return {
      currentStock,
      threshold,
      dailyIntake: Math.round(dailyIntake * 10) / 10,
      daysRemaining,
      runOutDate,
      status,
      unit: med.unit || "tablets",
    };
  };

  // Quick Refill handler (+15, +30, etc.)
  const handleQuickRefill = async (med, amount) => {
    const metrics = calculateRefillMetrics(med);
    const newStock = metrics.currentStock + amount;

    try {
      await API.put(`/medicines/${med._id}`, {
        ...med,
        currentStock: newStock,
        lastRefillDate: new Date().toISOString(),
      });

      // Log refill history
      const historyKey = `meditracker_refill_history_${user?._id || user?.id || "demo"}`;
      const newEntry = {
        id: `refill_${Date.now()}`,
        medName: med.name,
        amount,
        unit: metrics.unit,
        date: new Date().toISOString(),
        previousStock: metrics.currentStock,
        newStock,
      };
      const updatedHistory = [newEntry, ...refillHistory.slice(0, 19)];
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      setRefillHistory(updatedHistory);

      setFeedbackMsg(`Successfully added +${amount} ${metrics.unit} to ${med.name}!`);
      setTimeout(() => setFeedbackMsg(""), 3500);

      fetchRefillData();
    } catch (err) {
      console.error("Refill error:", err);
      alert("Failed to update refill. Please try again.");
    }
  };

  // Submit custom modal refill
  const handleCustomRefillSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMed) return;

    const added = Number(refillAmount) || 0;
    if (added <= 0) {
      alert("Please enter a valid refill amount.");
      return;
    }

    await handleQuickRefill(selectedMed, added);
    setRefillModalOpen(false);
    setSelectedMed(null);
    setRefillNotes("");
  };

  // Aggregate high-level stats
  const enrichedMeds = medicines.map((m) => ({ ...m, metrics: calculateRefillMetrics(m) }));
  const lowCount = enrichedMeds.filter((m) => m.metrics.status === "low" || m.metrics.status === "critical" || m.metrics.status === "empty").length;
  const criticalCount = enrichedMeds.filter((m) => m.metrics.status === "critical" || m.metrics.status === "empty").length;
  const totalPills = enrichedMeds.reduce((acc, m) => acc + m.metrics.currentStock, 0);

  // Filter list
  const filteredMeds = enrichedMeds.filter((m) => {
    if (filter === "low") return m.metrics.status === "low" || m.metrics.status === "critical" || m.metrics.status === "empty";
    if (filter === "critical") return m.metrics.status === "critical" || m.metrics.status === "empty";
    if (filter === "good") return m.metrics.status === "good";
    return true;
  });

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaPrescriptionBottleAlt />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Smart Refill Tracker
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Automated pill counter estimates remaining tablets based on dose history and
                  warns you before medicines run out.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to="/dashboard/scanner"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow flex items-center gap-2"
            >
              <FaPills /> Scan Prescription
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Feedback alert toast */}
        {feedbackMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
            <FaCheckCircle className="text-green-600 text-lg" />
            {feedbackMsg}
          </div>
        )}

        {/* High-level Refill Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-600 text-white p-5 rounded-2xl shadow">
            <div className="text-xs uppercase font-semibold text-blue-100">Total Tracked Meds</div>
            <div className="text-3xl font-extrabold mt-2">{medicines.length}</div>
            <div className="text-xs text-blue-200 mt-1">Active daily prescriptions</div>
          </div>

          <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow">
            <div className="text-xs uppercase font-semibold text-indigo-100">Total Stock Remaining</div>
            <div className="text-3xl font-extrabold mt-2">{totalPills}</div>
            <div className="text-xs text-indigo-200 mt-1">Combined tablets / units</div>
          </div>

          <div
            className={`p-5 rounded-2xl shadow text-white ${
              criticalCount > 0 ? "bg-red-500" : "bg-green-600"
            }`}
          >
            <div className="text-xs uppercase font-semibold text-white/90">Critical Stock</div>
            <div className="text-3xl font-extrabold mt-2">{criticalCount}</div>
            <div className="text-xs text-white/80 mt-1">
              {criticalCount > 0 ? "Refills urgently needed!" : "All medicines stocked"}
            </div>
          </div>

          <div className="bg-yellow-500 text-white p-5 rounded-2xl shadow">
            <div className="text-xs uppercase font-semibold text-yellow-100">Low Stock (&lt; 7 Days)</div>
            <div className="text-3xl font-extrabold mt-2">{lowCount}</div>
            <div className="text-xs text-yellow-100 mt-1">Running low this week</div>
          </div>
        </div>

        {/* Critical Refill Warning Banner (if any) */}
        {criticalCount > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex items-center justify-between gap-4 text-red-800">
            <div className="flex items-center gap-3">
              <span className="text-2xl text-red-600">
                <FaExclamationTriangle />
              </span>
              <div>
                <span className="font-bold text-sm block">
                  Action Required: {criticalCount} medication(s) will run out in 3 days or less!
                </span>
                <span className="text-xs text-red-700">
                  Click the Quick Refill button below or contact your pharmacy to avoid missed doses.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFilter("critical")}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
            >
              View Critical
            </button>
          </div>
        )}

        {/* Filter controls */}
        <div className="bg-white p-4 rounded-2xl shadow flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase mr-1 flex items-center gap-1">
              <FaSortAmountDown /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Medications ({enrichedMeds.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("low")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "low" ? "bg-yellow-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Needs Refill ({lowCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("critical")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "critical" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Critical / Empty ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("good")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filter === "good" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Well Stocked ({enrichedMeds.length - lowCount})
            </button>
          </div>

          <span className="text-xs text-gray-400">
            Stock automatically updates when doses are marked 'Taken'
          </span>
        </div>

        {/* Medicines Refill Cards Grid */}
        {filteredMeds.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow text-gray-500">
            <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700">No medicines in this category</h3>
            <p className="text-sm mt-1">All your medications are properly tracked and stocked.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredMeds.map((med) => {
              const { currentStock, dailyIntake, daysRemaining, runOutDate, status, unit } = med.metrics;

              // Progress bar fill percentage (based on 30 days cap)
              const percentage = Math.min(100, Math.max(0, Math.round((daysRemaining / 30) * 100)));

              const statusBadge = {
                empty: { text: "Out of Stock", bg: "bg-red-100 text-red-700 border-red-300" },
                critical: { text: "Critical Refill", bg: "bg-red-100 text-red-700 border-red-300" },
                low: { text: "Refill Soon", bg: "bg-yellow-100 text-yellow-800 border-yellow-300" },
                good: { text: "In Stock", bg: "bg-green-100 text-green-700 border-green-300" },
              }[status];

              const progressColor = {
                empty: "bg-red-600",
                critical: "bg-red-500",
                low: "bg-yellow-500",
                good: "bg-green-500",
              }[status];

              return (
                <div
                  key={med._id}
                  className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:border-blue-300 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top: Title & Status Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{med.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{med.dosage}</p>
                      </div>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${statusBadge.bg}`}
                      >
                        {statusBadge.text}
                      </span>
                    </div>

                    {/* Stock & Days Remaining Highlight */}
                    <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Remaining Stock</div>
                        <div className="text-xl font-extrabold text-gray-800 mt-0.5">
                          {currentStock}{" "}
                          <span className="text-xs font-normal text-gray-500">{unit}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Estimated Supply</div>
                        <div
                          className={`text-xl font-extrabold mt-0.5 ${
                            status === "critical" || status === "empty"
                              ? "text-red-600"
                              : status === "low"
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {daysRemaining}{" "}
                          <span className="text-xs font-normal text-gray-500">days left</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Stock Level Gauge */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                        <span>Pill Level</span>
                        <span>{percentage}% full (~30d baseline)</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Estimation & Prescription Details */}
                    <div className="text-xs text-gray-500 space-y-1 mb-4 border-t pt-3">
                      <div className="flex justify-between">
                        <span>Daily Intake:</span>
                        <span className="font-semibold text-gray-700">
                          {dailyIntake} {unit}/day ({med.frequency})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Run-out:</span>
                        <span
                          className={`font-semibold ${
                            daysRemaining <= 3 ? "text-red-600" : "text-gray-700"
                          }`}
                        >
                          {runOutDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Scheduled Times:</span>
                        <span className="font-semibold text-gray-700">
                          {med.times?.join(", ") || "09:00 AM"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Refill Quick Buttons */}
                  <div className="border-t pt-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Quick Refill:</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickRefill(med, 15)}
                        className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition"
                      >
                        +15
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRefill(med, 30)}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                      >
                        +30 (1 Mo)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickRefill(med, 60)}
                        className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                      >
                        +60
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMed(med);
                          setRefillAmount(30);
                          setRefillModalOpen(true);
                        }}
                        className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition"
                      >
                        Custom...
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refill History Log */}
        {refillHistory.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaHistory className="text-blue-600" />
              Recent Refill Activity
            </h2>
            <div className="divide-y divide-gray-100">
              {refillHistory.slice(0, 5).map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-gray-800">{log.medName}</span>
                    <span className="text-gray-500 text-xs ml-2">
                      added +{log.amount} {log.unit} (New total: {log.newStock})
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(log.date).toLocaleDateString()} •{" "}
                    {new Date(log.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Refill Modal */}
      {refillModalOpen && selectedMed && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">
                Refill Stock: {selectedMed.name}
              </h3>
              <button
                type="button"
                onClick={() => setRefillModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCustomRefillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Tablets / Units to Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={refillAmount}
                  onChange={(e) => setRefillAmount(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Pharmacy / Refill Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rx #12345 from Walgreens"
                  value={refillNotes}
                  onChange={(e) => setRefillNotes(e.target.value)}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800">
                Current stock: <strong>{selectedMed.metrics?.currentStock || 0}</strong>. After refill:{" "}
                <strong>
                  {(selectedMed.metrics?.currentStock || 0) + (Number(refillAmount) || 0)}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefillModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow"
                >
                  Confirm Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefillTracker;
