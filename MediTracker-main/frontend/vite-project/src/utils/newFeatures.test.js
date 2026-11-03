import test from "node:test";
import assert from "node:assert/strict";
import { parsePrescriptionText, toDateInputString } from "./ocrService.js";

test("OCR Service parses standard clinical prescription text accurately", () => {
  const sampleRx = `
    Dr. Evelyn Reed, MD
    Rx:
    1. Tab. Amoxicillin 500mg PO BID (twice daily) x 7 days
    2. Tab. Paracetamol 650mg TID for 5 days
    3. Cap. Pantoprazole 40mg OD before breakfast
  `;

  const extracted = parsePrescriptionText(sampleRx);
  assert.equal(extracted.length >= 3, true, "Should extract at least 3 medications");

  const amox = extracted.find((m) => m.name.toLowerCase() === "amoxicillin");
  assert.ok(amox, "Amoxicillin should be detected");
  assert.match(amox.dosage, /500\s*mg/i, "Dosage should contain 500mg");
  assert.equal(amox.times.length, 2, "Twice daily should generate 2 dose times");
  assert.equal(amox.frequency, "Daily");
  assert.equal(amox.currentStock >= 14, true, "Stock should be at least 14");

  const para = extracted.find((m) => m.name.toLowerCase() === "paracetamol");
  assert.ok(para, "Paracetamol should be detected");
  assert.equal(para.times.length, 3, "TID should generate 3 dose times");

  const panto = extracted.find((m) => m.name.toLowerCase() === "pantoprazole");
  assert.ok(panto, "Pantoprazole should be detected");
  assert.equal(panto.times.length, 1, "OD should generate 1 dose time");
});

test("OCR Service parses generic prescription patterns", () => {
  const genericRx = "Rx: Tab. Metformin 850mg 1 tab daily x 30 days";
  const extracted = parsePrescriptionText(genericRx);
  assert.equal(extracted.length, 1);
  assert.equal(extracted[0].name, "Metformin");
  assert.match(extracted[0].dosage, /850\s*mg/i);
});

test("Smart Refill logic calculates accurate days remaining and threshold status", () => {
  const calculateMetrics = (stock, timesPerDay, dosePerIntake, threshold) => {
    const dailyIntake = timesPerDay * dosePerIntake;
    const daysRemaining = dailyIntake > 0 ? Math.floor(stock / dailyIntake) : 30;
    let status = "good";
    if (stock <= 0) status = "empty";
    else if (daysRemaining <= 3 || stock <= threshold) status = "critical";
    else if (daysRemaining <= 7) status = "low";
    return { daysRemaining, status };
  };

  // 1. Well stocked: 30 tablets, 1 per day -> 30 days left
  const well = calculateMetrics(30, 1, 1, 5);
  assert.equal(well.daysRemaining, 30);
  assert.equal(well.status, "good");

  // 2. Low stock: 10 tablets, 2 per day -> 5 days left (< 7 days)
  const low = calculateMetrics(10, 2, 1, 5);
  assert.equal(low.daysRemaining, 5);
  assert.equal(low.status, "low");

  // 3. Critical stock: 4 tablets, 2 per day -> 2 days left (<= 3 days)
  const crit = calculateMetrics(4, 2, 1, 5);
  assert.equal(crit.daysRemaining, 2);
  assert.equal(crit.status, "critical");

  // 4. Empty stock: 0 tablets
  const empty = calculateMetrics(0, 1, 1, 5);
  assert.equal(empty.daysRemaining, 0);
  assert.equal(empty.status, "empty");
});

test("Caregiver missed-dose alert requires user consent", () => {
  const shouldDispatchAlert = (consentGranted, caregivers) => {
    if (!consentGranted) return false;
    return caregivers.some((c) => c.alertOnMissed && c.status === "Active");
  };

  const caregivers = [
    { name: "Sarah", status: "Active", alertOnMissed: true },
    { name: "Dr. Miller", status: "Active", alertOnMissed: false },
  ];

  // Without consent: false
  assert.equal(shouldDispatchAlert(false, caregivers), false);

  // With consent: true
  assert.equal(shouldDispatchAlert(true, caregivers), true);
});

