import io from 'socket.io-client';

class SocketService {
    socket = null;

    connect(token) {
        if (this.socket) return;

        // In production, you'd pass token for auth
        this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: { token },
            transports: ['websocket']
        });

        this.socket.on('connect', () => {
            console.log('Socket connected:', this.socket.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    joinRoom(roomId) {
        if (this.socket) {
            this.socket.emit('join-peer-room', roomId);
        }
    }

    sendMessage(data) {
        if (this.socket) {
            this.socket.emit('peer-message', data);
        }
    }

    onMessageReceived(callback) {
        if (this.socket) {
            this.socket.on('peer-message-received', callback);
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export default new SocketService();
