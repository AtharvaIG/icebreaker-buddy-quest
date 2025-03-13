
import { generatePlayerId, getRandomQuestion, getQuestionByNumber, generateNumberedQuestions } from './gameUtils';

export interface OfflinePlayer {
  id: string;
  name: string;
  answer: number | null;
  isHost: boolean;
}

export interface OfflineGameState {
  players: OfflinePlayer[];
  currentQuestion: string;
  roomCode: string;
  category: string;
  showQuestion: boolean;
  questionMap: Map<number, string>;
}

class OfflineGameService {
  private gameState: OfflineGameState | null = null;
  private listeners: { [key: string]: ((data: any) => void)[] } = {};

  initialize(roomCode: string, category: string): OfflineGameState {
    // Generate the question map for this category
    const questionMap = generateNumberedQuestions(category);

    this.gameState = {
      players: [],
      currentQuestion: getRandomQuestion(category),
      roomCode,
      category,
      showQuestion: false,
      questionMap
    };
    return this.gameState;
  }

  addPlayer(name: string): OfflinePlayer {
    if (!this.gameState) {
      throw new Error('Game not initialized');
    }

    const isFirstPlayer = this.gameState.players.length === 0;
    
    const player: OfflinePlayer = {
      id: generatePlayerId(),
      name,
      answer: null,
      isHost: isFirstPlayer // First player is the host
    };

    this.gameState.players.push(player);
    this.emit('room_update', this.gameState);
    
    return player;
  }

  removePlayer(playerId: string): void {
    if (!this.gameState) return;
    
    this.gameState.players = this.gameState.players.filter(p => p.id !== playerId);
    
    // If the host was removed, assign a new host
    if (!this.gameState.players.some(p => p.isHost) && this.gameState.players.length > 0) {
      this.gameState.players[0].isHost = true;
    }
    
    this.emit('room_update', this.gameState);
  }

  selectNumber(playerId: string, number: number): void {
    if (!this.gameState) return;
    
    const playerIndex = this.gameState.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
      this.gameState.players[playerIndex].answer = number;
      
      // Get the question associated with this number
      const question = this.gameState.questionMap.get(number) || getRandomQuestion(this.gameState.category);
      this.gameState.currentQuestion = question;
      this.gameState.showQuestion = true;
      
      this.emit('player_answered', { 
        playerId, 
        answer: number,
        question
      });
      this.emit('room_update', this.gameState);
    }
  }

  nextQuestion(): void {
    if (!this.gameState) return;
    
    // Reset all answers
    this.gameState.players.forEach(p => p.answer = null);
    
    // Reset to the selection state 
    this.gameState.showQuestion = false;
    
    this.emit('new_question', {
      question: "",
      players: this.gameState.players
    });
    this.emit('room_update', this.gameState);
  }

  getState(): OfflineGameState | null {
    return this.gameState;
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event: string, data: any): void {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }

  resetGame(): void {
    this.gameState = null;
    this.listeners = {};
  }
}

const offlineGameService = new OfflineGameService();
export default offlineGameService;
