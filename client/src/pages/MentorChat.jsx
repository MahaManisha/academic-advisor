// client/src/pages/MentorChat.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUsers,
  FaSearch,
  FaPaperPlane,
  FaCircle,
  FaCheck,
  FaCheckDouble,
  FaCommentAlt,
  FaTrash
} from 'react-icons/fa';
import './PeerChat.css'; // Reusing PeerChat styles for consistency
import socketService from '../services/socket.service';
import api from '../api/axios';
import { getMentorChatList, getMentorChatMessages } from '../api/mentor.api';
import { useGamification } from '../context/GamificationContext';

const MentorChat = () => {
  const { user, logout } = useAuth();
  const { triggerAction } = useGamification();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [peers, setPeers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [allSeen, setAllSeen] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedPeerRef = useRef(null);

  // Keep ref in sync for socket callbacks
  useEffect(() => {
    selectedPeerRef.current = selectedPeer;
  }, [selectedPeer]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Convert name to initials
  const getInitials = (name) =>
    name ? name.split(' ').map((n) => n[0]).join('').toUpperCase() : '??';

  // Compute room ID
  const getRoomId = useCallback(
    (peerId) => {
      if (!user?._id || !peerId) return null;
      return [user._id, peerId].sort().join('_');
    },
    [user]
  );

  // ─── 1. Initialize Socket + Fetch Chat List ───
  useEffect(() => {
    if (!user?._id) return;

    // Connect socket & register
    socketService.connect(localStorage.getItem('token'));
    socketService.registerUser(user._id);

    // Fetch chat list (mentors if student, students if mentor)
    const fetchChatList = async () => {
      const data = await getMentorChatList();
      if (data.success) {
        setPeers(data.list);
        
        // Handle direct navigation from "CHAT" button
        const params = new URLSearchParams(location.search);
        const directId = params.get('id');
        if (directId) {
          const directPeer = data.list.find(p => p._id === directId);
          if (directPeer) setSelectedPeer(directPeer);
        }
      }
    };
    fetchChatList();

    // ─── Socket Listeners ───
    socketService.onOnlineUsers((list) => {
      setOnlineUsers(new Set(list));
    });

    socketService.onUserOnline((userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketService.onUserOffline((userId) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    socketService.onMessageReceived((msg) => {
      const currentPeer = selectedPeerRef.current;
      if (!currentPeer) return;

      const currentRoomId = getRoomId(currentPeer._id);
      if (msg.roomId === currentRoomId) {
        setChatHistory((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        if (msg.sender !== user._id) {
          socketService.emitSeen({ roomId: currentRoomId, userId: user._id });
        }
      }
    });

    socketService.onTyping(({ userId, roomId }) => {
      const currentPeer = selectedPeerRef.current;
      if (currentPeer && getRoomId(currentPeer._id) === roomId) {
        setTypingUsers((prev) => new Set([...prev, userId]));
      }
    });

    socketService.onStopTyping(({ userId, roomId }) => {
      const currentPeer = selectedPeerRef.current;
      if (currentPeer && getRoomId(currentPeer._id) === roomId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    });

    socketService.onMessagesSeen(({ roomId }) => {
      const currentPeer = selectedPeerRef.current;
      if (currentPeer && getRoomId(currentPeer._id) === roomId) {
        setAllSeen(true);
        setChatHistory((prev) =>
          prev.map((msg) => ({ ...msg, seen: true }))
        );
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [user?._id, location.search, getRoomId]);

  // ─── 2. Peer Selection → Join Room + Load History ───
  useEffect(() => {
    if (!selectedPeer || !user?._id) return;

    const roomId = getRoomId(selectedPeer._id);
    if (!roomId) return;

    // Join the socket room
    socketService.joinRoom(roomId);

    // Fetch chat history
    const loadHistory = async () => {
      const data = await getMentorChatMessages(selectedPeer._id);
      if (data.success) {
        setChatHistory(data.messages || []);
        socketService.emitSeen({ roomId, userId: user._id });
      } else {
        setChatHistory([]);
      }
    };
    loadHistory();

    setTypingUsers(new Set());
    setAllSeen(false);
  }, [selectedPeer, user, getRoomId]);

  // ─── 3. Auto-scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, typingUsers]);

  // ─── Actions ───
  const handleSendMessage = () => {
    if (!message.trim() || !selectedPeer) return;

    const roomId = getRoomId(selectedPeer._id);
    if (!roomId) return;

    socketService.sendMessage({
      roomId,
      senderId: user._id,
      receiverId: selectedPeer._id,
      message: message.trim()
    });

    triggerAction('CHAT_SESSION');
    socketService.emitStopTyping({ roomId, userId: user._id });
    setAllSeen(false);
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!selectedPeer) return;

    const roomId = getRoomId(selectedPeer._id);
    if (!roomId) return;

    socketService.emitTyping({ roomId, userId: user._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping({ roomId, userId: user._id });
    }, 2000);
  };

  const handleDeleteConnection = async (e, requestId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this connection? All chat history will be lost.")) return;

    try {
      const response = await api.delete(`/mentor/student/${requestId}`);
      if (response.data.success) {
        setPeers(prev => prev.filter(p => p.requestId !== requestId));
        if (selectedPeer && selectedPeer.requestId === requestId) {
          setSelectedPeer(null);
          setChatHistory([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete connection:", err);
      alert("Failed to remove connection. Please try again.");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!selectedPeer) return;
    if (!window.confirm("Delete this message?")) return;

    try {
      const response = await api.delete(`/mentor/messages/${selectedPeer._id}/${messageId}`);
      if (response.data.success) {
        setChatHistory(prev => prev.filter(m => m._id !== messageId));
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message.");
    }
  };

  const filteredPeers = peers.filter((peer) =>
    (peer.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isPeerOnline = selectedPeer && onlineUsers.has(selectedPeer._id);
  const isPeerTyping = selectedPeer && typingUsers.has(selectedPeer._id);

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
        title={user?.role === 'mentor' ? 'Mentee Chat' : 'Mentor Chat'}
        subtitle="Stay connected and share knowledge"
        showSearch={false}
      />

      <main className="dashboard-main centered-main-layout">
        <div className="centered-content-wrapper peer-chat-content">
          <div className="peer-chat-container">
            {/* ─── Sidebar ─── */}
            <div className="peers-sidebar">
              <div className="peers-header">
                <h3>{user?.role === 'mentor' ? 'Mentees' : 'Mentors'}</h3>
                <div className="peers-search">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="peers-list">
                {filteredPeers.length > 0 ? (
                  filteredPeers.map((peer) => (
                    <div
                      key={peer._id}
                      className={`peer-item ${selectedPeer?._id === peer._id ? 'active' : ''}`}
                      onClick={() => setSelectedPeer(peer)}
                      style={{ position: 'relative' }}
                    >
                      <div className="peer-avatar">
                        {getInitials(peer.fullName)}
                        <FaCircle
                          className={`status-indicator ${onlineUsers.has(peer._id) ? 'online' : 'offline'}`}
                        />
                      </div>
                      <div className="peer-info">
                        <div className="peer-name">{peer.fullName}</div>
                        <div className="peer-last-message">
                          {peer.course || peer.domain || 'Connected'}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteConnection(e, peer.requestId)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ff4757',
                          cursor: 'pointer',
                          padding: '8px',
                          opacity: 0.6,
                          transition: 'opacity 0.3s',
                          marginLeft: '10px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                        onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
                        title="Delete connection"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-peers">
                    No active connections found.
                  </div>
                )}
              </div>
            </div>

            {/* ─── Chat Area ─── */}
            <div className="chat-area">
              {selectedPeer ? (
                <>
                  <div className="chat-header">
                    <div className="chat-peer-info">
                      <div className="chat-peer-avatar">
                        {getInitials(selectedPeer.fullName)}
                      </div>
                      <div>
                        <div className="chat-peer-name">{selectedPeer.fullName}</div>
                        <div className="chat-peer-status">
                          <FaCircle className={`status-dot ${isPeerOnline ? 'online' : 'offline'}`} />
                          {isPeerTyping ? 'Typing...' : isPeerOnline ? 'Online' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {chatHistory.length === 0 && (
                      <div className="no-messages">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                    {chatHistory.map((msg, idx) => {
                      const isMe = msg.sender === user?._id || msg.sender?._id === user?._id;
                      const isLast = idx === chatHistory.length - 1;
                      return (
                        <div key={msg._id || idx} className={`chat-message ${isMe ? 'me' : 'peer'}`}>
                          <div className="message-bubble">
                            <div className="message-text" style={{ position: 'relative' }}>
                              {msg.message}
                            </div>
                            <div className="message-meta">
                              <span className="message-time">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && (
                                <button 
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#ff4757',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    marginLeft: '5px',
                                    opacity: 0.5
                                  }}
                                  title="Delete message"
                                >
                                  <FaTrash />
                                </button>
                              )}
                              {isMe && isLast && (
                                <span className="seen-status">
                                  {msg.seen || allSeen ? <FaCheckDouble className="seen-icon seen" /> : <FaCheck className="seen-icon" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {isPeerTyping && (
                      <div className="chat-message peer">
                        <div className="message-bubble typing-bubble">
                          <div className="typing-indicator"><span></span><span></span><span></span></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-area">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={handleTyping}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button className="btn-send-message" onClick={handleSendMessage} disabled={!message.trim()}>
                      <FaPaperPlane />
                    </button>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  <FaCommentAlt className="no-chat-icon" />
                  <h3>Your Mentor Hub Chat</h3>
                  <p>Select a {user?.role === 'mentor' ? 'mentee' : 'mentor'} from the left to start chatting.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorChat;
