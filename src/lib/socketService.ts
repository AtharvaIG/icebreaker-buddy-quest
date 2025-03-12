import { io, Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Base URL for the backend API - with fallback to localhost if deployed URL fails
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_RECONNECTION_ATTEMPTS = 3;

// Mock data for offline/demo mode
const DEMO_QUESTIONS = [
  "On a scale of 1-10, how comfortable are you meeting new people?",
  "Rate your public speaking skills from 1-10",
  "How important is alone time for you on a scale of 1-10?",
  "From 1-10, how easily do you adapt to change?",
  "On a scale of 1-10, how competitive are you?",
  "Rate your cooking skills from 1-10",
  "How organized would you say you are on a scale of 1-10?",
  "From 1-10, how important is having a routine for you?",
  "On a scale of 1-10, how much do you enjoy outdoor activities?",
  "Rate your problem-solving skills from 1-10"
];

class SocketService {
  private socket: Socket | null = null;
  private roomCode: string | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectionAttempts = 0;
  private isConnecting = false;
  private demoRooms: Map<string, any> = new Map();

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
            description: 'Failed to connect to the game server. Running in offline mode.',
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
        description: 'Running in offline mode without server connection.',
        variant: 'destructive',
      });
      return null;
    }
  }

  // Check if socket is connected
  isConnected() {
    return !!this.socket?.connected;
  }

  // DEMO methods
  private _emitDemoEvent(event: string, data: any) {
    // Find listeners for this event and call them
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        setTimeout(() => callback(data), 500); // Add small delay to simulate network
      });
    }
  }

  private _getDemoRoom(roomCode: string) {
    if (!this.demoRooms.has(roomCode)) {
      // Create a new room
      this.demoRooms.set(roomCode, {
        roomCode,
        players: [],
        currentQuestion: this.getRandomQuestion(),
        category: 'personal',
        usedQuestions: []
      });
    }
    return this.demoRooms.get(roomCode);
  }

  private getRandomQuestion() {
    return DEMO_QUESTIONS[Math.floor(Math.random() * DEMO_QUESTIONS.length)];
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
    // If no socket connection, try to create one
    if (!this.socket) {
      this.connect();
    }

    // If no connection or we're using offline mode
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Joining room ${roomCode} as ${playerName} (${playerId})`);
      this.roomCode = roomCode;
      
      const room = this._getDemoRoom(roomCode);
      const existingPlayer = room.players.find((p: any) => p.id === playerId);
      
      if (!existingPlayer) {
        const isHost = room.players.length === 0;
        room.players.push({
          id: playerId,
          name: playerName,
          isHost: isHost,
          answer: null
        });
      }
      
      // Emit room update to all listeners
      this._emitDemoEvent('room_update', {
        players: room.players,
        currentQuestion: room.currentQuestion,
        hostId: room.players.find((p: any) => p.isHost).id,
        category: room.category
      });
      
      // Notify others that a new player joined
      this._emitDemoEvent('player_joined', {
        playerName,
        playerId,
        isHost: room.players.find((p: any) => p.id === playerId).isHost
      });
      
      return;
    }

    this.roomCode = roomCode;
    this.socket.emit('join_room', { roomCode, playerId, playerName });
    console.log(`Joining room ${roomCode} as ${playerName} (${playerId})`);
  }

  // Leave a room
  leaveRoom(roomCode: string, playerId: string) {
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Leaving room ${roomCode}`);
      
      const room = this._getDemoRoom(roomCode);
      const playerIndex = room.players.findIndex((p: any) => p.id === playerId);
      const player = room.players[playerIndex];
      
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        // If all players have left, remove the room
        if (room.players.length === 0) {
          this.demoRooms.delete(roomCode);
          console.log(`[OFFLINE] Room ${roomCode} has been closed (no players left)`);
          return;
        }
        
        // If the host left, assign a new host
        if (player.isHost && room.players.length > 0) {
          room.players[0].isHost = true;
        }
        
        // Emit room update to all listeners
        this._emitDemoEvent('room_update', {
          players: room.players,
          currentQuestion: room.currentQuestion,
          hostId: room.players.find((p: any) => p.isHost)?.id,
          category: room.category
        });
        
        // Notify others that a player left
        this._emitDemoEvent('player_left', {
          playerId,
          playerName: player.name
        });
      }
      
      this.roomCode = null;
      return;
    }
    
    console.log(`Leaving room ${roomCode}`);
    this.socket.emit('leave_room', { roomCode, playerId });
    this.roomCode = null;
  }

  // Select a category
  selectCategory(roomCode: string, playerId: string, category: string) {
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Selecting category: ${category}`);
      
      const room = this._getDemoRoom(roomCode);
      room.category = category;
      room.currentQuestion = this.getRandomQuestion();
      
      // Notify all players of the category and question change
      this._emitDemoEvent('category_selected', {
        category,
        currentQuestion: room.currentQuestion
      });
      
      return;
    }
    
    console.log(`Selecting category: ${category}`);
    this.socket.emit('select_category', { roomCode, playerId, category });
  }

  // Select a number
  selectNumber(roomCode: string, playerId: string, number: number) {
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Selecting number: ${number}`);
      
      const room = this._getDemoRoom(roomCode);
      const player = room.players.find((p: any) => p.id === playerId);
      
      if (player) {
        player.answer = number;
        
        // Notify all players of the answer
        this._emitDemoEvent('player_answered', {
          playerId,
          playerName: player.name,
          answer: number
        });
      }
      
      return;
    }
    
    console.log(`Selecting number: ${number}`);
    this.socket.emit('select_number', { roomCode, playerId, number });
  }

  // Move to next turn (host only)
  nextTurn(roomCode: string, playerId: string) {
    if (!this.socket || !this.socket.connected) {
      console.log('[OFFLINE] Moving to next turn');
      
      const room = this._getDemoRoom(roomCode);
      const player = room.players.find((p: any) => p.id === playerId);
      
      if (!player || !player.isHost) {
        console.error('[OFFLINE] Only the host can advance to the next turn');
        return;
      }
      
      // Reset all players' answers
      room.players.forEach((p: any) => {
        p.answer = null;
      });
      
      // Get a new question
      room.currentQuestion = this.getRandomQuestion();
      
      // Notify all players of the new question
      this._emitDemoEvent('new_question', {
        question: room.currentQuestion,
        players: room.players
      });
      
      return;
    }
    
    console.log('Moving to next turn');
    this.socket.emit('next_turn', { roomCode, playerId });
  }

  // Add event listener
  on(event: string, callback: Function) {
    if (!this.socket) {
      this.connect();
    }

    // If no connection or we're using offline mode
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Registering listener for event: ${event}`);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event)?.push(callback);
      
      return () => this.off(event, callback);
    }

    console.log(`Registering listener for event: ${event}`);
    this.socket.on(event, callback as any);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
    
    return () => this.off(event, callback);
  }

  // Remove specific event listener
  off(event: string, callback: Function) {
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Removing listener for event: ${event}`);
      
      // Remove from stored listeners
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.indexOf(callback);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
      
      return;
    }
    
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
    if (!this.socket || !this.socket.connected) {
      console.log(`[OFFLINE] Removing all listeners for event: ${event}`);
      this.listeners.delete(event);
      return;
    }
    
    console.log(`Removing all listeners for event: ${event}`);
    this.socket.removeAllListeners(event);
    this.listeners.delete(event);
  }

  // API methods

  // Create room API call
  async createRoom(playerName: string) {
    console.log(`Creating room for player: ${playerName}`);
    
    try {
      // First try to connect to the real server
      if (!this.socket) {
        this.connect();
      }
      
      // If we couldn't connect, use offline mode
      if (!this.socket || !this.socket.connected) {
        // In offline mode, generate a random room code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const playerId = uuidv4();
        
        // Create the room
        const room = this._getDemoRoom(roomCode);
        room.players.push({
          id: playerId,
          name: playerName,
          isHost: true,
          answer: null
        });
        
        console.log('[OFFLINE] Room created:', { roomCode, playerId, isHost: true });
        
        return {
          roomCode,
          playerId,
          isHost: true
        };
      }
      
      // Otherwise use the real server
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
      
      // If server is unavailable, switch to offline mode
      if (error instanceof Error && (error.message === 'Failed to fetch' || 
          error.message.includes('NetworkError'))) {
        toast({
          title: 'Server Unavailable',
          description: 'The game server is unavailable. Running in offline mode.',
          variant: 'destructive',
        });
        
        // Generate offline room
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const playerId = uuidv4();
        
        // Create the room
        const room = this._getDemoRoom(roomCode);
        room.players.push({
          id: playerId,
          name: playerName,
          isHost: true,
          answer: null
        });
        
        console.log('[OFFLINE] Room created:', { roomCode, playerId, isHost: true });
        
        return {
          roomCode,
          playerId,
          isHost: true
        };
      }
      
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
      // First try to connect to the real server
      if (!this.socket) {
        this.connect();
      }
      
      // If we couldn't connect, use offline mode
      if (!this.socket || !this.socket.connected) {
        const playerId = uuidv4();
        const room = this._getDemoRoom(roomCode);
        
        // Check if room exists
        if (!room) {
          throw new Error('Room not found');
        }
        
        console.log('[OFFLINE] Joined room:', { roomCode, playerId, isHost: false });
        
        return {
          roomCode,
          playerId,
          isHost: false
        };
      }
      
      // Otherwise use the real server
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
      
      // If server is unavailable, switch to offline mode
      if (error instanceof Error && (error.message === 'Failed to fetch' || 
          error.message.includes('NetworkError'))) {
        toast({
          title: 'Server Unavailable',
          description: 'The game server is unavailable. Running in offline mode.',
          variant: 'destructive',
        });
        
        const playerId = uuidv4();
        const room = this._getDemoRoom(roomCode);
        
        if (!room) {
          throw new Error('Room not found');
        }
        
        return {
          roomCode,
          playerId,
          isHost: false
        };
      }
      
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
