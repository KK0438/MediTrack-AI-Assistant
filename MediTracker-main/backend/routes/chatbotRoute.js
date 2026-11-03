import express from "express";
import fetch from "node-fetch";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const question = req.body.question?.trim();

    if (!question) {
      return res.status(400).json({ answer: "Please enter a question." });
    }

    const response = await fetch(
      `http://127.0.0.1:${process.env.AI_SERVICE_PORT || 8000}/api/chatbot`,
      {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
          question,
          userId: req.user._id.toString(),
        }),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(502).json({
        answer: data.detail || "The AI service could not answer right now.",
      });
    }

    const answer =
      data.answer ||
      data.response ||
      data.message ||
      "Sorry, I couldn't understand.";

    res.json({ answer });

  } catch (err) {
    console.error("Chatbot service unavailable:", err.message);
    res.status(503).json({
      answer: "The AI service is unavailable. Please try again shortly.",
    });
  }
});

export default router;