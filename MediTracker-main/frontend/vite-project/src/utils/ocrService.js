// src/utils/ocrService.js
/**
 * Advanced Prescription & Medicine OCR Extraction Service
 * Supports Tesseract.js recognition with image preprocessing,
 * fallback clinical NER parsing, and curated instant demo prescriptions.
 */

// Common medications dictionary for fast, high-accuracy entity recognition
const COMMON_DRUGS = [
  { name: "Amoxicillin", defaultDosage: "500mg - 1 capsule", defaultFreq: "Daily", defaultTimes: ["08:00 AM", "08:00 PM"], durationDays: 7, defaultStock: 14 },
  { name: "Metformin", defaultDosage: "850mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["09:00 AM", "07:00 PM"], durationDays: 30, defaultStock: 60 },
  { name: "Atorvastatin", defaultDosage: "20mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["09:00 PM"], durationDays: 30, defaultStock: 30 },
  { name: "Paracetamol", defaultDosage: "650mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["08:00 AM", "02:00 PM", "08:00 PM"], durationDays: 5, defaultStock: 15 },
  { name: "Ibuprofen", defaultDosage: "400mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["09:00 AM", "09:00 PM"], durationDays: 5, defaultStock: 10 },
  { name: "Cetirizine", defaultDosage: "10mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["09:00 PM"], durationDays: 10, defaultStock: 10 },
  { name: "Pantoprazole", defaultDosage: "40mg - 1 capsule", defaultFreq: "Daily", defaultTimes: ["07:30 AM"], durationDays: 14, defaultStock: 14 },
  { name: "Omeprazole", defaultDosage: "20mg - 1 capsule", defaultFreq: "Daily", defaultTimes: ["07:30 AM"], durationDays: 14, defaultStock: 14 },
  { name: "Azithromycin", defaultDosage: "500mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["10:00 AM"], durationDays: 5, defaultStock: 5 },
  { name: "Lisinopril", defaultDosage: "10mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["08:00 AM"], durationDays: 30, defaultStock: 30 },
  { name: "Amlodipine", defaultDosage: "5mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["08:00 AM"], durationDays: 30, defaultStock: 30 },
  { name: "Losartan", defaultDosage: "50mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["08:30 AM"], durationDays: 30, defaultStock: 30 },
  { name: "Levothyroxine", defaultDosage: "50mcg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["07:00 AM"], durationDays: 30, defaultStock: 30 },
  { name: "Vitamin D3", defaultDosage: "1000 IU - 1 tablet", defaultFreq: "Daily", defaultTimes: ["01:00 PM"], durationDays: 30, defaultStock: 30 },
  { name: "Vitamin C", defaultDosage: "500mg - 1 chewable", defaultFreq: "Daily", defaultTimes: ["10:00 AM"], durationDays: 30, defaultStock: 30 },
  { name: "Zincovit", defaultDosage: "1 tablet", defaultFreq: "Daily", defaultTimes: ["02:00 PM"], durationDays: 15, defaultStock: 15 },
  { name: "Ciprofloxacin", defaultDosage: "500mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["08:00 AM", "08:00 PM"], durationDays: 7, defaultStock: 14 },
  { name: "Montelukast", defaultDosage: "10mg - 1 tablet", defaultFreq: "Daily", defaultTimes: ["09:00 PM"], durationDays: 14, defaultStock: 14 },
  { name: "Doxycycline", defaultDosage: "100mg - 1 capsule", defaultFreq: "Daily", defaultTimes: ["09:00 AM", "09:00 PM"], durationDays: 7, defaultStock: 14 },
  { name: "Gabapentin", defaultDosage: "300mg - 1 capsule", defaultFreq: "Daily", defaultTimes: ["08:00 PM"], durationDays: 30, defaultStock: 30 }
];

/**
 * Format a Date object to YYYY-MM-DD
 */
export const toDateInputString = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Preprocess image on an offscreen HTML canvas to enhance OCR accuracy
 */
const preprocessImage = async (imageSource) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      const maxWidth = 1200;
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;

      // Draw original
      ctx.drawImage(img, 0, 0, width, height);

      // Contrast enhancement and grayscale
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const contrast = 1.2; // slight boost
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

        for (let i = 0; i < data.length; i += 4) {
          // Grayscale luminosity
          const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const contrasted = factor * (avg - 128) + 128;
          const finalVal = Math.max(0, Math.min(255, contrasted));
          data[i] = finalVal;
          data[i + 1] = finalVal;
          data[i + 2] = finalVal;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (_) {
        // Fallback to original image if tainted canvas
        resolve(imageSource);
      }
    };
    img.onerror = () => resolve(imageSource);
    img.src = imageSource;
  });
};

/**
 * Parses raw text extracted from OCR into structured medicine records
 */
export const parsePrescriptionText = (rawText) => {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const extracted = [];
  const today = new Date();

  // 1. First pass: Match known drug names in lines
  for (const line of lines) {
    for (const drug of COMMON_DRUGS) {
      const regex = new RegExp(`\\b${drug.name}\\b`, "i");
      if (regex.test(line)) {
        // Avoid duplicate entry if already extracted
        if (extracted.some((item) => item.name.toLowerCase() === drug.name.toLowerCase())) {
          continue;
        }

        // Try extracting custom dosage from the line (e.g., 500mg, 10 mg)
        const dosageMatch = line.match(/\b(\d+(\.\d+)?\s*(mg|mcg|g|ml|iu))\b/i);
        const dosage = dosageMatch ? `${dosageMatch[1]} - 1 tablet` : drug.defaultDosage;

        // Try extracting frequency (BID, TID, OD, Once, Twice, Daily)
        let frequency = drug.defaultFreq;
        let times = [...drug.defaultTimes];

        if (/\b(bid|twice\s*daily|2\s*times|1-0-1)\b/i.test(line)) {
          frequency = "Daily";
          times = ["08:00 AM", "08:00 PM"];
        } else if (/\b(tid|thrice\s*daily|3\s*times|1-1-1)\b/i.test(line)) {
          frequency = "Daily";
          times = ["08:00 AM", "02:00 PM", "08:00 PM"];
        } else if (/\b(od|once\s*daily|1\s*time|1-0-0|0-0-1)\b/i.test(line)) {
          frequency = "Daily";
          times = ["09:00 AM"];
        } else if (/\b(weekly|once\s*a\s*week)\b/i.test(line)) {
          frequency = "Weekly";
          times = ["09:00 AM"];
        }

        // Extract duration if specified (e.g. x 7 days, for 5 days, 10 days)
        let days = drug.durationDays || 7;
        const durationMatch = line.match(/\b(?:for|x)?\s*(\d+)\s*(?:days|day|d)\b/i);
        if (durationMatch) {
          days = parseInt(durationMatch[1], 10);
        }

        const startDate = new Date(today);
        const endDate = new Date(today);
        endDate.setDate(startDate.getDate() + days);

        // Estimate stock needed
        const stock = Math.max(days * times.length, drug.defaultStock || 15);

        extracted.push({
          id: `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          name: drug.name,
          dosage,
          frequency,
          startDate: toDateInputString(startDate),
          endDate: toDateInputString(endDate),
          times,
          currentStock: stock,
          unit: "tablets",
          dosePerIntake: 1,
          refillThreshold: 5,
          confidence: 0.95,
          detectedText: line
        });
      }
    }
  }

  // 2. Second pass: Generic Rx patterns (e.g. "Tab. [Word] [Dosage]", "Cap [Word]", "Rx: [Word]")
  if (extracted.length === 0) {
    const rxRegex = /(?:tab|tablet|cap|capsule|syr|syrup|rx|inj)?\.?\s*([A-Za-z]{4,20})\s+(\d+\s*(?:mg|mcg|ml|g)?)/gi;
    let match;
    while ((match = rxRegex.exec(rawText)) !== null) {
      const detectedName = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
      // Skip common non-drug words
      if (["Doctor", "Patient", "Clinic", "Hospital", "Date", "Daily", "Times", "Morning", "Evening", "Night", "Tablet", "Capsule", "Signature"].includes(detectedName)) {
        continue;
      }
      if (extracted.some((item) => item.name.toLowerCase() === detectedName.toLowerCase())) {
        continue;
      }

      const detectedDose = match[2] || "500mg";
      const startDate = new Date(today);
      const endDate = new Date(today);
      endDate.setDate(startDate.getDate() + 7);

      extracted.push({
        id: `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: detectedName,
        dosage: `${detectedDose} - 1 tablet`,
        frequency: "Daily",
        startDate: toDateInputString(startDate),
        endDate: toDateInputString(endDate),
        times: ["09:00 AM", "09:00 PM"],
        currentStock: 14,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 5,
        confidence: 0.82,
        detectedText: match[0]
      });
    }
  }

  // Fallback: If nothing matched but text exists, extract the first non-empty capitalized candidate
  if (extracted.length === 0 && lines.length > 0) {
    const candidateLine = lines.find((l) => /^[A-Z][a-z]{3,}/.test(l)) || lines[0];
    const candidateName = candidateLine.split(/\s+/)[0].replace(/[^a-zA-Z]/g, "") || "Prescription Med";
    
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(startDate.getDate() + 7);

    extracted.push({
      id: `extracted_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: candidateName,
      dosage: "500mg - 1 tablet",
      frequency: "Daily",
      startDate: toDateInputString(startDate),
      endDate: toDateInputString(endDate),
      times: ["09:00 AM", "09:00 PM"],
      currentStock: 14,
      unit: "tablets",
      dosePerIntake: 1,
      refillThreshold: 5,
      confidence: 0.70,
      detectedText: candidateLine
    });
  }

  return extracted;
};

/**
 * Run OCR on an image file or Data URL using Tesseract.js (with timeout & fallback)
 */
export const runOCR = async (imageFileOrUrl, onProgress = () => {}) => {
  let imageUrl = "";
  let isObjectURL = false;

  if (typeof imageFileOrUrl === "string") {
    imageUrl = imageFileOrUrl;
  } else if (imageFileOrUrl instanceof File || imageFileOrUrl instanceof Blob) {
    imageUrl = URL.createObjectURL(imageFileOrUrl);
    isObjectURL = true;
  }

  try {
    onProgress({ status: "Preprocessing image...", progress: 0.15 });
    const preprocessed = await preprocessImage(imageUrl);

    onProgress({ status: "Initializing OCR neural model...", progress: 0.35 });

    // Dynamic import to keep bundle lightweight and resilient
    const Tesseract = await import("tesseract.js");

    onProgress({ status: "Reading and scanning prescription text...", progress: 0.60 });

    const result = await Tesseract.recognize(preprocessed, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          const p = 0.60 + (m.progress || 0) * 0.35;
          onProgress({ status: `Scanning text: ${Math.round((m.progress || 0) * 100)}%`, progress: p });
        }
      }
    });

    onProgress({ status: "Extracting medicine details...", progress: 0.98 });
    const text = result?.data?.text || "";
    const extracted = parsePrescriptionText(text);

    onProgress({ status: "Done", progress: 1.0 });

    return {
      rawText: text,
      medicines: extracted,
      success: true
    };
  } catch (error) {
    console.warn("Tesseract OCR fallback triggered:", error);
    // If OCR failed, return empty or fallback
    return {
      rawText: "",
      medicines: [],
      success: false,
      error: error.message || "Failed to process image OCR"
    };
  } finally {
    if (isObjectURL) {
      URL.revokeObjectURL(imageUrl);
    }
  }
};

/**
 * Curated Instant Demo Prescriptions for one-click testing on Vercel and local
 */
export const SAMPLE_PRESCRIPTIONS = [
  {
    id: "sample_antibiotic",
    title: "Infection & Pain Relief Rx",
    doctor: "Dr. Evelyn Reed, MD - General Medicine",
    clinic: "MetroCare Health Clinic",
    date: toDateInputString(new Date()),
    notes: "Take after meals. Drink plenty of water.",
    rawText: `Dr. Evelyn Reed, MD (Internal Medicine)
MetroCare Health Center, St. 14
Date: ${toDateInputString(new Date())}
Patient: Demo Patient | Age: 38

Rx:
1. Tab. Amoxicillin 500mg - 1 capsule PO BID (Twice daily) x 7 days
2. Tab. Paracetamol 650mg - 1 tablet TID (Three times daily) for 5 days as needed for fever
3. Cap. Pantoprazole 40mg - 1 capsule OD (Once daily) before breakfast x 14 days

Sig: Complete full antibiotic course.`,
    medicines: [
      {
        id: "sample_med_1",
        name: "Amoxicillin",
        dosage: "500mg - 1 capsule",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 7 * 86400000)),
        times: ["08:00 AM", "08:00 PM"],
        currentStock: 14,
        unit: "capsules",
        dosePerIntake: 1,
        refillThreshold: 4,
        confidence: 0.98,
        detectedText: "Tab. Amoxicillin 500mg - 1 capsule PO BID x 7 days"
      },
      {
        id: "sample_med_2",
        name: "Paracetamol",
        dosage: "650mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 5 * 86400000)),
        times: ["08:00 AM", "02:00 PM", "08:00 PM"],
        currentStock: 15,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 5,
        confidence: 0.96,
        detectedText: "Tab. Paracetamol 650mg - 1 tablet TID for 5 days"
      },
      {
        id: "sample_med_3",
        name: "Pantoprazole",
        dosage: "40mg - 1 capsule",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 14 * 86400000)),
        times: ["07:30 AM"],
        currentStock: 14,
        unit: "capsules",
        dosePerIntake: 1,
        refillThreshold: 3,
        confidence: 0.94,
        detectedText: "Cap. Pantoprazole 40mg - 1 capsule OD before breakfast"
      }
    ]
  },
  {
    id: "sample_chronic",
    title: "Cardiometabolic Care Rx",
    doctor: "Dr. Marcus Vance, MD, FACC - Cardiology",
    clinic: "Vance Heart & Vascular Institute",
    date: toDateInputString(new Date()),
    notes: "Monitor blood pressure weekly. Refill monthly.",
    rawText: `Vance Heart & Vascular Institute
Dr. Marcus Vance, FACC
Date: ${toDateInputString(new Date())}
Patient: Demo Patient

Rx:
1. Tab. Metformin HCl 850mg - 1 tab BID with meals x 30 days
2. Tab. Atorvastatin 20mg - 1 tab HS (At bedtime) x 30 days
3. Tab. Lisinopril 10mg - 1 tab OD morning x 30 days

Refills authorized: 3`,
    medicines: [
      {
        id: "sample_med_4",
        name: "Metformin",
        dosage: "850mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 30 * 86400000)),
        times: ["09:00 AM", "07:00 PM"],
        currentStock: 60,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 10,
        confidence: 0.99,
        detectedText: "Tab. Metformin HCl 850mg - 1 tab BID with meals x 30 days"
      },
      {
        id: "sample_med_5",
        name: "Atorvastatin",
        dosage: "20mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 30 * 86400000)),
        times: ["09:00 PM"],
        currentStock: 30,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 7,
        confidence: 0.97,
        detectedText: "Tab. Atorvastatin 20mg - 1 tab HS (At bedtime) x 30 days"
      },
      {
        id: "sample_med_6",
        name: "Lisinopril",
        dosage: "10mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 30 * 86400000)),
        times: ["08:00 AM"],
        currentStock: 30,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 7,
        confidence: 0.95,
        detectedText: "Tab. Lisinopril 10mg - 1 tab OD morning x 30 days"
      }
    ]
  },
  {
    id: "sample_allergy",
    title: "Allergy & Wellness Rx",
    doctor: "Dr. Sarah Chen, MD - Allergy & Immunology",
    clinic: "BreatheWell Clinic",
    date: toDateInputString(new Date()),
    notes: "Seasonal allergy and immune support regimen.",
    rawText: `BreatheWell Clinic - Allergy & Asthma
Dr. Sarah Chen, MD
Date: ${toDateInputString(new Date())}
Patient: Demo Patient

Rx:
1. Tab. Cetirizine 10mg - 1 tablet OD at bedtime x 14 days
2. Tab. Vitamin D3 1000 IU - 1 tablet OD with lunch x 30 days
3. Tab. Montelukast 10mg - 1 tablet OD evening x 14 days`,
    medicines: [
      {
        id: "sample_med_7",
        name: "Cetirizine",
        dosage: "10mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 14 * 86400000)),
        times: ["09:00 PM"],
        currentStock: 14,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 4,
        confidence: 0.97,
        detectedText: "Tab. Cetirizine 10mg - 1 tablet OD at bedtime x 14 days"
      },
      {
        id: "sample_med_8",
        name: "Vitamin D3",
        dosage: "1000 IU - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 30 * 86400000)),
        times: ["01:00 PM"],
        currentStock: 30,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 5,
        confidence: 0.98,
        detectedText: "Tab. Vitamin D3 1000 IU - 1 tablet OD with lunch x 30 days"
      },
      {
        id: "sample_med_9",
        name: "Montelukast",
        dosage: "10mg - 1 tablet",
        frequency: "Daily",
        startDate: toDateInputString(new Date()),
        endDate: toDateInputString(new Date(Date.now() + 14 * 86400000)),
        times: ["09:00 PM"],
        currentStock: 14,
        unit: "tablets",
        dosePerIntake: 1,
        refillThreshold: 4,
        confidence: 0.95,
        detectedText: "Tab. Montelukast 10mg - 1 tablet OD evening x 14 days"
      }
    ]
  }
];

