import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.projectId = null;
    }

    connect() {
        this.socket = io(SOCKET_URL);

        this.socket.on('connect', () => {
            console.log('Połączono z serwerem Socket.io');
        });

        this.socket.on('disconnect', () => {
            console.log('Rozłączono z serwerem Socket.io');
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    joinProject(projectId) {
        if (this.socket && projectId) {
            this.projectId = projectId;
            this.socket.emit('join-project', { projectId });
        }
    }

    leaveProject() {
        if (this.socket && this.projectId) {
            this.socket.emit('leave-project', { projectId: this.projectId });
            this.projectId = null;
        }
    }

    sendCodeUpdate(language, content) {
        if (this.socket && this.projectId) {
            this.socket.emit('code-update', {
                projectId: this.projectId,
                language,
                content
            });
        }
    }

    onCodeUpdate(callback) {
        if (this.socket) {
            this.socket.on('code-update', callback);
        }
    }
}

export default new SocketService();
