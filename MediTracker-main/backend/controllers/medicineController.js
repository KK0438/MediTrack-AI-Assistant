import Medicine from "../models/medicine.js";
import { generateDoseLogs, localDay } from "../utils/reminderSchedule.js";

/* ================= ADD MEDICINE ================= */
export const addMedicine = async (req, res) => {
  try {
    const { name, dosage, frequency, times } = req.body;
    const startDate = localDay(req.body.startDate);
    const endDate = localDay(req.body.endDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      startDate > endDate
    ) {
      return res.status(400).json({ message: "Enter a valid medicine date range" });
    }

    if (
      !Array.isArray(times) ||
      times.length === 0 ||
      times.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
    ) {
      return res.status(400).json({ message: "Enter at least one valid dose time" });
    }

    const logs = generateDoseLogs(startDate, endDate, times, frequency);

    const newMedicine = new Medicine({
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      times,
      logs,
      user: req.user._id,
    });

    const savedMedicine = await newMedicine.save();
    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(500).json({ message: "Error adding medicine", error });
  }
};

/* ================= GET MEDICINES ================= */
export const getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ message: "Error fetching medicines", error });
  }
};

/* ================= UPDATE MEDICINE ================= */
export const updateMedicine = async (req, res) => {
  try {
    const updatedMedicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updatedMedicine)
      return res.status(404).json({ message: "Medicine not found" });

    res.status(200).json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ message: "Error updating medicine", error });
  }
};

/* ================= DELETE MEDICINE ================= */
export const deleteMedicine = async (req, res) => {
  try {
    const deletedMedicine = await Medicine.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedMedicine)
      return res.status(404).json({ message: "Medicine not found" });

    res.status(200).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting medicine", error });
  }
};

/* ================= MARK DOSE ================= */
export const markDose = async (req, res) => {
  try {
    const { status, date, time } = req.body;
    const medicineId = req.params.medicineId;

    const medicine = await Medicine.findOne({
      _id: medicineId,
      user: req.user._id,
    });

    if (!medicine)
      return res.status(404).json({ message: "Medicine not found" });

    const log = medicine.logs.find(
      (l) =>
        new Date(l.date).toDateString() === new Date(date).toDateString() &&
        l.time === time
    );

    if (!log)
      return res.status(404).json({ message: "Dose not found" });

    log.status = status;

    await medicine.save();

    res.json({ message: `Dose marked as ${status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DASHBOARD STATS ================= */
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalMedicines = await Medicine.countDocuments({ user: userId });
    const medicines = await Medicine.find({ user: userId });

    let missedDoses = 0;
    let todayDoses = 0;
    let takenDoses = 0;

    const todaySchedule = [];
    let upcomingSchedule = [];

    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    for (const medicine of medicines) {
      let updated = false;

      for (const log of medicine.logs || []) {
        const logDate = new Date(log.date);
        const [hours, minutes] = log.time.split(":").map(Number);
        const logDateTime = new Date(logDate);
        logDateTime.setHours(hours, minutes, 0, 0);

        // ===== AUTO MARK MISSED (30 min grace for past doses) =====
        if (
          log.status === "Pending" &&
          now.getTime() > logDateTime.getTime() + 30 * 60000
        ) {
          log.status = "Missed";
          updated = true;
        }

        // ===== LIFETIME MISSED COUNT =====
        if (log.status === "Missed") missedDoses++;

        // ===== TODAY SCHEDULE =====
        if (logDate >= today && logDate < tomorrow) {
          todayDoses++;
          if (log.status === "Taken") takenDoses++;

          todaySchedule.push({
            logId: log._id,
            medicineId: medicine._id,
            name: medicine.name,
            dosage: medicine.dosage,
            date: log.date,
            time: log.time,
            status: log.status,
          });
        }

        // ===== UPCOMING SCHEDULE =====
        if (log.status === "Pending" && logDateTime > now) {
          upcomingSchedule.push({
            logId: log._id,
            medicineId: medicine._id,
            name: medicine.name,
            dosage: medicine.dosage,
            date: log.date,
            time: log.time,
            status: log.status,
            fullDateTime: logDateTime,
          });
        }
      }

      if (updated) await medicine.save();
    }

    // ===== SORT UPCOMING BY NEAREST TIME =====
    upcomingSchedule.sort((a, b) => a.fullDateTime - b.fullDateTime);

    // ===== SHOW ONLY NEXT 2 UPCOMING =====
    upcomingSchedule = upcomingSchedule.slice(0, 2);

    res.json({
      stats: { totalMedicines, missedDoses, todayDoses, takenDoses },
      todaySchedule,
      upcomingSchedule,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET HISTORY ================= */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const medicines = await Medicine.find({ user: userId });
    const history = [];

    const now = new Date();

    medicines.forEach((med) => {
      med.logs.forEach((log) => {
        const logDateTime = new Date(log.date);
        const [hours, minutes] = log.time.split(":").map(Number);
        logDateTime.setHours(hours, minutes, 0, 0);

        // Only include past logs (Taken or Missed)
        if (logDateTime <= now && log.status !== "Pending") {
          history.push({
            medicineName: med.name,
            dose: med.dosage,
            date: log.date,
            time: log.time,
            status: log.status,
          });
        }
      });
    });

    // Sort latest first
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const medicines = await Medicine.find({ user: userId });

    let total = 0;
    let taken = 0;
    let missed = 0;
    let pending = 0;

    medicines.forEach((medicine) => {

      if (!medicine.logs || medicine.logs.length === 0) return;

      medicine.logs.forEach((log) => {

        total++;

        if (log.status === "Taken") {
          taken++;
        } 
        else if (log.status === "Missed") {
          missed++;
        } 
        else {
          pending++;
        }

      });

    });

    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

    res.status(200).json({
      total,
      taken,
      missed,
      pending,
      adherence
    });

  } catch (error) {
    console.log("Analytics error:", error);
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};



// GET /api/dashboard/medicine-status
export const getMedicineStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all medicines for this user
    const medicines = await Medicine.find({ user: userId });

    let result = [];

    medicines.forEach((med) => {
      const start = new Date(med.startDate);
      const end = new Date(med.endDate);

      // Loop through all dates from startDate to endDate
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {

        // ✅ Normalize date to local YYYY-MM-DD string (ignoring timezones)
        const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        // Check if there is a log for this date
        const log = med.logs?.find((l) => {
          const logDate = new Date(l.date);
          const logDateString = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, "0")}-${String(logDate.getDate()).padStart(2, "0")}`;
          return logDateString === dateString;
        });

        let status = "pending"; // default if no log
        if (log) {
          status = log.status; // Taken or Missed
        }

        result.push({
          date: dateString,
          status: status.toLowerCase(), // lowercase for frontend
        });
      }
    });

    // Return the array of all dates with status
    res.json(result);

  } catch (error) {
    console.error("getMedicineStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};