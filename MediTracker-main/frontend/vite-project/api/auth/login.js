export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { email } = req.body || {};
  return res.status(200).json({
    message: "Login successful",
    user: {
      id: "demo_patient_001",
      name: "Demo Patient",
      email: email || "demo@meditracker.com",
      profilePic: "",
    },
    token: "mock-token-" + Date.now(),
  });
}
