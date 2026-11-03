import express from "express";
import fetch from "node-fetch";
import authMiddleware from "../middleware/authMiddleware.js";
import Medicine from "../models/medicine.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const question = req.body.question?.trim();

    if (!question) {
      return res.status(400).json({ answer: "Please enter a question." });
    }

    // Fetch user's medicines to provide personal context
    const medicines = await Medicine.find({ user: req.user._id }).lean();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let answer = "";
    try {
      const response = await fetch(
        `http://127.0.0.1:${process.env.AI_SERVICE_PORT || 8001}/api/chatbot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            userId: req.user._id.toString(),
            userName: req.user.name || "User",
            medicines,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        answer = data.answer || data.response || data.message;
      }
    } catch (serviceErr) {
      clearTimeout(timeout);
      console.warn("AI service call failed, using built-in assistant fallback:", serviceErr.message);
    }

    // If AI service answered, return it
    if (answer && answer.trim()) {
      return res.json({ answer: answer.trim() });
    }

    // Resilient built-in fallback when AI service is unavailable or rate-limited
    const q = question.toLowerCase();
    const userName = req.user.name || "there";
    let fallback = `Hello ${userName}! I am your MediTracker Health Assistant. I am here to help you track your medicines, daily doses, and healthy habits. How can I assist you today?`;

    if (/\b(hi|hello|hey|hola|greetings)\b/i.test(q) || q.includes("how are you") || q.includes("how r u")) {
      fallback = `Hello ${userName}! I'm doing well, thank you! How can I assist you with your health or medication schedule today?`;
    } else if (/\b(thanks|thank|thx|appreciate)\b/i.test(q)) {
      fallback = `You're very welcome, ${userName}! Let me know if you have any questions about your medications or daily wellness.`;
    } else if (q.includes("who are you") || q.includes("what can you do") || q.includes("your name")) {
      fallback = "I am MediTracker's AI Health Assistant. I can help you monitor your medication schedule, remind you of upcoming or missed doses, and answer general health and wellness questions.";
    } else if (q.includes("medicine") || q.includes("medication") || q.includes("schedule") || q.includes("dose") || q.includes("pill")) {
      if (medicines.length > 0) {
        const medList = medicines.map((m) => `• ${m.name} (${m.dosage}) - ${m.frequency || "Daily"}`).join("\n");
        fallback = `Here are your current medications:\n${medList}\n\nStay on track with your doses!`;
      } else {
        fallback = "You have no active medications scheduled right now. You can add one anytime using 'Add Medicine'.";
      }
    } else if (q.includes("water") || q.includes("hydration") || q.includes("drink")) {
      fallback = "Staying well hydrated is essential for processing medications and maintaining energy. Aim for 2 to 3 liters of water per day!";
    } else if (q.includes("headache") || q.includes("pain") || q.includes("migraine")) {
      fallback = "For mild headaches, rest in a quiet space and drink plenty of water. If the headache is severe or persists, please consult a healthcare professional.";
    } else if (q.includes("fever") || q.includes("temperature")) {
      fallback = "For a fever, get plenty of rest and stay hydrated. If the temperature exceeds 102°F (39°C) or lasts more than 3 days, seek medical care.";
    } else if (q.includes("cold") || q.includes("cough") || q.includes("flu") || q.includes("sore throat")) {
      fallback = "Get plenty of rest and drink warm fluids like herbal tea with honey. If you experience difficulty breathing or symptoms persisting beyond 10 days, please consult a doctor.";
    } else if (q.includes("sleep") || q.includes("insomnia") || q.includes("tired")) {
      fallback = "Aim for 7 to 9 hours of restorative sleep. Keeping a consistent schedule and limiting screens before bedtime can improve sleep quality.";
    } else if (q.includes("exercise") || q.includes("workout") || q.includes("walk")) {
      fallback = "Regular physical activity like a 30-minute daily walk helps cardiovascular fitness, reduces stress, and improves metabolic health.";
    } else if (q.includes("diet") || q.includes("food") || q.includes("eat")) {
      fallback = "A balanced diet with plenty of vegetables, fruits, and lean protein supports immunity. Be sure to check whether your medications should be taken with meals!";
    }

    res.json({ answer: fallback });

  } catch (err) {
    console.error("Chatbot route error:", err.message);
    res.json({
      answer: "I am here to help with your health and medicine questions. Please ask anytime!",
    });
  }
});

export default router;