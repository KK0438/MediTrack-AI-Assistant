import test from "node:test";
import assert from "node:assert/strict";
import { getVoiceReminderSlot } from "./voiceReminderSchedule.js";

const doseTime = new Date(2026, 9, 2, 0, 40);

test("schedules six spoken reminders twice per minute from one minute before through one minute after", () => {
  const reminderTimes = [
    new Date(2026, 9, 2, 0, 39, 0),
    new Date(2026, 9, 2, 0, 39, 30),
    new Date(2026, 9, 2, 0, 40, 0),
    new Date(2026, 9, 2, 0, 40, 30),
    new Date(2026, 9, 2, 0, 41, 0),
    new Date(2026, 9, 2, 0, 41, 30),
  ];

  assert.deepEqual(
    reminderTimes.map((time) => getVoiceReminderSlot(doseTime, time)),
    [0, 1, 2, 3, 4, 5]
  );
});

test("does not schedule reminders outside the six reminder slots", () => {
  assert.equal(
    getVoiceReminderSlot(doseTime, new Date(2026, 9, 2, 0, 38, 59)),
    null
  );
  assert.equal(
    getVoiceReminderSlot(doseTime, new Date(2026, 9, 2, 0, 42, 0)),
    null
  );
});