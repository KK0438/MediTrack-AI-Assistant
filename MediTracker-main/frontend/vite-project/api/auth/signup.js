export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { name, email } = req.body || {};
  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: "user_" + Date.now(),
      name: name || "User",
      email: email || "user@example.com",
      profilePic: "",
    },
    token: "mock-token-" + Date.now(),
  });
}
