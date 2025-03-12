
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

// Get the backend URL from environment or use a fallback for local development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionTimeout: number | null = null;

  // Connect to the WebSocket server
  connect(): Promise<void> {
    if (this.socket && this.socket.connected) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (this.socket && this.socket.connected) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error("Connection timeout"));
        }, 5000);
      });
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        console.log(`Connecting to WebSocket server at ${BACKEND_URL}`);
        
        // Clear any existing timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }

        // Set a timeout for connection
        this.connectionTimeout = window.setTimeout(() => {
          this.isConnecting = false;
          reject(new Error("Connection timeout"));
        }, 10000) as unknown as number;

        // Initialize socket connection
        this.socket = io(BACKEND_URL, {
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Handle connection events
        this.socket.on("connect", () => {
          console.log("WebSocket connected!");
          this.isConnecting = false;
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          console.error("WebSocket connection error:", error);
          this.isConnecting = false;
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log(`WebSocket disconnected: ${reason}`);
          if (reason === "io server disconnect") {
            // Reconnect if the server disconnected us
            this.socket?.connect();
          }
          // If the disconnection was caused by the user leaving the page, we don't need to show a toast
          if (reason !== "transport close" && reason !== "client namespace disconnect") {
            toast.error("Disconnected from the game server. Trying to reconnect...");
          }
        });

      } catch (error) {
        console.error("Error initializing socket:", error);
        this.isConnecting = false;
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }
        reject(error);
      }
    });
  }

  // Disconnect from the WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join a room
  joinRoom(roomCode: string, playerId: string, playerName: string): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.emit("join_room", { roomCode, playerId, playerName });
  }

  // Leave a room
  leaveRoom(roomCode: string, playerId: string): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.emit("leave_room", { roomCode, playerId });
  }

  // Select a category
  selectCategory(roomCode: string, playerId: string, category: string): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.emit("select_category", { roomCode, playerId, category });
  }

  // Select a number answer
  selectNumber(roomCode: string, playerId: string, number: number): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.emit("select_number", { roomCode, playerId, number });
  }

  // Move to the next question
  nextTurn(roomCode: string, playerId: string): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.emit("next_turn", { roomCode, playerId });
  }

  // Register an event listener
  on(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.on(event, callback);
  }

  // Remove an event listener
  off(event: string): void {
    if (!this.socket) {
      console.error("Socket not connected");
      return;
    }
    
    this.socket.off(event);
  }

  // Check if the socket is connected
  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();
export default socketService;
