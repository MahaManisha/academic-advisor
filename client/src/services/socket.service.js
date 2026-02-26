// client/src/services/socket.service.js
import io from 'socket.io-client';

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket) return;

        this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket']
        });

        this.socket.on('connect', () => {

        });

        this.socket.on('disconnect', () => {

        });
    }

    // ─── User Registration (online tracking) ───
    registerUser(userId) {
        if (this.socket) {
            this.socket.emit('register_user', userId);
        }
    }

    // ─── Room Management ───
    joinRoom(roomId) {
        if (this.socket) {
            // Legacy event (backward compat)
            this.socket.emit('join-peer-room', roomId);
            // New event
            this.socket.emit('join_room', { roomId });
        }
    }

    // ─── Messaging ───
    sendMessage(data) {
        if (this.socket) {
            // Legacy event
            this.socket.emit('peer-message', data);
            // New event
            this.socket.emit('send_message', data);
        }
    }

    onMessageReceived(callback) {
        if (this.socket) {
            // Listen to new event
            this.socket.on('receive_message', callback);
        }
    }

    offMessageReceived() {
        if (this.socket) {
            this.socket.off('receive_message');
        }
    }

    // ─── Typing Indicators ───
    emitTyping({ roomId, userId }) {
        if (this.socket) {
            this.socket.emit('typing', { roomId, userId });
        }
    }

    emitStopTyping({ roomId, userId }) {
        if (this.socket) {
            this.socket.emit('stop_typing', { roomId, userId });
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.on('typing', callback);
        }
    }

    onStopTyping(callback) {
        if (this.socket) {
            this.socket.on('stop_typing', callback);
        }
    }

    // ─── Seen Status ───
    emitSeen({ roomId, userId }) {
        if (this.socket) {
            this.socket.emit('seen', { roomId, userId });
        }
    }

    onMessagesSeen(callback) {
        if (this.socket) {
            this.socket.on('messages_seen', callback);
        }
    }

    // ─── Online/Offline Tracking ───
    onUserOnline(callback) {
        if (this.socket) {
            this.socket.on('user_online', callback);
        }
    }

    onUserOffline(callback) {
        if (this.socket) {
            this.socket.on('user_offline', callback);
        }
    }

    onOnlineUsers(callback) {
        if (this.socket) {
            this.socket.on('online_users', callback);
        }
    }

    // ─── Cleanup ───
    removeAllListeners() {
        if (this.socket) {
            this.socket.off('receive_message');
            this.socket.off('typing');
            this.socket.off('stop_typing');
            this.socket.off('messages_seen');
            this.socket.off('user_online');
            this.socket.off('user_offline');
            this.socket.off('online_users');
        }
    }

    disconnect() {
        if (this.socket) {
            this.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
