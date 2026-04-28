import { useState, useRef, useEffect } from "react";
import "../css/AISupport.css";

const BotIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const SUGGESTED_QUESTIONS = [
  "Where is my order?",
  "How do I request a refund?",
  "Do I have any active coupons?",
];

const AISupport = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const userMsg = (text ?? input).trim();
    if (!userMsg) return;

    setMessages(prev => [...prev, { type: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          userId: user?._id || null,
        }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { type: "bot", text: data.reply }]);
    } catch {
      setMessages(prev => [
        ...prev,
        { type: "bot", text: "Something went wrong. Please try again." },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="ai-support-wrapper">
      <div className="ai-support-card">

        {/* Header */}
        <div className="ai-support-header">
          <div className="ai-header-icon">
            <BotIcon />
          </div>
          <div className="ai-header-text">
            <span className="ai-header-title">Support Assistant</span>
            <span className="ai-header-status">
              <span className="status-dot" />
              Online
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <div className="ai-chat-body">
          {isEmpty ? (
            <div className="ai-empty-state">
              <div className="ai-empty-icon">
                <BotIcon />
              </div>
              <p className="ai-empty-title">How can I help you today?</p>
              <p className="ai-empty-sub">Ask about your orders, refunds, or coupons.</p>

              <div className="ai-suggestions">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="ai-suggestion-chip"
                    onClick={() => sendMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`ai-message-row ${msg.type === "user" ? "row-user" : "row-bot"}`}
                >
                  {msg.type === "bot" && (
                    <div className="ai-avatar bot-avatar">
                      <BotIcon />
                    </div>
                  )}
                  <div className={`ai-bubble ${msg.type === "user" ? "bubble-user" : "bubble-bot"}`}>
                    {msg.text}
                  </div>
                  {msg.type === "user" && (
                    <div className="ai-avatar user-avatar">
                      <UserIcon />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="ai-message-row row-bot">
                  <div className="ai-avatar bot-avatar">
                    <BotIcon />
                  </div>
                  <div className="ai-bubble bubble-bot bubble-typing">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="ai-input-bar">
          <input
            ref={inputRef}
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about orders, refunds, coupons..."
            disabled={loading}
          />
          <button
            className="ai-send-btn btn primary"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AISupport;