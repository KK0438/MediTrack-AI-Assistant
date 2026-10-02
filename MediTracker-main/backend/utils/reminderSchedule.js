const DEFAULT_GRACE_PERIOD_MS = 5 * 60 * 1000;

export const localDay = (value) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const generateDoseLogs = (startDate, endDate, times, frequency) => {
  const currentDate = localDay(startDate);
  const lastDate = localDay(endDate);
  const logs = [];

  if (!currentDate || !lastDate || currentDate > lastDate) return logs;

  while (currentDate <= lastDate) {
    times.forEach((time) => {
      logs.push({
        date: new Date(currentDate),
        time,
        status: "Pending",
      });
    });

    if (frequency === "Daily") {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (frequency === "Weekly") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      break;
    }
  }

  return logs;
};

export const getDueReminderLogs = (
  medicine,
  now = new Date(),
  gracePeriodMs = DEFAULT_GRACE_PERIOD_MS
) => {
  if (!medicine.isActive || !Array.isArray(medicine.logs)) return [];

  const today = localDay(now);
  const startDate = localDay(medicine.startDate);
  const endDate = localDay(medicine.endDate);

  if (!today || !startDate || !endDate || today < startDate || today > endDate) {
    return [];
  }

  return medicine.logs.filter((log) => {
    if (log.status !== "Pending" || log.reminderSentAt) return false;

    const match = /^(\d{2}):(\d{2})$/.exec(log.time || "");
    if (!match) return false;

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) return false;

    const scheduledDate = localDay(log.date);
    if (!scheduledDate || scheduledDate.getTime() !== today.getTime()) return false;

    scheduledDate.setHours(hours, minutes, 0, 0);
    const delay = now.getTime() - scheduledDate.getTime();
    return delay >= 0 && delay <= gracePeriodMs;
  });
};