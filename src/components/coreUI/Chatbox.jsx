import { useState, useRef, useEffect } from "react";
import { 
  MessageOutlined, 
  CloseOutlined, 
  SendOutlined, 
  DeleteOutlined,
  HistoryOutlined,
  MessageFilled
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { BaseService } from "../../config/basic.service";
import "./Chatbox.css";

export default function Chatbox() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // "chat" or "history"
  
  // Current active chat session messages
  const [chatMessages, setChatMessages] = useState([
    {
      id: "welcome",
      text: "Hello! I am your JGMS Assistant. How can I help you today?",
      sender: "bot",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  // Loaded history messages
  const [historyMessages, setHistoryMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen && activeTab === "chat") {
      scrollToBottom();
    }
  }, [chatMessages, isOpen, isTyping, activeTab]);

  // Fetch history when history tab is selected
  useEffect(() => {
    const fetchHistory = async () => {
      if (!isOpen || activeTab !== "history" || !isAuthenticated) return;

      setIsLoadingHistory(true);
      try {
        const response = await BaseService.get({
          url: "/api/Chat/history",
          isLoading: false
        });

        if (response?.data && Array.isArray(response.data)) {
          const parsedMessages = [];
          
          response.data.forEach((item, idx) => {
            let timeStr = "";
            const rawTime = item.createdAt || item.time || item.timestamp;
            if (rawTime) {
              const date = new Date(rawTime);
              if (!isNaN(date.getTime())) {
                timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              } else {
                timeStr = String(rawTime);
              }
            } else {
              timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // 1. Push user's message
            if (item.message) {
              parsedMessages.push({
                id: `user-${item.id || idx}`,
                text: item.message,
                sender: "user",
                time: timeStr
              });
            }

            // 2. Push bot's reply
            if (item.reply) {
              parsedMessages.push({
                id: `bot-${item.id || idx}`,
                text: item.reply,
                sender: "bot",
                time: timeStr
              });
            }
          });

          setHistoryMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [isOpen, activeTab, isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await BaseService.post({
        url: "/api/Chat",
        payload: { message: messageToSend },
        isLoading: false
      });

      const replyText = response?.data?.reply || "I'm sorry, I couldn't process that request.";

      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: replyText,
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error("Failed to get chat response:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I am having trouble connecting to the service. Please try again later.",
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear your current session?")) {
      setChatMessages([
        {
          id: "welcome",
          text: "Hello! I am your JGMS Assistant. How can I help you today?",
          sender: "bot",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="chatbox-wrapper">
      {/* Floating Button */}
      {!isOpen && (
        <button 
          className="chatbox-trigger-btn"
          onClick={() => setIsOpen(true)}
          title="Open Assistant"
        >
          <MessageOutlined />
          <span className="pulse-ring"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbox-window">
          {/* Header */}
          <div className="chatbox-header">
            <div className="chatbox-title-area">
              <div className="status-indicator online"></div>
              <div>
                <h3>JGMS Assistant</h3>
                <span className="status-text">Online</span>
              </div>
            </div>
            <div className="chatbox-header-actions">
              {activeTab === "chat" && (
                <button 
                  onClick={clearChat} 
                  className="header-action-btn"
                  title="Clear Chat"
                >
                  <DeleteOutlined />
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="header-action-btn"
                title="Close"
              >
                <CloseOutlined />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="chatbox-tabs">
            <button 
              className={`chatbox-tab-btn ${activeTab === "chat" ? "active" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              <MessageFilled style={{ marginRight: '6px' }} />
              Chat
            </button>
            <button 
              className={`chatbox-tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <HistoryOutlined style={{ marginRight: '6px' }} />
              History
            </button>
          </div>

          {/* Chat Body */}
          <div className="chatbox-body">
            {activeTab === "chat" ? (
              // Active Chat view
              <>
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`chat-message ${msg.sender === "user" ? "message-user" : "message-bot"}`}
                  >
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">{msg.time}</span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="chat-message message-bot">
                    <div className="message-bubble typing-bubble">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              // History view
              <>
                {isLoadingHistory ? (
                  <div className="chat-history-loading">
                    <div className="history-loader-spinner"></div>
                    <p>Loading history...</p>
                  </div>
                ) : historyMessages.length === 0 ? (
                  <div className="chat-history-empty">
                    <HistoryOutlined style={{ fontSize: '32px', color: '#94a3b8', marginBottom: '8px' }} />
                    <p>No chat history found</p>
                  </div>
                ) : (
                  <>
                    {historyMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`chat-message ${msg.sender === "user" ? "message-user" : "message-bot"}`}
                      >
                        <div className="message-bubble">
                          <p>{msg.text}</p>
                          <span className="message-time">{msg.time}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Form Input - Only visible in Chat tab */}
          {activeTab === "chat" && (
            <form className="chatbox-footer" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
              />
              <button 
                type="submit" 
                className="chatbox-send-btn"
                disabled={!inputValue.trim() || isTyping}
              >
                <SendOutlined />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
