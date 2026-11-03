import User from "../models/user.js";

// In-memory alert log store for demo & historical lookups
const alertHistoryLog = [];

/* ================= GET FAMILY MEMBERS ================= */
export const getFamilyMembers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      caregivers: user.caregivers || [],
      consentGranted: Boolean(user.caregiverConsent),
      consentGrantedAt: user.consentGrantedAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching family members", error });
  }
};

/* ================= ADD FAMILY MEMBER ================= */
export const addFamilyMember = async (req, res) => {
  try {
    const { name, relationship, email, phone, alertOnMissed, alertOnLowRefill, weeklyDigest } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newCaregiver = {
      name,
      relationship: relationship || "Family Member",
      email: email || "",
      phone: phone || "",
      alertOnMissed: alertOnMissed !== false,
      alertOnLowRefill: alertOnLowRefill !== false,
      weeklyDigest: weeklyDigest !== false,
      status: "Active",
      addedDate: new Date(),
    };

    user.caregivers.push(newCaregiver);
    await user.save();

    res.status(201).json(newCaregiver);
  } catch (error) {
    res.status(500).json({ message: "Error adding caregiver", error });
  }
};

/* ================= DELETE FAMILY MEMBER ================= */
export const deleteFamilyMember = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.caregivers = user.caregivers.filter((c) => String(c._id) !== req.params.id);
    await user.save();

    res.status(200).json({ message: "Caregiver removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error removing caregiver", error });
  }
};

/* ================= SET PATIENT CONSENT ================= */
export const setPatientConsent = async (req, res) => {
  try {
    const { consent } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.caregiverConsent = Boolean(consent);
    if (consent) {
      user.consentGrantedAt = new Date();
    }
    await user.save();

    res.status(200).json({
      consentGranted: user.caregiverConsent,
      consentGrantedAt: user.consentGrantedAt,
      message: "Consent preference updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating consent", error });
  }
};

/* ================= DISPATCH MISSED DOSE ALERT ================= */
export const dispatchMissedDoseAlert = async (req, res) => {
  try {
    const { caregiverName, caregiverContact, patientName, medication, doseTime } = req.body;

    const alertRecord = {
      id: `alert_${Date.now()}`,
      userId: req.user._id,
      caregiverName: caregiverName || "Caregiver",
      caregiverContact: caregiverContact || "user@example.com",
      patientName: patientName || req.user.name || "Patient",
      medication: medication || "Medication",
      doseTime: doseTime || "08:00 AM",
      type: "Missed Dose Notification",
      status: "Delivered",
      timestamp: new Date().toISOString(),
      messageBody: `[URGENT MEDITRACK ALERT] ${patientName || req.user.name || "Your family member"} missed their scheduled dose of ${medication}.`,
    };

    alertHistoryLog.unshift(alertRecord);
    if (alertHistoryLog.length > 50) alertHistoryLog.pop();

    res.status(200).json(alertRecord);
  } catch (error) {
    res.status(500).json({ message: "Error dispatching alert", error });
  }
};

/* ================= GET ALERT HISTORY ================= */
export const getAlertHistory = async (req, res) => {
  try {
    const userAlerts = alertHistoryLog.filter(
      (a) => String(a.userId) === String(req.user._id)
    );
    res.status(200).json(userAlerts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching alert history", error });
  }
};

