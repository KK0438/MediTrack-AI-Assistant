import express from "express";
import {
  getFamilyMembers,
  addFamilyMember,
  deleteFamilyMember,
  setPatientConsent,
  dispatchMissedDoseAlert,
  getAlertHistory,
} from "../controllers/familyController.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getFamilyMembers);
router.post("/", addFamilyMember);
router.delete("/:id", deleteFamilyMember);
router.post("/consent", setPatientConsent);
router.post("/send-alert", dispatchMissedDoseAlert);
router.get("/alerts", getAlertHistory);

export default router;

