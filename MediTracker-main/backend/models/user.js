// models/User.js
import mongoose from "mongoose";

const caregiverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, default: "Caregiver" },
  email: { type: String, default: "" },
  phone: { type: String, default: "" },
  alertOnMissed: { type: Boolean, default: true },
  alertOnLowRefill: { type: Boolean, default: true },
  weeklyDigest: { type: Boolean, default: true },
  status: { type: String, default: "Active" },
  addedDate: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profilePic: {
      type: String,
      default: "",
    },

    caregiverConsent: {
      type: Boolean,
      default: false,
    },
    consentGrantedAt: {
      type: Date,
    },

    caregivers: [caregiverSchema],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
