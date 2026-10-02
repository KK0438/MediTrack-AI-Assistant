# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime, timezone
import asyncio
import os
import re
import httpx
from bson import ObjectId

# Load environment variables
load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Groq client (LLM)
from groq import Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=GROQ_API_KEY)
AI_PROVIDER = os.getenv("AI_PROVIDER", "ollama").lower()

# MongoDB connection
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["meditracker"]
med_collection = db["medicines"]
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:3b")


async def generate_ai_response(prompt: str) -> str:
    if AI_PROVIDER == "groq" and GROQ_API_KEY:
        try:
            chat = await asyncio.to_thread(
                client.chat.completions.create,
                model="llama-3.1-8b-instant",
                messages=[{"role": "user", "content": prompt}],
            )
            return chat.choices[0].message.content
        except Exception as error:
            print("Groq unavailable; using local model:", type(error).__name__)

    async with httpx.AsyncClient(timeout=120) as local_client:
        response = await local_client.post(
            f"{OLLAMA_URL}/api/chat",
            json={
                "model": OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            },
        )
        response.raise_for_status()
        return response.json()["message"]["content"]

# ---------------- Helper Functions ---------------- #

def get_medicine_data(user_id: str):
    """Return only the authenticated user's medicines."""
    try:
        object_id = ObjectId(user_id)
    except Exception:
        return []

    return list(med_collection.find({"user": object_id}))


def get_log_date(log):
    value = log.get("date")
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone().strftime("%Y-%m-%d")
    if isinstance(value, str):
        return value[:10]
    return None

def is_medicine_question(msg: str):
    """Detect if question is about medicines, schedule, adherence, or doses"""
    keywords = [
        "medicine", "medicines", "medication", "medications", "missed",
        "schedule", "taken", "adherence", "dose", "doses", "upcoming",
        "pills", "prescription", "take", "taking",
    ]
    return any(k in msg.lower() for k in keywords)


def get_verified_medicine_answer(message: str):
    normalized = re.sub(r"[^a-z0-9]+", "", message.lower())
    is_identity_question = any(
        phrase in message.lower()
        for phrase in ("what is", "what's", "used for", "ingredient", "composition")
    )

    if "dolo650" in normalized and is_identity_question:
        return (
            "Dolo 650 is a brand of paracetamol (acetaminophen), usually 650 mg per tablet, "
            "used for fever and mild-to-moderate pain. Check your own package to confirm "
            "the ingredient and strength. Do not combine it with other paracetamol products, "
            "and follow the package or clinician's instructions; too much can seriously "
            "damage the liver. I can't determine a personal dose for you."
        )

    return None

# ---------------- Routes ---------------- #

@app.get("/")
def home():
    return {"message": "AI Health Assistant Running"}

@app.post("/api/chatbot")
async def chatbot(data: dict):
    user_message = data.get("question", "").strip()
    user_id = data.get("userId", "").strip()
    if not user_message or not user_id:
        return {"response": "Please ask a question."}

    try:
        medicines = get_medicine_data(user_id)
        now = datetime.now()
        today_str = now.strftime("%Y-%m-%d")

        verified_medicine_answer = get_verified_medicine_answer(user_message)
        if verified_medicine_answer:
            return {"response": verified_medicine_answer}

        # ---------- Medicine-related questions ----------
        if is_medicine_question(user_message):
            msg_lower = user_message.lower()
            response = ""

            if any(
                phrase in msg_lower
                for phrase in (
                    "what medicines",
                    "what medication",
                    "what do i take",
                    "what should i take",
                )
            ):
                today_doses = []
                for med in medicines:
                    for log in med.get("logs", []):
                        if get_log_date(log) == today_str and log.get("status") == "Pending":
                            today_doses.append(
                                f"- {med.get('name')} ({med.get('dosage')}) at {log.get('time')}"
                            )
                response_text = (
                    "Your pending doses today:\n" + "\n".join(today_doses)
                    if today_doses
                    else "You have no pending medicine doses scheduled today."
                )
                response = response_text

            elif "missed" in msg_lower:
                missed = []
                for med in medicines:
                    for log in med.get("logs", []):
                        if get_log_date(log) == today_str and log.get("status") == "Missed":
                            missed.append(f"{med['name']} at {log.get('time')}")
                if missed:
                    response = "You have missed the following doses today:\n" + "\n".join(missed)
                else:
                    response = "You have not missed any doses today."

            elif "adherence" in msg_lower or "taken" in msg_lower:
                today_logs = [
                    log
                    for med in medicines
                    for log in med.get("logs", [])
                    if get_log_date(log) == today_str
                ]
                total = len(today_logs)
                taken = sum(1 for log in today_logs if log.get("status") == "Taken")
                adherence = round((taken / total) * 100, 2) if total > 0 else 0
                response = f"Total doses taken today: {taken} / {total}\nYour adherence rate today is {adherence}%."

            elif "schedule" in msg_lower or "upcoming" in msg_lower:
                upcoming = []
                for med in medicines:
                    for log in med.get("logs", []):
                        if (
                            get_log_date(log) == today_str
                            and log.get("status") == "Pending"
                            and datetime.strptime(log.get("time", ""), "%H:%M").time() > now.time()
                        ):
                            upcoming.append(f"{med['name']} at {log.get('time')}")
                if upcoming:
                    response = "Your upcoming doses today:\n" + "\n".join(upcoming)
                else:
                    response = "No more scheduled doses for today."

            if response:
                return {"response": response}

        # ---------- General questions (send to LLM) ----------
        medicine_context = [
            f"{med.get('name')} ({med.get('dosage')}): "
            + ", ".join(
                f"{log.get('time')} {log.get('status')}"
                for log in med.get("logs", [])
                if get_log_date(log) == today_str
            )
            for med in medicines
        ]
        context_text = (
            "Today's saved medicine schedule:\n" + "\n".join(medicine_context)
            if medicine_context
            else "No medicine schedule is saved for this account today."
        )
        prompt = f"""
You are MediTracker's friendly health information assistant. Answer the user's latest question directly and clearly. For greetings or simple questions, keep the reply brief and natural.

{context_text}

Use only the schedule above for personal medicine questions. Never guess a medicine's active ingredient, interaction, or dose when it is not verified in the context. Give general health education, not a diagnosis or prescription. Never advise changing a prescribed medicine or dose. If a question is urgent or could be dangerous, recommend contacting a qualified clinician or emergency service.

User's question: {user_message}
"""
        reply = await generate_ai_response(prompt)
        return {"response": reply}

    except Exception as e:
        print("AI response unavailable:", type(e).__name__, e)
        return {"response": "The AI service failed to answer. Please try again later."}