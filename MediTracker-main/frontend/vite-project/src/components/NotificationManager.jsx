// src/components/NotificationManager.jsx
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import {
  getVoiceReminderSlot,
  REMINDER_COUNT,
  REMINDER_INTERVAL_MS,
} from "../utils/voiceReminderSchedule";

const getInitialVoicePreference = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userId = user?.id || user?._id;
    return Boolean(
      userId &&
        localStorage.getItem(`meditracker-voice-reminders:${userId}`) === "true"
    );
  } catch {
    return false;
  }
};

const NotificationManager = () => {
  const { user } = useContext(AppContext);
  const checkingRef = useRef(false);
  const userId = user?.id || user?._id;
  const preferenceKey = userId
    ? `meditracker-voice-reminders:${userId}`
    : null;
  const [permission, setPermission] = useState(() =>
    "Notification" in window ? Notification.permission : "unsupported"
  );
  const [voiceEnabled, setVoiceEnabled] = useState(getInitialVoicePreference);

  const enableVoiceReminders = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      try {
        setPermission(await Notification.requestPermission());
      } catch (error) {
        console.warn("Notification permission request failed:", error);
      }
    }

    if (preferenceKey) localStorage.setItem(preferenceKey, "true");
    setVoiceEnabled(true);
  };

  const disableVoiceReminders = () => {
    if (preferenceKey) localStorage.removeItem(preferenceKey);
    setVoiceEnabled(false);
    window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    if (!voiceEnabled || !userId) return undefined;

    const checkNotifications = async () => {
      if (checkingRef.current) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      checkingRef.current = true;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const todaySchedule = res.data.todaySchedule || [];
        const now = new Date();
        const patientName = user?.name?.trim() || "there";

        todaySchedule.forEach((item) => {
          if (item.status !== "Pending" || !/^\d{2}:\d{2}$/.test(item.time)) {
            return;
          }

          const [hour, minute] = item.time.split(":").map(Number);
          const scheduledAt = new Date(item.date);
          scheduledAt.setHours(hour, minute, 0, 0);
          const slot = getVoiceReminderSlot(scheduledAt, now);
          if (slot === null) return;

          const storageKey = `meditracker-voice-reminder-slots:${item.logId}`;
          const storedMask = Number.parseInt(localStorage.getItem(storageKey) || "0", 10);
          const sentMask = Number.isNaN(storedMask) ? 0 : storedMask;
          const slotMask = 1 << slot;
          if (sentMask & slotMask) return;

          const medicine = item.name || "your medicine";
          const spokenMessage = `Hi ${patientName}, it's time to take your ${medicine}.`;
          let delivered = false;

          if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
            const utterance = new SpeechSynthesisUtterance(spokenMessage);
            utterance.lang = "en-US";
            window.speechSynthesis.speak(utterance);
            delivered = true;
          }

          if (permission === "granted") {
            new Notification("Medicine reminder", {
              body: spokenMessage,
              icon: "/favicon.ico",
              tag: `medicine-reminder-${item.logId}`,
              renotify: false,
            });
            delivered = true;
          }

          if (delivered) {
            localStorage.setItem(storageKey, String(sentMask | slotMask));
          }
        });
      } catch (err) {
        console.error("Notification fetch error:", err);
      } finally {
        checkingRef.current = false;
      }
    };

    const interval = setInterval(checkNotifications, 15000);
    checkNotifications();

    return () => clearInterval(interval);
  }, [permission, user?.name, userId, voiceEnabled]);

  const speechSupported =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3">
      <span className="text-sm text-gray-700">
        {!speechSupported
          ? "Spoken medicine reminders are not supported in this browser."
          : voiceEnabled && permission === "denied"
            ? "Voice reminders are on. Browser pop-ups are blocked in site settings."
            : voiceEnabled
              ? `Voice reminders are on: ${REMINDER_COUNT} spoken prompts, every ${REMINDER_INTERVAL_MS / 1000} seconds.`
              : "Turn on spoken medicine reminders for your scheduled doses."}
      </span>
      {speechSupported && !voiceEnabled && (
        <button
          type="button"
          onClick={enableVoiceReminders}
          className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Enable voice reminders
        </button>
      )}
      {speechSupported && voiceEnabled && (
        <button
          type="button"
          onClick={disableVoiceReminders}
          className="rounded border border-blue-300 px-3 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100"
        >
          Disable voice reminders
        </button>
      )}
    </div>
  );
};

export default NotificationManager;