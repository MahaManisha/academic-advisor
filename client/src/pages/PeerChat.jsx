// client/src/pages/PeerChat.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUsers,
  FaSearch,
  FaPaperPlane,
  FaCircle,
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaClock,
  FaCheckDouble,
  FaLock
} from 'react-icons/fa';
import './PeerChat.css';
import socketService from '../services/socket.service';
import {
  getPeerList,
  sendConnectionRequest,
  respondToRequest,
  getChatMessages
} from '../api/peer.api';

const PeerChat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  // ─── 1. Initialize Socket + Fetch Peer List ───
  useEffect(() => {
    if (!user?._id) return;

    // Connect socket & register
    socketService.connect(localStorage.getItem('token'));
    socketService.registerUser(user._id);

    // Fetch peer list with connection statuses
    const fetchPeers = async () => {
      const data = await getPeerList();
      if (data.success) {
        setPeers(data.peers);
      }
    };
    fetchPeers();

    // ─── Socket Listeners ───

    // Online/offline tracking
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

    // Incoming message
    socketService.onMessageReceived((msg) => {
      const currentPeer = selectedPeerRef.current;
      if (!currentPeer) return;

      const currentRoomId = getRoomId(currentPeer._id);
      if (msg.roomId === currentRoomId) {
        setChatHistory((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        // If the message is from the peer, mark as seen
        if (msg.sender !== user._id) {
          socketService.emitSeen({ roomId: currentRoomId, userId: user._id });
        }
      }
    });

    // Typing indicator
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

    // Seen status
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  // ─── 2. Peer Selection → Join Room + Load History ───
  useEffect(() => {
    if (!selectedPeer || !user?._id) return;

    // Only load chat if connected
    if (selectedPeer.connectionStatus !== 'connected') {
      setChatHistory([]);
      return;
    }

    const roomId = getRoomId(selectedPeer._id);
    if (!roomId) return;

    // Join the socket room
    socketService.joinRoom(roomId);

    // Fetch chat history
    const loadHistory = async () => {
      const data = await getChatMessages(selectedPeer._id);
      if (data.success) {
        setChatHistory(data.messages || []);

        // Mark messages as seen on open
        socketService.emitSeen({ roomId, userId: user._id });
      } else {
        setChatHistory([]);
      }
    };
    loadHistory();

    // Reset typing and seen state
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
    if (selectedPeer.connectionStatus !== 'connected') return;

    const roomId = getRoomId(selectedPeer._id);
    if (!roomId) return;

    socketService.sendMessage({
      roomId,
      senderId: user._id,
      receiverId: selectedPeer._id,
      message: message.trim()
    });

    // Stop typing on send
    socketService.emitStopTyping({ roomId, userId: user._id });
    setAllSeen(false);
    setMessage('');
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedPeer || selectedPeer.connectionStatus !== 'connected') return;

    const roomId = getRoomId(selectedPeer._id);
    if (!roomId) return;

    socketService.emitTyping({ roomId, userId: user._id });

    // Auto stop typing after 2s of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.emitStopTyping({ roomId, userId: user._id });
    }, 2000);
  };

  const handleConnect = async (peerId) => {
    const result = await sendConnectionRequest(peerId);
    if (result.success) {
      setPeers((prev) =>
        prev.map((p) =>
          p._id === peerId ? { ...p, connectionStatus: 'request_sent' } : p
        )
      );
    }
  };

  const handleRespond = async (requesterId, action) => {
    const result = await respondToRequest(requesterId, action);
    if (result.success) {
      setPeers((prev) =>
        prev.map((p) => {
          if (p._id === requesterId) {
            return {
              ...p,
              connectionStatus: action === 'accept' ? 'connected' : 'not_connected'
            };
          }
          return p;
        })
      );

      // Update selectedPeer if it's the one being responded to
      if (selectedPeer?._id === requesterId) {
        setSelectedPeer((prev) => ({
          ...prev,
          connectionStatus: action === 'accept' ? 'connected' : 'not_connected'
        }));
      }
    }
  };

  // ─── Render Helpers ───

  const renderConnectionButton = (peer) => {
    switch (peer.connectionStatus) {
      case 'not_connected':
        return (
          <button
            className="btn-connect"
            onClick={(e) => {
              e.stopPropagation();
              handleConnect(peer._id);
            }}
            title="Send connection request"
          >
            <FaUserPlus />
          </button>
        );

      case 'request_sent':
        return (
          <span className="connection-badge request-sent" title="Request sent">
            <FaClock />
          </span>
        );

      case 'request_received':
        return (
          <div className="connection-actions" onClick={(e) => e.stopPropagation()}>
            <button
              className="btn-accept"
              onClick={() => handleRespond(peer._id, 'accept')}
              title="Accept"
            >
              <FaCheck />
            </button>
            <button
              className="btn-reject"
              onClick={() => handleRespond(peer._id, 'reject')}
              title="Reject"
            >
              <FaTimes />
            </button>
          </div>
        );

      case 'connected':
        return (
          <span className="connection-badge connected" title="Connected">
            <FaCheckDouble />
          </span>
        );

      default:
        return null;
    }
  };

  const getStatusText = (peer) => {
    if (peer.connectionStatus === 'connected') {
      return onlineUsers.has(peer._id) ? 'Online' : 'Offline';
    }
    const labels = {
      not_connected: 'Not Connected',
      request_sent: 'Request Sent',
      request_received: 'Wants to Connect'
    };
    return labels[peer.connectionStatus] || peer.course;
  };

  const filteredPeers = peers.filter((peer) =>
    (peer.fullName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isConnected = selectedPeer?.connectionStatus === 'connected';
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
        title="Peer Chat"
        subtitle="Connect and collaborate with peers"
        showSearch={false}
      />

      <main className="dashboard-main">
        <div className="main-content peer-chat-content">
          <div className="peer-chat-container">
            {/* ─── Peers Sidebar ─── */}
            <div className="peers-sidebar">
              <div className="peers-header">
                <h3>Students</h3>
                <div className="peers-search">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search students..."
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
                      className={`peer-item ${selectedPeer?._id === peer._id ? 'active' : ''} ${peer.connectionStatus}`}
                      onClick={() => setSelectedPeer(peer)}
                    >
                      <div className="peer-avatar">
                        {getInitials(peer.fullName)}
                        <FaCircle
                          className={`status-indicator ${peer.connectionStatus === 'connected' && onlineUsers.has(peer._id)
                              ? 'online'
                              : 'offline'
                            }`}
                        />
                      </div>
                      <div className="peer-info">
                        <div className="peer-name">{peer.fullName}</div>
                        <div className="peer-last-message">
                          {peer.course} • {getStatusText(peer)}
                        </div>
                      </div>
                      {renderConnectionButton(peer)}
                    </div>
                  ))
                ) : (
                  <div className="no-peers">
                    No students found.
                  </div>
                )}
              </div>
            </div>

            {/* ─── Chat Area ─── */}
            <div className="chat-area">
              {selectedPeer ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <div className="chat-peer-info">
                      <div className="chat-peer-avatar">
                        {getInitials(selectedPeer.fullName)}
                      </div>
                      <div>
                        <div className="chat-peer-name">{selectedPeer.fullName}</div>
                        <div className="chat-peer-status">
                          {isConnected ? (
                            <>
                              <FaCircle
                                className={`status-dot ${isPeerOnline ? 'online' : 'offline'}`}
                              />
                              {isPeerTyping
                                ? 'Typing...'
                                : isPeerOnline
                                  ? 'Online'
                                  : 'Offline'}
                            </>
                          ) : (
                            <span className="status-label">
                              {getStatusText(selectedPeer)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages or Locked State */}
                  {isConnected ? (
                    <>
                      <div className="chat-messages">
                        {chatHistory.length === 0 && (
                          <div className="no-messages">
                            <p>No messages yet. Say hello! 👋</p>
                          </div>
                        )}
                        {chatHistory.map((msg, idx) => {
                          const isMe =
                            msg.sender === user?._id ||
                            msg.sender?._id === user?._id;
                          const isLast = idx === chatHistory.length - 1;
                          return (
                            <div
                              key={msg._id || idx}
                              className={`chat-message ${isMe ? 'me' : 'peer'}`}
                            >
                              <div className="message-bubble">
                                <div className="message-text">{msg.message}</div>
                                <div className="message-meta">
                                  <span className="message-time">
                                    {new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      { hour: '2-digit', minute: '2-digit' }
                                    )}
                                  </span>
                                  {isMe && isLast && (
                                    <span className="seen-status">
                                      {msg.seen || allSeen ? (
                                        <FaCheckDouble className="seen-icon seen" />
                                      ) : (
                                        <FaCheck className="seen-icon" />
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Typing Indicator */}
                        {isPeerTyping && (
                          <div className="chat-message peer">
                            <div className="message-bubble typing-bubble">
                              <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="chat-input-area">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={message}
                          onChange={handleTyping}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleSendMessage()
                          }
                        />
                        <button
                          className="btn-send-message"
                          onClick={handleSendMessage}
                          disabled={!message.trim()}
                        >
                          <FaPaperPlane />
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Not Connected — Chat Locked */
                    <div className="chat-locked">
                      <FaLock className="lock-icon" />
                      <h3>Chat Locked</h3>
                      <p>
                        {selectedPeer.connectionStatus === 'request_sent'
                          ? 'Waiting for this student to accept your request...'
                          : selectedPeer.connectionStatus === 'request_received'
                            ? 'Accept the connection request to start chatting.'
                            : 'Send a connection request to start chatting.'}
                      </p>
                      {selectedPeer.connectionStatus === 'not_connected' && (
                        <button
                          className="btn-connect-large"
                          onClick={() => handleConnect(selectedPeer._id)}
                        >
                          <FaUserPlus /> Connect with {selectedPeer.fullName}
                        </button>
                      )}
                      {selectedPeer.connectionStatus === 'request_received' && (
                        <div className="locked-actions">
                          <button
                            className="btn-accept-large"
                            onClick={() => handleRespond(selectedPeer._id, 'accept')}
                          >
                            <FaCheck /> Accept
                          </button>
                          <button
                            className="btn-reject-large"
                            onClick={() => handleRespond(selectedPeer._id, 'reject')}
                          >
                            <FaTimes /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="no-chat-selected">
                  <FaUsers className="no-chat-icon" />
                  <h3>Select a student to start chatting</h3>
                  <p>Choose from the list on the left</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PeerChat;