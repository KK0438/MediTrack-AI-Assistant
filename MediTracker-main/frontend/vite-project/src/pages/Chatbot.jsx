// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";

const Chatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const saved = localStorage.getItem("chatMessages");
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setMessages(prev => [...prev, userMsg]);

    const currentMessage = message;
    setMessage("");

    try {
      const res = await API.post("/chatbot", { question: currentMessage });
      const aiMsg = { sender: "ai", text: res.data.answer };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        sender: "ai",
        text: error.response?.data?.answer || "The assistant could not respond. Please try again."
      }]);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatCard}>
        <div style={styles.header}>
          🩺 AI Health Assistant
          <div style={styles.subHeader}>
            Ask about medicines & health
          </div>
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
    padding: "18px",
    fontSize: "20px",
    fontWeight: "600",
    textAlign: "center",
    background: "linear-gradient(90deg,#6366f1,#4f46e5)",
    color: "white",
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px"
  },
  subHeader: {
    fontSize: "13px",
    opacity: "0.9",
    marginTop: "4px"
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