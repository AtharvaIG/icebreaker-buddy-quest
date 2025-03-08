
import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';

// Base URL for the backend API - with fallback to localhost if deployed URL fails
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_RECONNECTION_ATTEMPTS = 3;

class SocketService {
  private socket: Socket | null = null;
  private roomCode: string | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectionAttempts = 0;
  private isConnecting = false;

  // Initialize socket connection with better error handling
  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      console.log('Already attempting to connect...');
      return null;
    }

    this.isConnecting = true;
    console.log(`Connecting to WebSocket server at ${API_URL}...`);

    try {
      this.socket = io(API_URL, {
        transports: ['websocket', 'polling'], // Try WebSocket first, fall back to polling
        reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
        timeout: 10000,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.reconnectionAttempts = 0;
        this.isConnecting = false;
        toast({
          title: 'Connected',
          description: 'Connected to the game server successfully.',
        });
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.reconnectionAttempts++;
        
        if (this.reconnectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
          toast({
            title: 'Connection Error',
            description: 'Failed to connect to the game server. Please check if the backend is running.',
            variant: 'destructive',
          });
          this.isConnecting = false;
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        this.isConnecting = false;
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
    } catch (err) {
      console.error('Failed to initialize socket:', err);
      this.isConnecting = false;
      toast({
        title: 'Connection Failed',
        description: 'Could not initialize connection to the game server.',
        variant: 'destructive',
      });
      return null;
    }
  }

  // Check if socket is connected
  isConnected() {
    return !!this.socket?.connected;
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomCode = null;
      this.listeners.clear();
      this.isConnecting = false;
    }
  }

  // Join a room
  joinRoom(roomCode: string, playerId: string, playerName: string) {
    if (!this.socket) {
      this.connect();
    }

    // If still not connected after trying to connect
    if (!this.socket) {
      console.error('Cannot join room: Socket not connected');
      toast({
        title: 'Connection Error',
        description: 'Cannot join room: Not connected to server',
        variant: 'destructive',
      });
      return;
    }

    this.roomCode = roomCode;
    this.socket.emit('join_room', { roomCode, playerId, playerName });
    console.log(`Joining room ${roomCode} as ${playerName} (${playerId})`);
  }

  // Leave a room
  leaveRoom(roomCode: string, playerId: string) {
    if (!this.socket) return;
    
    console.log(`Leaving room ${roomCode}`);
    this.socket.emit('leave_room', { roomCode, playerId });
    this.roomCode = null;
  }

  // Select a category
  selectCategory(roomCode: string, playerId: string, category: string) {
    if (!this.socket) return;
    
    console.log(`Selecting category: ${category}`);
    this.socket.emit('select_category', { roomCode, playerId, category });
  }

  // Select a number
  selectNumber(roomCode: string, playerId: string, number: number) {
    if (!this.socket) return;
    
    console.log(`Selecting number: ${number}`);
    this.socket.emit('select_number', { roomCode, playerId, number });
  }

  // Move to next turn (host only)
  nextTurn(roomCode: string, playerId: string) {
    if (!this.socket) return;
    
    console.log('Moving to next turn');
    this.socket.emit('next_turn', { roomCode, playerId });
  }

  // Add event listener
  on(event: string, callback: Function) {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket) {
      console.log(`Registering listener for event: ${event}`);
      this.socket.on(event, callback as any);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)?.push(callback);
    } else {
      console.error(`Cannot register listener for ${event}: Socket not connected`);
    }
    
    return () => this.off(event, callback);
  }

  // Remove specific event listener
  off(event: string, callback: Function) {
    if (!this.socket) return;
    
    console.log(`Removing listener for event: ${event}`);
    this.socket.off(event, callback as any);
    
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
    if (!this.socket) return;
    
    console.log(`Removing all listeners for event: ${event}`);
    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }

  // API methods with better error handling

  // Create room API call
  async createRoom(playerName: string) {
    console.log(`Creating room for player: ${playerName}`);
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
      
      const result = await response.json();
      console.log('Room created:', result);
      return result;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not create room',
        variant: 'destructive',
      });
      throw error;
    }
  }

  // Join room API call
  async joinRoom_api(roomCode: string, playerName: string) {
    console.log(`Joining room ${roomCode} as ${playerName}`);
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
      
      const result = await response.json();
      console.log('Joined room:', result);
      return result;
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Could not join room',
        variant: 'destructive',
      });
      throw error;
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
