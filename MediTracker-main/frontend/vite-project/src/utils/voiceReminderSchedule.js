export const REMINDER_INTERVAL_MS = 30_000;
export const REMINDER_COUNT = 6;
export const REMINDER_LEAD_TIME_MS = 60_000;

export const getVoiceReminderSlot = (scheduledAt, now) => {
  const start = scheduledAt.getTime() - REMINDER_LEAD_TIME_MS;
  const elapsed = now.getTime() - start;
  const duration = REMINDER_INTERVAL_MS * REMINDER_COUNT;

  if (!Number.isFinite(start) || elapsed < 0 || elapsed >= duration) {
    return null;
  }

  return Math.floor(elapsed / REMINDER_INTERVAL_MS);
};