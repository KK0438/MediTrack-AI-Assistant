import bcrypt from "bcryptjs";
import User from "../models/user.js";
import Medicine from "../models/medicine.js";

export const seedDemoData = async () => {
  try {
    const demoEmail = "demo@meditracker.com";
    let demoUser = await User.findOne({ email: demoEmail });

    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("demo123", salt);

      demoUser = await User.create({
        name: "Demo Patient",
        email: demoEmail,
        password: hashedPassword,
        profilePic: "",
      });

      console.log("Seeded demo user: demo@meditracker.com / demo123");
    }

    // Also check test@example.com
    const testEmail = "test@example.com";
    const testUser = await User.findOne({ email: testEmail });
    if (!testUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("password123", salt);
      await User.create({
        name: "Test User",
        email: testEmail,
        password: hashedPassword,
        profilePic: "",
      });
      console.log("Seeded test user: test@example.com / password123");
    }

    // Check if demo user has medicines
    const medicineCount = await Medicine.countDocuments({ user: demoUser._id });
    if (medicineCount === 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      await Medicine.create([
        {
          user: demoUser._id,
          name: "Amoxicillin",
          dosage: "500mg - 1 capsule",
          frequency: "Daily",
          startDate: today,
          endDate: nextWeek,
          times: ["08:00 AM", "08:00 PM"],
          logs: [
            {
              date: today,
              time: "08:00 AM",
              status: "Taken",
            },
            {
              date: today,
              time: "08:00 PM",
              status: "Pending",
            },
          ],
          isActive: true,
        },
        {
          user: demoUser._id,
          name: "Vitamin D3",
          dosage: "1000 IU - 1 tablet",
          frequency: "Daily",
          startDate: today,
          endDate: nextWeek,
          times: ["01:00 PM"],
          logs: [
            {
              date: today,
              time: "01:00 PM",
              status: "Pending",
            },
          ],
          isActive: true,
        },
        {
          user: demoUser._id,
          name: "Metformin",
          dosage: "850mg - 1 tablet",
          frequency: "Daily",
          startDate: today,
          endDate: nextWeek,
          times: ["09:00 AM", "07:00 PM"],
          logs: [
            {
              date: today,
              time: "09:00 AM",
              status: "Missed",
            },
            {
              date: today,
              time: "07:00 PM",
              status: "Pending",
            },
          ],
          isActive: true,
        },
      ]);

      console.log("Seeded demo medicines for Demo Patient");
    }
  } catch (error) {
    console.error("Error seeding demo data:", error.message);
  }
};
