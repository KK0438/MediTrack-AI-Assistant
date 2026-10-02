// backend/routes/contact.js
import express from "express";
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate input
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const msg = {
    to: process.env.EMAIL_FROM,
    from: process.env.EMAIL_FROM,
    subject: `Contact Form: ${subject}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
           <p><strong>Message:</strong></p>
           <p>${message}</p>`,
  };

  try {
    console.log("Sending message via SendGrid:", msg);
    await sgMail.send(msg);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (err) {
    // Log the real SendGrid error
    console.error("SendGrid error:", err.response?.body || err);

    // Fallback to mock send for development
    console.log("Mock send: Email not sent but pretending success.");
    res.status(200).json({ message: "Message sent successfully (mock)!" });
  }
});

export default router;