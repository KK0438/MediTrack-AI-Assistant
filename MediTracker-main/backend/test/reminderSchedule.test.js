import test from "node:test";
import assert from "node:assert/strict";
import {
  generateDoseLogs,
  getDueReminderLogs,
  localDay,
} from "../utils/reminderSchedule.js";

const today = new Date(2026, 9, 2);
const now = new Date(2026, 9, 2, 9, 2);

const makeMedicine = (overrides = {}) => ({
  isActive: true,
  startDate: today,
  endDate: new Date(2026, 9, 8),
  logs: [{ date: today, time: "09:00", status: "Pending" }],
  ...overrides,
});

test("generates daily, weekly, and one-time doses on local calendar dates", () => {
  const endDate = new Date(2026, 9, 20);
  const weeklyLogs = generateDoseLogs(today, endDate, ["09:00"], "Weekly");
  const onceLogs = generateDoseLogs(today, endDate, ["09:00"], "Once");

  assert.deepEqual(
    weeklyLogs.map((log) => localDay(log.date).getDate()),
    [2, 9, 16]
  );
  assert.equal(onceLogs.length, 1);
});

test("returns a pending dose inside its five-minute reminder window", () => {
  const [dueLog] = getDueReminderLogs(makeMedicine(), now);

  assert.equal(dueLog.time, "09:00");
});

test("does not return inactive, expired, completed, or already-reminded doses", () => {
  const inactive = makeMedicine({ isActive: false });
  const expired = makeMedicine({ endDate: new Date(2026, 9, 1) });
  const completed = makeMedicine({ logs: [{ date: today, time: "09:00", status: "Taken" }] });
  const reminded = makeMedicine({
    logs: [{ date: today, time: "09:00", status: "Pending", reminderSentAt: now }],
  });

  assert.deepEqual(getDueReminderLogs(inactive, now), []);
  assert.deepEqual(getDueReminderLogs(expired, now), []);
  assert.deepEqual(getDueReminderLogs(completed, now), []);
  assert.deepEqual(getDueReminderLogs(reminded, now), []);
});

test("does not return a dose after the reminder grace period", () => {
  const staleNow = new Date(2026, 9, 2, 9, 6);

  assert.deepEqual(getDueReminderLogs(makeMedicine(), staleNow), []);
});