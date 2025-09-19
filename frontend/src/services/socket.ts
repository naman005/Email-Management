import io from 'socket.io-client';

class SocketService {
  private socket = io('http://localhost:3001');

  onEmailProcessed(callback: (email: any) => void) {
    this.socket.on('email.new', callback);
  }

  onSyncProgress(callback: (progress: any) => void) {
    this.socket.on('sync.progress', callback);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export const socketService = new SocketService();
