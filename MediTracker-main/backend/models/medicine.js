import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: {
    type: String,
    enum: ["Daily", "Weekly", "Once", "Custom"],
    default: "Daily",
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  times: [
    {
      type: String, // Example: "09:00 AM"
    },
  ],
  logs: [
    {
      date: { type: Date, required: true },
      time: { type: String, required: true },
      status: {
        type: String,
        enum: ["Pending", "Taken", "Missed"],
        default: "Pending",
      },
      reminderSentAt: { type: Date },
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Medicine", MedicineSchema);