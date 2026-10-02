// reminderCron.js

import dotenv from "dotenv";
import cron from "node-cron";
import nodemailer from "nodemailer";
import Medicine from "./models/medicine.js";
import { getDueReminderLogs } from "./utils/reminderSchedule.js";

dotenv.config();

// -----------------------------
// Configure Nodemailer
// -----------------------------
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true", // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

// -----------------------------
// Helper function to send email
// -----------------------------
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"MediTracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email reminder sent to ${to}`);
    return true;
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err.message);
    return false;
  }
};

// -----------------------------
// Cron Job (runs every minute)
// -----------------------------
cron.schedule("* * * * *", async () => {
  console.log(`[${new Date().toISOString()}] Checking medicine reminders...`);

  try {
    const now = new Date();
    const medicines = await Medicine.find({ isActive: true }).populate("user");

    for (const med of medicines) {
      if (!med.user || !med.user.email) {
        console.log(`Skipping medicine ${med.name} (user email missing)`);
        continue;
      }

      const dueLogs = getDueReminderLogs(med, now);
      for (const log of dueLogs) {
        const sent = await sendEmail(
          med.user.email,
          `Medicine Reminder: ${med.name}`,
          `It's time to take your medicine:\n\nMedicine: ${med.name}\nDosage: ${med.dosage}\nScheduled time: ${log.time}`
        );

        if (sent) {
          log.reminderSentAt = now;
          await med.save();
        }
      }
    }
  } catch (err) {
    console.error("Reminder cron error:", err.message);
  }
});