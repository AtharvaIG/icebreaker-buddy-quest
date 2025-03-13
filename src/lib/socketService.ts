
import { io, Socket } from 'socket.io-client';

// Type definitions
export interface GameState {
  players: Player[];
  currentQuestion: string;
  roomCode: string;
  roomExists: boolean;
  category?: string;
}

export interface Player {
  id: string;
  name: string;
  answer: number | null;
  isHost: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  public isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  public connect(url: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(url, {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        resolve(this.socket as Socket);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.IO server:', reason);
        
        // This comparison fixes the TypeScript error TS2367
        if (reason === 'io server disconnect') {
          // The server has forcefully disconnected the socket
          this.socket?.connect();
        }
      });
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinRoom(roomCode: string, playerName: string): void {
    if (this.socket) {
      this.socket.emit('join_room', { roomCode, playerName });
    } else {
      console.error('Socket not connected');
    }
  }

  // Let's add this method to fix the TypeScript error in RoomJoin.tsx
  public joinRoom_api(roomCode: string, playerName: string): void {
    this.joinRoom(roomCode, playerName);
  }

  // Let's add this method to fix the TypeScript error in RoomCreation.tsx
  public createRoom(category: string, playerName: string): void {
    if (this.socket) {
      this.socket.emit('create_room', { category, playerName });
    } else {
      console.error('Socket not connected');
    }
  }

  public selectNumber(number: number): void {
    if (this.socket) {
      this.socket.emit('select_number', { number });
    } else {
      console.error('Socket not connected');
    }
  }

  public requestNextQuestion(): void {
    if (this.socket) {
      this.socket.emit('next_question');
    } else {
      console.error('Socket not connected');
    }
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  public off(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
