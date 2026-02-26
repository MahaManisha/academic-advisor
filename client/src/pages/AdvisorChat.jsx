// client/src/pages/AdvisorChat.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ReactMarkdown from 'react-markdown';
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaLightbulb,
  FaBook,
  FaChartLine
} from 'react-icons/fa';
import './AdvisorChat.css';
import { sendMessage } from '../api/chat.api';

const AdvisorChat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${user?.name?.split(' ')[0] || 'Student'}! I'm your AI Academic Advisor powered by **Gemini AI**. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickQuestions = [
    {
      id: 1,
      icon: <FaLightbulb />,
      text: 'How can I improve my study habits?',
      color: '#f59e0b'
    },
    {
      id: 2,
      icon: <FaBook />,
      text: 'Suggest resources for Data Structures',
      color: '#667eea'
    },
    {
      id: 3,
      icon: <FaChartLine />,
      text: 'Analyze my performance',
      color: '#10b981'
    }
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Call real backend API (Gemini AI)
      const data = await sendMessage(message);

      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response,
        timestamp: new Date(),
        confidence: data.confidence
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Chat failed:", error);
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm having trouble connecting to the server. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setMessage(question);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
      />

      <Header
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
        title="AI Academic Advisor"
        subtitle={
          user?.focus
            ? `Personalized for ${user.course} (${user.learningMode} Learner)`
            : "Get personalized academic guidance"
        }
        showSearch={false}
      />

      <main className="dashboard-main">
        <div className="main-content chat-content">
          <div className="chat-container">
            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="quick-questions">
                <h3>Quick Questions</h3>
                <div className="questions-grid">
                  {quickQuestions.map((q) => (
                    <button
                      key={q.id}
                      className="quick-question-btn"
                      onClick={() => handleQuickQuestion(q.text)}
                    >
                      <div className="question-icon" style={{ color: q.color }}>
                        {q.icon}
                      </div>
                      <span>{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="messages-container">
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.type}`}>
                  <div className="message-avatar">
                    {msg.type === 'bot' ? (
                      <div className="avatar-bot">
                        <FaRobot />
                      </div>
                    ) : (
                      <div className="avatar-user">
                        <FaUser />
                      </div>
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">
                        {msg.type === 'bot' ? 'AI Advisor' : user?.name || 'You'}
                      </span>
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="message-text markdown-body">
                      {msg.type === 'bot' ? (
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="message bot">
                  <div className="message-avatar">
                    <div className="avatar-bot">
                      <FaRobot />
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-sender">AI Advisor</span>
                    </div>
                    <div className="message-text">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <textarea
                  className="chat-input"
                  placeholder="Ask me anything about your studies..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                  disabled={isLoading}
                />
                <button
                  className="btn-send"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdvisorChat;