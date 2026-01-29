// client/src/pages/AdvisorChat.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaLightbulb,
  FaBook,
  FaChartLine
} from 'react-icons/fa';
import './AdvisorChat.css';

const AdvisorChat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Hello ${user?.name?.split(' ')[0] || 'Student'}! I'm your AI Academic Advisor. How can I help you today?`,
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
  }, [messages]);

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
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setMessage('');

    // Simulate AI response (Replace with actual API call)
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: generateResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const generateResponse = (query) => {
    // Mock AI response - Replace with actual AI integration
    const responses = {
      'study': 'Here are some effective study techniques:\n\n1. **Active Recall**: Test yourself regularly\n2. **Spaced Repetition**: Review material over time\n3. **Pomodoro Technique**: Study in 25-minute intervals\n4. **Mind Mapping**: Visualize concepts\n\nWould you like specific tips for any subject?',
      'data': 'For Data Structures, I recommend:\n\n📚 **Resources:**\n- "Introduction to Algorithms" by CLRS\n- LeetCode for practice problems\n- GeeksforGeeks tutorials\n\n💡 **Focus Areas:**\n- Arrays and Linked Lists\n- Trees and Graphs\n- Sorting algorithms\n\nWould you like a personalized study plan?',
      'performance': 'Based on your recent assessments:\n\n✅ **Strengths:**\n- Programming fundamentals (85% avg)\n- Database concepts (82% avg)\n\n📈 **Areas to improve:**\n- Algorithm optimization\n- Complex data structures\n\nI can create a targeted improvement plan. Interested?',
      'default': 'I understand you have a question. Could you provide more details so I can give you the best guidance? You can ask me about:\n\n- Study strategies\n- Subject resources\n- Performance analysis\n- Career advice\n- Academic planning'
    };

    const lowercaseQuery = query.toLowerCase();
    if (lowercaseQuery.includes('study') || lowercaseQuery.includes('habit')) {
      return responses.study;
    } else if (lowercaseQuery.includes('data') || lowercaseQuery.includes('resource')) {
      return responses.data;
    } else if (lowercaseQuery.includes('performance') || lowercaseQuery.includes('analyze')) {
      return responses.performance;
    }
    return responses.default;
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
        subtitle="Get personalized academic guidance"
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
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))}
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
                />
                <button
                  className="btn-send"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
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