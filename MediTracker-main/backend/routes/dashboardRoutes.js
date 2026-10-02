// routes/dashboardRoutes.js
import express from "express";
import { 
  getDashboardStats, 
  markDose, 
  getHistory,
  getAnalytics,
  getMedicineStatus
} from "../controllers/medicineController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get dashboard stats
router.get("/stats", authMiddleware, getDashboardStats);

// Mark a dose as Taken or Missed
router.put("/mark-dose/:medicineId", authMiddleware, markDose);

// Get medicine history
router.get("/history", authMiddleware, getHistory);

// Get analytics data
router.get("/analytics", authMiddleware, getAnalytics);

// ✅ Calendar medicine status
router.get("/medicine-status", authMiddleware, getMedicineStatus);

export default router;