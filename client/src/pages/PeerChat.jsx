// client/src/pages/PeerChat.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  FaUsers,
  FaSearch,
  FaPaperPlane,
  FaUserCircle,
  FaCircle
} from 'react-icons/fa';
import './PeerChat.css';

const PeerChat = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data - Replace with actual API calls
  const [peers, setPeers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      course: 'Computer Science',
      year: 'Third Year',
      status: 'online',
      lastMessage: 'Hey, did you understand the recursion topic?',
      unread: 2,
      avatar: null
    },
    {
      id: 2,
      name: 'Mike Chen',
      course: 'Information Technology',
      year: 'Second Year',
      status: 'offline',
      lastMessage: 'Thanks for the help!',
      unread: 0,
      avatar: null
    },
    {
      id: 3,
      name: 'Emily Davis',
      course: 'Computer Science',
      year: 'Third Year',
      status: 'online',
      lastMessage: 'Can you share your notes?',
      unread: 1,
      avatar: null
    }
  ]);

  const [chatMessages, setChatMessages] = useState({
    1: [
      { id: 1, sender: 'peer', text: 'Hey, did you understand the recursion topic?', time: '10:30 AM' },
      { id: 2, sender: 'me', text: 'Yes! It took me a while but I got it. Need help?', time: '10:32 AM' },
      { id: 3, sender: 'peer', text: 'Yes please! Can you explain the base case?', time: '10:33 AM' }
    ],
    2: [
      { id: 1, sender: 'me', text: 'Hey Mike, how\'s your project going?', time: 'Yesterday' },
      { id: 2, sender: 'peer', text: 'Going well! Thanks for the help!', time: 'Yesterday' }
    ],
    3: [
      { id: 1, sender: 'peer', text: 'Can you share your notes?', time: '9:15 AM' }
    ]
  });

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedPeer) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages({
      ...chatMessages,
      [selectedPeer.id]: [...(chatMessages[selectedPeer.id] || []), newMessage]
    });

    setMessage('');
  };

  const filteredPeers = peers.filter(peer =>
    peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    peer.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <h3>Messages</h3>
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
                {filteredPeers.map((peer) => (
                  <div
                    key={peer.id}
                    className={`peer-item ${selectedPeer?.id === peer.id ? 'active' : ''}`}
                    onClick={() => setSelectedPeer(peer)}
                  >
                    <div className="peer-avatar">
                      {peer.avatar ? (
                        <img src={peer.avatar} alt={peer.name} />
                      ) : (
                        getInitials(peer.name)
                      )}
                      <FaCircle
                        className={`status-indicator ${peer.status}`}
                      />
                    </div>
                    <div className="peer-info">
                      <div className="peer-name">{peer.name}</div>
                      <div className="peer-last-message">{peer.lastMessage}</div>
                    </div>
                    {peer.unread > 0 && (
                      <div className="unread-badge">{peer.unread}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="chat-area">
              {selectedPeer ? (
                <>
                  <div className="chat-header">
                    <div className="chat-peer-info">
                      <div className="chat-peer-avatar">
                        {selectedPeer.avatar ? (
                          <img src={selectedPeer.avatar} alt={selectedPeer.name} />
                        ) : (
                          getInitials(selectedPeer.name)
                        )}
                      </div>
                      <div>
                        <div className="chat-peer-name">{selectedPeer.name}</div>
                        <div className="chat-peer-status">
                          <FaCircle className={`status-dot ${selectedPeer.status}`} />
                          {selectedPeer.status === 'online' ? 'Active now' : 'Offline'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="chat-messages">
                    {(chatMessages[selectedPeer.id] || []).map((msg) => (
                      <div key={msg.id} className={`chat-message ${msg.sender}`}>
                        <div className="message-bubble">
                          <div className="message-text">{msg.text}</div>
                          <div className="message-time">{msg.time}</div>
                        </div>
                      </div>
                    ))}
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
                  <p>Choose from your connections on the left</p>
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