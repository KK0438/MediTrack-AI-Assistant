import express from "express";
import { updateProfilePic } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.put(
  "/update-profile-pic",
  authMiddleware,
  upload.single("profilePic"),
  updateProfilePic
);

export default router;