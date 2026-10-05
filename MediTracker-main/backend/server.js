// server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import axios from "axios";

// Correctly import the named export
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.js";
import contactRoutes from "./routes/contact.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import chatbotRoute from "./routes/chatbotRoute.js";

// Start reminder cron job (MongoDB connection inside cron will reuse)
import "./reminderCron.js";

dotenv.config();

const app = express();
const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
  "https://meditracker-public.vercel.app",
]);

// ---------------------------
// Middleware
// ---------------------------
app.use(express.json({ limit: "10mb" }));

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
  })
);

app.use(morgan("dev"));

// ---------------------------
// API Routes
// ---------------------------
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/chatbot", chatbotRoute);

// ---------------------------
// Blog API Proxy
// ---------------------------
app.get("/api/blogs", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?category=health&language=en&pageSize=12&apiKey=${process.env.NEWS_API_KEY}`
    );

    res.json(response.data.articles);
  } catch (error) {
    console.error("Error fetching blogs:", error.message);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// ---------------------------
// Test Route
// ---------------------------
app.get("/", (req, res) => {
  res.send("MediTrack Backend API is running...");
});

app.delete("/api/auth/clear-test-user/:email", async (req, res) => {
  try {
    const User = (await import("./models/user.js")).default;
    await User.deleteOne({ email: req.params.email });
    res.json({ success: true, message: `User ${req.params.email} cleared` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// Error Handler
// ---------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

import { seedDemoData } from "./utils/seedDemoData.js";

// ---------------------------
// Start Server
// ---------------------------
const PORT = process.env.PORT || 4000;

connectDB().then(async () => {
  await seedDemoData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});