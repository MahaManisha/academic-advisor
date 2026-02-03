import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUsers,
  FaSearch,
  FaPaperPlane,
  FaCircle
} from 'react-icons/fa';
import './PeerChat.css';
import socketService from '../services/socket.service';
import { getPeerSuggestions, getChatHistory } from '../api/peer.api';

const PeerChat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [peers, setPeers] = useState([]);
  const [chatHistory, setChatHistory] = useState([]); // Array of {sender, message, createdAt}
  const messagesEndRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Convert name to initials
  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';

  // 1. Initialize Socket & Fetch Peers
  useEffect(() => {
    // Connect socket
    socketService.connect(localStorage.getItem('token'));

    // Listen for incoming messages
    socketService.onMessageReceived((updatedChat) => {
      // If the updated chat matches our current room, update UI
      if (selectedPeer) {
        const currentRoomId = [user._id, selectedPeer._id].sort().join('_');
        if (updatedChat.roomId === currentRoomId) {
          setChatHistory(updatedChat.messages);
        }
      }
    });

    // Fetch suggested peers (initially generic)
    const fetchPeers = async () => {
      const data = await getPeerSuggestions(); // Add params if needed
      if (data.success) {
        // Transform to UI format if needed
        const formatted = data.peers.map(p => ({
          _id: p.userId._id, // Ensure we use _id for unique keys
          name: p.userId.name,
          course: p.userId.course || 'Student',
          status: 'online', // Mock status for now
          avatar: null
        }));
        setPeers(formatted);
      }
    };

    fetchPeers();

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  // 2. Handle Peer Selection -> Join Room & Fetch History
  useEffect(() => {
    if (selectedPeer && user) {
      const roomId = [user._id, selectedPeer._id].sort().join('_');

      // Join Socket Room
      socketService.joinRoom(roomId);

      // Fetch History
      const loadHistory = async () => {
        const data = await getChatHistory(roomId);
        if (data.success && data.chat) {
          setChatHistory(data.chat.messages);
        } else {
          setChatHistory([]);
        }
      };
      loadHistory();
    }
  }, [selectedPeer, user]);

  // 3. Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);


  const handleSendMessage = () => {
    if (!message.trim() || !selectedPeer) return;

    const roomId = [user._id, selectedPeer._id].sort().join('_');

    // Emit to server
    socketService.sendMessage({
      roomId,
      sender: user._id,
      message: message
    });

    setMessage('');
  };

  const filteredPeers = peers.length > 0 ? peers.filter(peer =>
    peer.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

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
            {/* Peers List */}
            <div className="peers-sidebar">
              <div className="peers-header">
                <h3>Collaborators</h3>
                <div className="peers-search">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search peers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="peers-list">
                {filteredPeers.length > 0 ? filteredPeers.map((peer) => (
                  <div
                    key={peer._id}
                    className={`peer-item ${selectedPeer?._id === peer._id ? 'active' : ''}`}
                    onClick={() => setSelectedPeer(peer)}
                  >
                    <div className="peer-avatar">
                      {getInitials(peer.name)}
                      <FaCircle className={`status-indicator ${peer.status}`} />
                    </div>
                    <div className="peer-info">
                      <div className="peer-name">{peer.name}</div>
                      <div className="peer-last-message">{peer.course}</div>
                    </div>
                  </div>
                )) : (
                  <div className="no-peers">No peers found. Try completing more assessments!</div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {selectedPeer ? (
                <>
                  <div className="chat-header">
                    <div className="chat-peer-info">
                      <div className="chat-peer-avatar">
                        {getInitials(selectedPeer.name)}
                      </div>
                      <div>
                        <div className="chat-peer-name">{selectedPeer.name}</div>
                        <div className="chat-peer-status">
                          <FaCircle className={`status-dot ${selectedPeer.status}`} />
                          Active now
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {chatHistory.map((msg, idx) => {
                      const isMe = msg.sender === user?._id;
                      return (
                        <div key={idx} className={`chat-message ${isMe ? 'me' : 'peer'}`}>
                          <div className="message-bubble">
                            <div className="message-text">{msg.message}</div>
                            <div className="message-time">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="chat-input-area">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                <div className="no-chat-selected">
                  <FaUsers className="no-chat-icon" />
                  <h3>Select a peer to start chatting</h3>
                  <p>Choose from your suggestions on the left</p>
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