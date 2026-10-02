import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// -----------------------------
// Configure Mail Transporter
// -----------------------------
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// -----------------------------
// Log File Setup
// -----------------------------
const logFolder = path.join(process.cwd(), "logs");
const logFile = path.join(logFolder, "email.log");

if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder, { recursive: true });
}

function writeLog(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

// -----------------------------
// Send Email Function
// -----------------------------
async function sendEmail(to, subject, medName, time) {
  try {
    const templatePath = path.join(process.cwd(), "templates", "reminder.html");

    let html = fs.readFileSync(templatePath, "utf8");

    html = html
      .replace(/{{MEDICINE_NAME}}/g, medName)
      .replace(/{{TIME}}/g, time);

    const info = await transporter.sendMail({
      from: `"MediTracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    const logMsg = `SUCCESS: Email sent to ${to} for "${medName}" at ${time}. MessageId: ${info.messageId}`;
    
    console.log(logMsg);
    writeLog(logMsg);

  } catch (err) {
    const logMsg = `ERROR: Email failed to ${to} for "${medName}" at ${time}. Error: ${err.message}`;
    
    console.error(logMsg);
    writeLog(logMsg);
  }
}

export default sendEmail;