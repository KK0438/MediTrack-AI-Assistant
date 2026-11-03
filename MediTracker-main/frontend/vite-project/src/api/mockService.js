// src/api/mockService.js
/**
 * In-browser mock service engine for MediTracker.
 * Powers 100% functional offline and demo experiences when backend is unavailable.
 */

const STORAGE_USERS = "meditracker_mock_users";
const STORAGE_MEDS = "meditracker_mock_medicines";

const formatDateKey = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

// Seed demo users and initial medications if empty
export const initializeMockDatabase = () => {
  if (typeof window === "undefined") return;

  // 1. Seed Demo Users
  let users = [];
  try {
    users = JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
  } catch (_) {
    users = [];
  }

  const demoUser = {
    id: "demo_patient_001",
    _id: "demo_patient_001",
    name: "Demo Patient",
    email: "demo@meditracker.com",
    password: "demo123",
    profilePic: "",
  };

  const testUser = {
    id: "test_user_002",
    _id: "test_user_002",
    name: "Test User",
    email: "test@example.com",
    password: "password123",
    profilePic: "",
  };

  if (!users.some((u) => u.email.toLowerCase() === demoUser.email)) {
    users.push(demoUser);
  }
  if (!users.some((u) => u.email.toLowerCase() === testUser.email)) {
    users.push(testUser);
  }
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));

  // 2. Seed Demo Medicines
  let meds = [];
  try {
    meds = JSON.parse(localStorage.getItem(STORAGE_MEDS) || "[]");
  } catch (_) {
    meds = [];
  }

  const demoMedsExist = meds.some((m) => m.user === demoUser.id || m.user === demoUser._id);
  if (!demoMedsExist) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(today.getDate() - 2);

    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const initialMeds = [
      {
        _id: "med_amox_001",
        id: "med_amox_001",
        user: demoUser.id,
        name: "Amoxicillin",
        dosage: "500mg - 1 capsule",
        frequency: "Daily",
        startDate: twoDaysAgo.toISOString(),
        endDate: nextWeek.toISOString(),
        times: ["08:00 AM", "08:00 PM"],
        isActive: true,
        logs: [
          { _id: "log_amox_1", date: twoDaysAgo.toISOString(), time: "08:00 AM", status: "Taken" },
          { _id: "log_amox_2", date: twoDaysAgo.toISOString(), time: "08:00 PM", status: "Taken" },
          { _id: "log_amox_3", date: yesterday.toISOString(), time: "08:00 AM", status: "Taken" },
          { _id: "log_amox_4", date: yesterday.toISOString(), time: "08:00 PM", status: "Taken" },
          { _id: "log_amox_5", date: today.toISOString(), time: "08:00 AM", status: "Taken" },
          { _id: "log_amox_6", date: today.toISOString(), time: "08:00 PM", status: "Pending" },
        ],
      },
      {
        _id: "med_vitd_002",
        id: "med_vitd_002",
        user: demoUser.id,
        name: "Vitamin D3",
        dosage: "1000 IU - 1 tablet",
        frequency: "Daily",
        startDate: twoDaysAgo.toISOString(),
        endDate: nextWeek.toISOString(),
        times: ["01:00 PM"],
        isActive: true,
        logs: [
          { _id: "log_vitd_1", date: twoDaysAgo.toISOString(), time: "01:00 PM", status: "Taken" },
          { _id: "log_vitd_2", date: yesterday.toISOString(), time: "01:00 PM", status: "Taken" },
          { _id: "log_vitd_3", date: today.toISOString(), time: "01:00 PM", status: "Pending" },
        ],
      },
      {
        _id: "med_metf_003",
        id: "med_metf_003",
        user: demoUser.id,
        name: "Metformin",
        dosage: "850mg - 1 tablet",
        frequency: "Daily",
        startDate: twoDaysAgo.toISOString(),
        endDate: nextWeek.toISOString(),
        times: ["09:00 AM", "07:00 PM"],
        isActive: true,
        logs: [
          { _id: "log_metf_1", date: twoDaysAgo.toISOString(), time: "09:00 AM", status: "Taken" },
          { _id: "log_metf_2", date: twoDaysAgo.toISOString(), time: "07:00 PM", status: "Taken" },
          { _id: "log_metf_3", date: yesterday.toISOString(), time: "09:00 AM", status: "Taken" },
          { _id: "log_metf_4", date: yesterday.toISOString(), time: "07:00 PM", status: "Missed" },
          { _id: "log_metf_5", date: today.toISOString(), time: "09:00 AM", status: "Missed" },
          { _id: "log_metf_6", date: today.toISOString(), time: "07:00 PM", status: "Pending" },
        ],
      },
    ];

    meds.push(...initialMeds);
    localStorage.setItem(STORAGE_MEDS, JSON.stringify(meds));
  }
};

// Seed Starter Medicines for New Registered Users
const seedStarterMedicinesForUser = (userId) => {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_MEDS) || "[]");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const starterMeds = [
      {
        _id: `med_amox_${Date.now()}`,
        id: `med_amox_${Date.now()}`,
        user: userId,
        name: "Amoxicillin",
        dosage: "500mg - 1 capsule",
        frequency: "Daily",
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString(),
        times: ["08:00 AM", "08:00 PM"],
        isActive: true,
        logs: [
          { _id: `log_s1_${Date.now()}`, date: today.toISOString(), time: "08:00 AM", status: "Taken" },
          { _id: `log_s2_${Date.now()}`, date: today.toISOString(), time: "08:00 PM", status: "Pending" },
        ],
      },
      {
        _id: `med_vitd_${Date.now() + 1}`,
        id: `med_vitd_${Date.now() + 1}`,
        user: userId,
        name: "Vitamin D3",
        dosage: "1000 IU - 1 tablet",
        frequency: "Daily",
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString(),
        times: ["01:00 PM"],
        isActive: true,
        logs: [
          { _id: `log_s3_${Date.now()}`, date: today.toISOString(), time: "01:00 PM", status: "Pending" },
        ],
      },
    ];

    all.push(...starterMeds);
    localStorage.setItem(STORAGE_MEDS, JSON.stringify(all));
  } catch (_) {}
};

// Helper: Get Current User ID
const getCurrentUserId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      return u._id || u.id || u.email;
    }
  } catch (_) {}
  return "demo_patient_001";
};

// Helper: Get Users
const getUsers = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
  } catch (_) {
    return [];
  }
};

// Helper: Save Users
const saveUsers = (users) => {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
};

// Helper: Save All Medicines
const saveAllMedicines = (meds) => {
  localStorage.setItem(STORAGE_MEDS, JSON.stringify(meds));
};

/**
 * Handle simulated backend requests
 */
export const handleMockRequest = async (config) => {
  initializeMockDatabase();

  const method = (config.method || "get").toLowerCase();
  let url = config.url || "";

  // Strip baseUrl and /api prefix
  url = url.replace(/^https?:\/\/[^/]+/, "").replace(/^\/?api/, "");
  if (!url.startsWith("/")) url = "/" + url;

  let body = {};
  if (config.data) {
    try {
      body = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    } catch (_) {
      body = {};
    }
  }

  const makeRes = (status, data, statusText = "OK") => ({
    status,
    statusText,
    headers: { "content-type": "application/json" },
    config,
    data,
  });

  // 1. AUTH LOGIN
  if (method === "post" && (url === "/auth/login" || url.endsWith("/auth/login"))) {
    const { email, password } = body;
    const users = getUsers();

    const normalizedEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // Match existing user
    let user = users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === cleanPassword
    );

    // Fallback automatic demo credentials match
    if (!user && normalizedEmail === "demo@meditracker.com" && cleanPassword === "demo123") {
      user = {
        id: "demo_patient_001",
        _id: "demo_patient_001",
        name: "Demo Patient",
        email: "demo@meditracker.com",
        profilePic: "",
      };
    }

    if (!user) {
      const error = new Error("Invalid email or password");
      error.response = {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config,
        data: { message: "Invalid email or password" },
      };
      throw error;
    }

    const token = `mock-token-${Date.now()}`;
    return makeRes(200, {
      message: "Login successful (Demo Mode)",
      user: {
        id: user.id || user._id,
        _id: user.id || user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || "",
      },
      token,
    });
  }

  // 2. AUTH SIGNUP
  if (method === "post" && (url === "/auth/signup" || url.endsWith("/auth/signup"))) {
    const { name, email, password } = body;
    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.response = {
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config,
        data: { message: "Email and password are required" },
      };
      throw error;
    }

    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    let user = users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (user) {
      user.name = name || user.name;
      user.password = password;
    } else {
      user = {
        id: `user_${Date.now()}`,
        _id: `user_${Date.now()}`,
        name: name || "User",
        email: normalizedEmail,
        password,
        profilePic: "",
      };
      users.push(user);
      seedStarterMedicinesForUser(user.id);
    }
    saveUsers(users);

    const token = `mock-token-${Date.now()}`;
    return makeRes(201, {
      message: "User registered successfully",
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic || "",
      },
      token,
    }, "Created");
  }

  const userId = getCurrentUserId();
  const allMeds = JSON.parse(localStorage.getItem(STORAGE_MEDS) || "[]");
  const userMeds = allMeds.filter((m) => m.user === userId);

  // 3. DASHBOARD STATS
  if (method === "get" && (url === "/dashboard/stats" || url.endsWith("/dashboard/stats"))) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    let missedDoses = 0;
    let todayDoses = 0;
    let takenDoses = 0;
    const todaySchedule = [];
    let upcomingSchedule = [];

    userMeds.forEach((med) => {
      (med.logs || []).forEach((log) => {
        const logDate = new Date(log.date);

        if (log.status === "Missed") missedDoses++;

        // Today's doses
        if (logDate >= today && logDate < tomorrow) {
          todayDoses++;
          if (log.status === "Taken") takenDoses++;

          todaySchedule.push({
            logId: log._id || `${med._id}_${log.time}`,
            medicineId: med._id,
            name: med.name,
            dosage: med.dosage,
            date: log.date,
            time: log.time,
            status: log.status,
          });
        }

        // Upcoming doses
        if (log.status === "Pending") {
          upcomingSchedule.push({
            logId: log._id || `${med._id}_${log.time}`,
            medicineId: med._id,
            name: med.name,
            dosage: med.dosage,
            date: log.date,
            time: log.time,
            status: log.status,
            fullDateTime: logDate,
          });
        }
      });
    });

    upcomingSchedule = upcomingSchedule.slice(0, 2);

    return makeRes(200, {
      stats: {
        totalMedicines: userMeds.length,
        missedDoses,
        todayDoses,
        takenDoses,
      },
      todaySchedule,
      upcomingSchedule,
    });
  }

  // 4. MARK DOSE
  if (method === "put" && url.includes("/dashboard/mark-dose/")) {
    const medId = url.split("/").pop();
    const { status, date, time } = body;

    const medIndex = allMeds.findIndex((m) => m._id === medId && m.user === userId);
    if (medIndex !== -1) {
      const med = allMeds[medIndex];
      const targetDateKey = formatDateKey(date);

      const log = (med.logs || []).find(
        (l) => formatDateKey(l.date) === targetDateKey && l.time === time
      );

      if (log) {
        log.status = status;
      } else {
        med.logs = med.logs || [];
        med.logs.push({
          _id: `log_${Date.now()}`,
          date: date || new Date().toISOString(),
          time: time || "12:00 PM",
          status,
        });
      }

      saveAllMedicines(allMeds);
      return makeRes(200, { message: `Dose marked as ${status}` });
    }

    return makeRes(200, { message: `Dose marked as ${status}` });
  }

  // 5. GET MEDICINES
  if (method === "get" && (url === "/medicines" || url.endsWith("/medicines"))) {
    return makeRes(200, userMeds);
  }

  // 6. ADD MEDICINE
  if (method === "post" && (url === "/medicines" || url.endsWith("/medicines"))) {
    const { name, dosage, frequency, times, startDate, endDate } = body;

    const start = new Date(startDate || new Date());
    const end = new Date(endDate || new Date(Date.now() + 7 * 86400000));
    const timeList = Array.isArray(times) ? times : ["09:00 AM"];

    const logs = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      timeList.forEach((t, idx) => {
        logs.push({
          _id: `log_${Date.now()}_${idx}`,
          date: new Date(d).toISOString(),
          time: t,
          status: "Pending",
        });
      });
    }

    const newMed = {
      _id: `med_${Date.now()}`,
      id: `med_${Date.now()}`,
      user: userId,
      name,
      dosage,
      frequency: frequency || "Daily",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      times: timeList,
      isActive: true,
      logs,
    };

    allMeds.push(newMed);
    saveAllMedicines(allMeds);

    return makeRes(201, newMed, "Created");
  }

  // 7. UPDATE MEDICINE
  if (method === "put" && url.startsWith("/medicines/")) {
    const medId = url.split("/")[2];
    const medIdx = allMeds.findIndex((m) => m._id === medId && m.user === userId);
    if (medIdx !== -1) {
      allMeds[medIdx] = { ...allMeds[medIdx], ...body };
      saveAllMedicines(allMeds);
      return makeRes(200, allMeds[medIdx]);
    }
    return makeRes(404, { message: "Medicine not found" });
  }

  // 8. DELETE MEDICINE
  if (method === "delete" && url.startsWith("/medicines/")) {
    const medId = url.split("/")[2];
    const updated = allMeds.filter((m) => !(m._id === medId && m.user === userId));
    saveAllMedicines(updated);
    return makeRes(200, { message: "Medicine deleted successfully" });
  }

  // 9. HISTORY
  if (method === "get" && (url === "/dashboard/history" || url.endsWith("/dashboard/history"))) {
    const history = [];
    userMeds.forEach((med) => {
      (med.logs || []).forEach((log) => {
        if (log.status !== "Pending") {
          history.push({
            medicineName: med.name,
            dose: med.dosage,
            date: log.date,
            time: log.time,
            status: log.status,
          });
        }
      });
    });

    history.sort((a, b) => new Date(b.date) - new Date(a.date));
    return makeRes(200, history);
  }

  // 10. ANALYTICS
  if (method === "get" && (url === "/dashboard/analytics" || url.endsWith("/dashboard/analytics"))) {
    let total = 0;
    let taken = 0;
    let missed = 0;
    let pending = 0;

    userMeds.forEach((med) => {
      (med.logs || []).forEach((log) => {
        total++;
        if (log.status === "Taken") taken++;
        else if (log.status === "Missed") missed++;
        else pending++;
      });
    });

    const adherence = total > 0 ? Math.round((taken / total) * 100) : 100;
    return makeRes(200, { total, taken, missed, pending, adherence });
  }

  // 11. CALENDAR MEDICINE STATUS
  if (method === "get" && (url === "/dashboard/medicine-status" || url.endsWith("/dashboard/medicine-status"))) {
    const result = [];
    userMeds.forEach((med) => {
      (med.logs || []).forEach((log) => {
        result.push({
          date: formatDateKey(log.date),
          status: log.status.toLowerCase(),
        });
      });
    });
    return makeRes(200, result);
  }

  // 12. CHATBOT
  if (method === "post" && (url === "/chatbot" || url.endsWith("/chatbot"))) {
    const question = (body.question || "").toLowerCase();
    let answer = "I am your MediTracker Health Assistant. Remember to take your prescribed doses on time and consult your physician for changes to your treatment plan.";

    if (question.includes("miss") || question.includes("forgot")) {
      answer = "If you miss a dose, take it as soon as you remember. However, if it is almost time for your next scheduled dose, skip the missed dose and resume your regular schedule. Never take double doses to compensate.";
    } else if (question.includes("amoxicillin") || question.includes("antibiotic")) {
      answer = "Amoxicillin is an antibiotic used to treat bacterial infections. Be sure to complete the entire course prescribed by your doctor even if you feel better earlier.";
    } else if (question.includes("metformin")) {
      answer = "Metformin is commonly prescribed for blood sugar management in type 2 diabetes. It is best taken with meals to minimize stomach discomfort.";
    } else if (question.includes("vitamin d") || question.includes("vitamin")) {
      answer = "Vitamin D3 supports bone health, immunity, and overall well-being. It is fat-soluble and often best absorbed when taken with a meal containing healthy fats.";
    } else if (question.includes("schedule") || question.includes("today") || question.includes("dose")) {
      const medNames = userMeds.map((m) => m.name).join(", ");
      answer = `You currently have ${userMeds.length} active medication(s): ${medNames || "none scheduled"}. Check your Dashboard to mark each dose as Taken!`;
    } else if (question.includes("hello") || question.includes("hi") || question.includes("hey")) {
      answer = "Hello! I am your MediTracker AI Health Assistant. How can I help you with your medications, reminders, or health routines today?";
    }

    return makeRes(200, { answer });
  }

  // 13. BLOGS
  if (method === "get" && (url === "/blogs" || url.endsWith("/blogs"))) {
    return makeRes(200, [
      {
        title: "The Power of Medication Adherence in Chronic Care",
        description: "Taking your medications regularly as prescribed is one of the most critical factors in managing long-term health and preventing hospitalizations.",
        publishedAt: new Date().toISOString(),
        url: "https://www.who.int/news-room/fact-sheets",
        urlToImage: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60",
      },
      {
        title: "How Smart Reminders & AI Are Transforming Patient Wellness",
        description: "Explore how personalized notification schedules and intelligent health tracking help patients stay on top of daily treatments effortlessly.",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        url: "https://www.cdc.gov",
        urlToImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=60",
      },
      {
        title: "Understanding Antibiotic Resistance and Safe Usage",
        description: "Why finishing your prescribed antibiotic course matters, and how responsible usage protects community health against resistant bacteria.",
        publishedAt: new Date(Date.now() - 172800000).toISOString(),
        url: "https://www.fda.gov",
        urlToImage: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800&auto=format&fit=crop&q=60",
      },
    ]);
  }

  // 14. CONTACT
  if (method === "post" && (url === "/contact" || url.endsWith("/contact"))) {
    return makeRes(200, { message: "Thank you for contacting MediTracker! We have received your message." });
  }

  // 15. PROFILE UPLOAD
  if (method === "post" && url.includes("/user/upload-profile")) {
    return makeRes(200, {
      message: "Profile updated successfully",
      profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60",
    });
  }

  return makeRes(200, { success: true, message: "Mock response" });
};
