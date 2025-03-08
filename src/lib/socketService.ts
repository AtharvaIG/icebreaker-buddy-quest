
import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';

// Base URL for the backend API
const API_URL = 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private roomCode: string | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Initialize socket connection
  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    this.socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Error',
        description: 'Failed to connect to the game server. Please try again.',
        variant: 'destructive',
      });
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      toast({
        title: 'Error',
        description: data.message || 'Something went wrong',
        variant: 'destructive',
      });
    });

    return this.socket;
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomCode = null;
      this.listeners.clear();
    }
  }

  // Join a room
  joinRoom(roomCode: string, playerId: string, playerName: string) {
    if (!this.socket) {
      this.connect();
    }

    this.roomCode = roomCode;
    this.socket?.emit('join_room', { roomCode, playerId, playerName });
  }

  // Leave a room
  leaveRoom(roomCode: string, playerId: string) {
    if (!this.socket) return;
    
    this.socket.emit('leave_room', { roomCode, playerId });
    this.roomCode = null;
  }

  // Select a category
  selectCategory(roomCode: string, playerId: string, category: string) {
    if (!this.socket) return;
    
    this.socket.emit('select_category', { roomCode, playerId, category });
  }

  // Select a number
  selectNumber(roomCode: string, playerId: string, number: number) {
    if (!this.socket) return;
    
    this.socket.emit('select_number', { roomCode, playerId, number });
  }

  // Move to next turn (host only)
  nextTurn(roomCode: string, playerId: string) {
    if (!this.socket) return;
    
    this.socket.emit('next_turn', { roomCode, playerId });
  }

  // Add event listener
  on(event: string, callback: Function) {
    if (!this.socket) {
      this.connect();
    }

    this.socket?.on(event, callback as any);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    
    return () => this.off(event, callback);
  }

  // Remove specific event listener
  off(event: string, callback: Function) {
    this.socket?.off(event, callback as any);
    
    // Remove from stored listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event: string) {
    this.socket?.removeAllListeners(event);
    this.listeners.delete(event);
  }

  // API methods to create/join rooms
  async createRoom(playerName: string) {
    try {
      const response = await fetch(`${API_URL}/api/create_room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  async joinRoom_api(roomCode: string, playerName: string) {
    try {
      const response = await fetch(`${API_URL}/api/join_room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode, playerName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join room');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
