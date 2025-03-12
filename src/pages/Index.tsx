
import React, { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import GameScreen from '@/components/GameScreen';
import CategorySelection from '@/components/CategorySelection';
import PlayerSetup from '@/components/PlayerSetup';
import { Player, useLocalStorage } from '@/lib/gameUtils';
import offlineGameService from '@/lib/offlineGameService';

const Index = () => {
  // Store game state in localStorage to persist across refreshes
  const [gameState, setGameState] = useLocalStorage<{
    inGame: boolean;
    inPlayerSetup: boolean;
    inCategorySelection: boolean;
    roomCode: string;
    players: Player[];
    selectedCategory: string | null;
    currentPlayerId: string | null;
  }>('icebreaker_game_state', {
    inGame: false,
    inPlayerSetup: false,
    inCategorySelection: false,
    roomCode: '',
    players: [],
    selectedCategory: null,
    currentPlayerId: null,
  });

  const resetGame = () => {
    offlineGameService.resetGame();
    setGameState({
      inGame: false,
      inPlayerSetup: false,
      inCategorySelection: false,
      roomCode: '',
      players: [],
      selectedCategory: null,
      currentPlayerId: null,
    });
  };

  useEffect(() => {
    // If we're already in a game, restore it
    if (gameState.inGame && gameState.roomCode && gameState.players.length > 0 && gameState.selectedCategory) {
      const gameServiceState = offlineGameService.getState();
      
      if (!gameServiceState) {
        // Initialize game service with stored data
        offlineGameService.initialize(gameState.roomCode, gameState.selectedCategory);
        
        // Add all players back
        gameState.players.forEach(player => {
          // This will emit room_update events, but we're not listening yet
          offlineGameService.addPlayer(player.name);
        });
      }
    }

    // Cleanup on unmount
    return () => {
      // We don't need to reset the game on unmount for offline mode
    };
  }, []);

  const handleStartSetup = () => {
    setGameState({
      ...gameState,
      inPlayerSetup: true,
      roomCode: 'LOCAL-' + Math.floor(Math.random() * 1000),
    });
  };

  const handlePlayerSetupComplete = (players: Player[]) => {
    setGameState({
      ...gameState,
      inPlayerSetup: false,
      inCategorySelection: true,
      players,
    });
  };

  const handleCategorySelect = (category: string) => {
    // Initialize offline game service
    offlineGameService.initialize(gameState.roomCode, category);
    
    // Add all players
    gameState.players.forEach(player => {
      offlineGameService.addPlayer(player.name);
    });
    
    setGameState({
      ...gameState,
      inGame: true,
      inCategorySelection: false,
      selectedCategory: category,
    });
  };

  const handleLeaveGame = () => {
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {!gameState.inPlayerSetup && !gameState.inCategorySelection && !gameState.inGame ? (
        <WelcomeScreen onGameStart={handleStartSetup} />
      ) : gameState.inPlayerSetup ? (
        <PlayerSetup 
          onComplete={handlePlayerSetupComplete} 
          onBack={handleLeaveGame}
          roomCode={gameState.roomCode}
        />
      ) : gameState.inCategorySelection ? (
        <CategorySelection 
          onCategorySelect={handleCategorySelect} 
          onBack={() => setGameState({...gameState, inPlayerSetup: true, inCategorySelection: false})} 
          roomCode={gameState.roomCode}
        />
      ) : (
        <GameScreen 
          roomCode={gameState.roomCode} 
          players={gameState.players}
          category={gameState.selectedCategory!}
          onLeaveRoom={handleLeaveGame} 
        />
      )}
    </div>
  );
};

export default Index;
