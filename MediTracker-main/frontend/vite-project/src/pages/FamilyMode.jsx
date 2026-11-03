// src/pages/FamilyMode.jsx
import React, { useState, useEffect, useContext } from "react";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";
import {
  FaUserFriends,
  FaShieldAlt,
  FaBell,
  FaCheckCircle,
  FaPlus,
  FaTrash,
  FaPaperPlane,
  FaEnvelope,
  FaPhoneAlt,
  FaHeartbeat,
  FaExclamationCircle,
  FaUserNurse,
  FaEye,
  FaTimes,
} from "react-icons/fa";

const FamilyMode = () => {
  const { user } = useContext(AppContext);
  const userId = user?._id || user?.id || "demo_patient_001";
  const storageFamilyKey = `meditracker_family_${userId}`;
  const storageConsentKey = `meditracker_family_consent_${userId}`;
  const storageAlertsKey = `meditracker_family_alerts_${userId}`;

  // Consent state
  const [consentGranted, setConsentGranted] = useState(() => {
    return localStorage.getItem(storageConsentKey) === "true";
  });
  const [consentDate, setConsentDate] = useState(() => {
    return localStorage.getItem(`${storageConsentKey}_date`) || new Date().toISOString();
  });

  // Caregivers list
  const [caregivers, setCaregivers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewAlert, setPreviewAlert] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [viewMode, setViewMode] = useState("members"); // 'members' | 'patient_overview'
  const [todaySchedule, setTodaySchedule] = useState([]);

  // New caregiver form
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Family Member",
    email: "",
    phone: "",
    alertOnMissed: true,
    alertOnLowRefill: true,
    weeklyDigest: true,
  });

  // Load family members, consent, and alert history
  const loadFamilyData = async () => {
    // 1. Load consent
    const storedConsent = localStorage.getItem(storageConsentKey) === "true";
    setConsentGranted(storedConsent);

    // 2. Load caregivers
    let savedMembers = [];
    try {
      savedMembers = JSON.parse(localStorage.getItem(storageFamilyKey) || "[]");
    } catch (_) {
      savedMembers = [];
    }

    // Seed default sample family member if completely empty for demo
    if (savedMembers.length === 0) {
      savedMembers = [
        {
          id: "cg_1",
          name: "Sarah Jenkins",
          relationship: "Spouse",
          email: "sarah.jenkins@example.com",
          phone: "+1 (555) 234-5678",
          alertOnMissed: true,
          alertOnLowRefill: true,
          weeklyDigest: true,
          status: "Active",
          addedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        },
        {
          id: "cg_2",
          name: "Dr. Robert Miller",
          relationship: "Primary Caregiver",
          email: "caregiver.robert@healthnet.org",
          phone: "+1 (555) 876-5432",
          alertOnMissed: true,
          alertOnLowRefill: false,
          weeklyDigest: true,
          status: "Active",
          addedDate: new Date(Date.now() - 14 * 86400000).toISOString(),
        },
      ];
      localStorage.setItem(storageFamilyKey, JSON.stringify(savedMembers));
    }
    setCaregivers(savedMembers);

    // 3. Load alerts
    try {
      const savedAlerts = JSON.parse(localStorage.getItem(storageAlertsKey) || "[]");
      setAlerts(savedAlerts);
    } catch (_) {
      setAlerts([]);
    }

    // 4. Fetch dashboard schedule for caregiver view
    try {
      const res = await API.get("/dashboard/stats");
      setTodaySchedule(res.data.todaySchedule || []);
    } catch (err) {
      console.warn("Schedule fetch in family mode:", err);
    }
  };

  useEffect(() => {
    loadFamilyData();
  }, [userId]);

  // Toggle consent
  const toggleConsent = () => {
    const next = !consentGranted;
    const now = new Date().toISOString();
    setConsentGranted(next);
    localStorage.setItem(storageConsentKey, String(next));
    if (next) {
      localStorage.setItem(`${storageConsentKey}_date`, now);
      setConsentDate(now);
      setFeedbackMsg("Consent granted. Designated family members will now receive missed-dose alerts.");
    } else {
      setFeedbackMsg("Consent revoked. Missed-dose alerts to family members are paused.");
    }
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  // Add new caregiver
  const handleAddCaregiver = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || (!formData.email.trim() && !formData.phone.trim())) {
      alert("Please provide a name and at least an email or phone number.");
      return;
    }

    const newMember = {
      id: `cg_${Date.now()}`,
      ...formData,
      status: "Active",
      addedDate: new Date().toISOString(),
    };

    const updated = [...caregivers, newMember];
    setCaregivers(updated);
    localStorage.setItem(storageFamilyKey, JSON.stringify(updated));

    setModalOpen(false);
    setFormData({
      name: "",
      relationship: "Family Member",
      email: "",
      phone: "",
      alertOnMissed: true,
      alertOnLowRefill: true,
      weeklyDigest: true,
    });

    setFeedbackMsg(`Added ${newMember.name} (${newMember.relationship}) to your care network!`);
    setTimeout(() => setFeedbackMsg(""), 4000);
  };

  // Remove caregiver
  const handleRemoveCaregiver = (id) => {
    const member = caregivers.find((c) => c.id === id);
    if (!window.confirm(`Remove ${member?.name || "this caregiver"} from your family alert network?`)) {
      return;
    }
    const updated = caregivers.filter((c) => c.id !== id);
    setCaregivers(updated);
    localStorage.setItem(storageFamilyKey, JSON.stringify(updated));
    setFeedbackMsg("Caregiver removed.");
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // Trigger simulated missed-dose alert
  const handleSendTestAlert = (caregiver) => {
    if (!consentGranted) {
      alert("Please enable User Consent first before sending caregiver alerts.");
      return;
    }

    const patientName = user?.name || "Demo Patient";
    const medName = "Amoxicillin 500mg";
    const doseTime = "08:00 AM";

    const alertRecord = {
      id: `alert_${Date.now()}`,
      caregiverName: caregiver.name,
      caregiverContact: caregiver.email || caregiver.phone,
      patientName,
      medication: medName,
      doseTime,
      type: "Missed Dose Notification",
      status: "Delivered",
      timestamp: new Date().toISOString(),
      messageBody: `[URGENT MEDITRACK ALERT] Hi ${caregiver.name}, your family member ${patientName} has missed their scheduled ${doseTime} dose of ${medName}. Please check in to provide encouragement and ensure medication adherence.`,
    };

    const updatedAlerts = [alertRecord, ...alerts.slice(0, 19)];
    setAlerts(updatedAlerts);
    localStorage.setItem(storageAlertsKey, JSON.stringify(updatedAlerts));

    // Show realistic SMS/Email preview modal
    setPreviewAlert(alertRecord);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl p-3 bg-blue-100 text-blue-600 rounded-xl">
                <FaUserFriends />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Caregiver & Family Mode
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Connect trusted family members to receive instant missed-dose alerts with
                  explicit user consent. Adds care accountability and peace of mind.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "members" ? "patient_overview" : "members")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition border flex items-center gap-2 ${
                viewMode === "patient_overview"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
              }`}
            >
              <FaEye /> {viewMode === "members" ? "Caregiver View" : "Manage Members"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow flex items-center gap-2"
            >
              <FaPlus /> Add Family Member
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded-xl flex items-center gap-2 shadow-sm animate-fade-in">
            <FaCheckCircle className="text-green-600 text-lg" />
            {feedbackMsg}
          </div>
        )}

        {/* User Consent & Privacy Card */}
        <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-600">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                  consentGranted ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                }`}
              >
                <FaShieldAlt />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-800">
                    Patient Consent for Missed-Dose Notifications
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      consentGranted
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    {consentGranted ? "Consent Granted" : "Consent Paused"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 max-w-2xl">
                  By enabling this consent, MediTrack is authorized to notify your selected family
                  members or caregivers via email/SMS whenever a scheduled medicine dose is
                  missed or neglected. You retain full control and may pause this at any time.
                </p>
                {consentGranted && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    ✓ Active authorization recorded on:{" "}
                    {new Date(consentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGranted}
                  onChange={toggleConsent}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm font-semibold text-gray-700">
                {consentGranted ? "Alerts Enabled" : "Alerts Off"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= CAREGIVER REASSURANCE VIEW ================= */}
        {viewMode === "patient_overview" && (
          <div className="bg-white p-6 rounded-2xl shadow space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Caregiver Portal Mode
                </span>
                <h2 className="text-xl font-bold text-gray-800">
                  Patient Daily Adherence Summary: {user?.name || "Demo Patient"}
                </h2>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                <FaHeartbeat className="text-green-600" /> Patient Active
              </span>
            </div>

            {/* Today schedule breakdown for family */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Today's Schedule & Status</h3>
              {todaySchedule.length === 0 ? (
                <p className="text-gray-500 text-sm">No scheduled doses for today.</p>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((item) => (
                    <div
                      key={item.logId}
                      className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100"
                    >
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">
                          {item.name} ({item.dosage})
                        </div>
                        <div className="text-xs text-gray-500">{item.time} Scheduled</div>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-bold ${
                          item.status === "Taken"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : item.status === "Missed"
                            ? "bg-red-100 text-red-700 border border-red-300"
                            : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Reassurance Check-In */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-blue-800">
                <strong>Need to check in?</strong> Send a quick encouragement text or call to remind
                them about remaining doses.
              </div>
              <button
                type="button"
                onClick={() =>
                  alert("Encouraging check-in reminder queued! Message: 'Thinking of you! Remember to take your evening meds.'")
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition shadow"
              >
                Send Gentle Encouragement ❤️
              </button>
            </div>
          </div>
        )}

        {/* ================= CAREGIVER CARDS GRID ================= */}
        {viewMode === "members" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FaUserNurse className="text-blue-600" />
                Connected Family Members & Caregivers ({caregivers.length})
              </h2>
              <span className="text-xs text-gray-400">
                {consentGranted ? "Auto-alerts active" : "Consent required for alerts"}
              </span>
            </div>

            {caregivers.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl shadow text-gray-500">
                <FaUserFriends className="text-4xl text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">No Caregivers Added Yet</h3>
                <p className="text-sm mt-1">
                  Add family members to help you stay accountable and never miss a critical dose.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                >
                  + Add First Family Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {caregivers.map((cg) => (
                  <div
                    key={cg.id}
                    className="bg-white rounded-2xl p-5 shadow border border-gray-100 hover:border-blue-300 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-gray-800">{cg.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold">
                              {cg.relationship}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Connected on {new Date(cg.addedDate).toLocaleDateString()}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCaregiver(cg.id)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition text-sm"
                          title="Remove Caregiver"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* Contact Info */}
                      <div className="bg-gray-50 p-3 rounded-xl space-y-1.5 text-xs text-gray-600 mb-4">
                        {cg.email && (
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400" />
                            <span>{cg.email}</span>
                          </div>
                        )}
                        {cg.phone && (
                          <div className="flex items-center gap-2">
                            <FaPhoneAlt className="text-gray-400" />
                            <span>{cg.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Subscriptions */}
                      <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                        <div className="font-semibold text-gray-700 mb-1">Alert Subscriptions:</div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cg.alertOnMissed ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span>Missed-dose instant notifications</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cg.alertOnLowRefill ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span>Low medication stock warnings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cg.weeklyDigest ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span>Weekly adherence progress report</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="border-t pt-3 flex items-center justify-between gap-2">
                      <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                        <FaCheckCircle className="text-xs" /> {cg.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendTestAlert(cg)}
                        className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition flex items-center gap-1.5"
                      >
                        <FaPaperPlane className="text-xs" /> Send Test Alert
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alert Dispatch History */}
        {alerts.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaBell className="text-blue-600" />
              Recent Missed-Dose Alerts Dispatched
            </h2>
            <div className="divide-y divide-gray-100">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-gray-800">
                      Alert sent to {alert.caregiverName} ({alert.caregiverContact})
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Medication: {alert.medication} • Dose: {alert.doseTime}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 font-semibold rounded-full">
                      {alert.status}
                    </span>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Caregiver Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-800">Add Family Member / Caregiver</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddCaregiver} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Relationship</label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Spouse">Spouse / Partner</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child (Son / Daughter)</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Primary Caregiver">Primary Caregiver / Nurse</option>
                  <option value="Doctor">Doctor / Physician</option>
                  <option value="Friend">Trusted Friend</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Phone Number (for SMS Alerts)
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 pt-2 border-t text-xs text-gray-700">
                <span className="font-semibold block text-gray-800">Alert Preferences:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alertOnMissed}
                    onChange={(e) => setFormData({ ...formData, alertOnMissed: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Send instant alert when a dose is missed</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.alertOnLowRefill}
                    onChange={(e) => setFormData({ ...formData, alertOnLowRefill: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Send low medication stock warnings</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.weeklyDigest}
                    onChange={(e) => setFormData({ ...formData, weeklyDigest: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>Send weekly adherence summary email</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow"
                >
                  Save Caregiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realistic Simulated Alert Popover Preview */}
      {previewAlert && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <FaExclamationCircle />
                </span>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    Simulated Caregiver Alert Preview
                  </h3>
                  <p className="text-xs text-gray-400">Delivered via SMS & Email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewAlert(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="bg-gray-900 text-white p-4 rounded-xl font-mono text-xs space-y-2">
              <div className="text-gray-400">
                TO: {previewAlert.caregiverName} &lt;{previewAlert.caregiverContact}&gt;
              </div>
              <div className="text-gray-400">SUBJECT: ⚠️ MediTrack: Missed Dose Notification</div>
              <div className="text-gray-400">TIMESTAMP: {new Date(previewAlert.timestamp).toLocaleString()}</div>
              <div className="border-t border-gray-700 pt-2 text-green-400">
                {previewAlert.messageBody}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              When a dose is marked Missed or unattended past its scheduled window, this exact
              alert is dispatched automatically to this caregiver.
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewAlert(null)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMode;

