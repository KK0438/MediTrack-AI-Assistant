// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect, useContext } from "react";
import API from "../api/axios";
import { AppContext } from "../context/AppContext";

const Chatbot = () => {
  const { user } = useContext(AppContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Isolate chat storage per user account
  const userKey = user?._id || user?.id || user?.email || "guest";
  const storageKey = `chatMessages_${userKey}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat messages specifically for the logged-in user
  useEffect(() => {
    // Clean up legacy shared key to prevent cross-account contamination
    try {
      localStorage.removeItem("chatMessages");
    } catch (_) {}

    if (!user) {
      setMessages([]);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      }
    } catch (_) {}

    // Initial greeting if no previous chat history exists for this user
    setMessages([
      {
        sender: "ai",
        text: `Hello ${user?.name || "there"}! I am your MediTracker AI Health Assistant. How can I assist you with your medication schedule or health today?`
      }
    ]);
  }, [userKey, storageKey]);

  // Persist messages only under the specific user's key
  useEffect(() => {
    scrollToBottom();
    if (user && userKey !== "guest" && messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (_) {}
    }
  }, [messages, storageKey, userKey]);

  const clearChat = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (_) {}
    setMessages([
      {
        sender: "ai",
        text: `Chat cleared. Hello ${user?.name || "there"}! How can I assist you today?`
      }
    ]);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setMessages(prev => [...prev, userMsg]);

    const currentMessage = message;
    setMessage("");

    try {
      const res = await API.post("/chatbot", { question: currentMessage });
      const answer = res.data?.answer || res.data?.response || res.data?.message || "I am here to assist with your medications and health. Please ask anytime!";
      const aiMsg = { sender: "ai", text: answer };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        sender: "ai",
        text: error.response?.data?.answer || error.response?.data?.message || "The assistant could not respond. Please try again."
      }]);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatCard}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.title}>🩺 AI Health Assistant</div>
            <div style={styles.subHeader}>
              Ask about medicines & health ({user?.name || "User"})
            </div>
          </div>
          <button
            onClick={clearChat}
            style={styles.clearBtn}
            title="Clear this conversation"
          >
            Clear Chat
          </button>
        </div>

        <div style={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start"
              }}
            >
              {msg.sender === "ai" && <div style={styles.avatar}>🤖</div>}
              <div
                style={{
                  ...styles.bubble,
                  background: msg.sender === "user"
                    ? "linear-gradient(135deg,#6366f1,#4f46e5)"
                    : "#f1f5f9",
                  color: msg.sender === "user" ? "white" : "#111"
                }}
              >
                {msg.text}
              </div>
              {msg.sender === "user" && <div style={styles.avatar}>👤</div>}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div style={styles.inputArea}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything about health or medicines..."
            style={styles.input}
            onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
          />
          <button onClick={sendMessage} style={styles.button}>Send</button>
        </div>
      </div>
    </div>
  );
};

// Responsive styles
const styles = {
  container: {
    height: "100vh",
    background: "linear-gradient(135deg,#eef2ff,#e0f2fe)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px"
  },
  chatCard: {
    width: "750px",
    maxWidth: "100%",
    height: "650px",
    maxHeight: "95vh",
    background: "white",
    borderRadius: "18px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(90deg,#6366f1,#4f46e5)",
    color: "white",
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px"
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    textAlign: "left"
  },
  title: {
    fontSize: "20px",
    fontWeight: "600"
  },
  subHeader: {
    fontSize: "13px",
    opacity: "0.9",
    marginTop: "2px"
  },
  clearBtn: {
    background: "rgba(255, 255, 255, 0.18)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    padding: "6px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500"
  },
  messages: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    background: "#fafafa"
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    marginBottom: "14px",
    gap: "10px"
  },
  avatar: {
    fontSize: "20px"
  },
  bubble: {
    padding: "12px 16px",
    borderRadius: "20px",
    maxWidth: "65%",
    fontSize: "15px",
    lineHeight: "1.4"
  },
  inputArea: {
    display: "flex",
    padding: "14px",
    borderTop: "1px solid #eee",
    background: "#fff"
  },
  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    outline: "none",
    fontSize: "14px"
  },
  button: {
    marginLeft: "10px",
    padding: "0 22px",
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "500"
  }
};

// Media queries using window width (for inline styles)
if (typeof window !== "undefined") {
  const updateStyles = () => {
    const width = window.innerWidth;
    if (width < 768) { // Mobile
      styles.chatCard.width = "100%";
      styles.chatCard.height = "90vh";
      styles.bubble.fontSize = "14px";
      styles.input.fontSize = "13px";
      styles.input.padding = "10px";
      styles.button.padding = "0 16px";
      styles.header.fontSize = "18px";
    } else {
      styles.chatCard.width = "750px";
      styles.chatCard.height = "650px";
      styles.bubble.fontSize = "15px";
      styles.input.fontSize = "14px";
      styles.input.padding = "12px";
      styles.button.padding = "0 22px";
      styles.header.fontSize = "20px";
    }
  };
  updateStyles();
  window.addEventListener("resize", updateStyles);
}

export default Chatbot;