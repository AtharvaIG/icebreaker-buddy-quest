
import React, { useState, useEffect } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import GameScreen from '@/components/GameScreen';
import CategorySelection from '@/components/CategorySelection';
import { Player, useLocalStorage } from '@/lib/gameUtils';
import socketService from '@/lib/socketService';

const Index = () => {
  // Store game state in localStorage to persist across refreshes
  const [gameState, setGameState] = useLocalStorage<{
    inGame: boolean;
    inCategorySelection: boolean;
    roomCode: string;
    player: Player | null;
    selectedCategory: string | null;
  }>('icebreaker_game_state', {
    inGame: false,
    inCategorySelection: false,
    roomCode: '',
    player: null,
    selectedCategory: null,
  });

  useEffect(() => {
    // Initialize socket connection on page load
    socketService.connect();

    // If we're already in a game, rejoin it
    if (gameState.inGame && gameState.roomCode && gameState.player) {
      socketService.joinRoom(
        gameState.roomCode,
        gameState.player.id,
        gameState.player.name
      );
    }

    // Cleanup on component unmount
    return () => {
      if (!gameState.inGame) {
        socketService.disconnect();
      }
    };
  }, []);

  const handleGameStart = (roomCode: string, playerName: string, playerId: string) => {
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false, // This will be updated by the server
    };

    setGameState({
      ...gameState,
      inCategorySelection: true,
      roomCode,
      player,
    });
  };

  const handleCategorySelect = (category: string) => {
    if (gameState.roomCode && gameState.player) {
      // Send category selection to the server
      socketService.selectCategory(gameState.roomCode, gameState.player.id, category);
      
      // Update game state
      setGameState({
        ...gameState,
        inGame: true,
        inCategorySelection: false,
        selectedCategory: category,
      });
    }
  };

  const handleLeaveRoom = () => {
    if (gameState.roomCode && gameState.player) {
      socketService.leaveRoom(gameState.roomCode, gameState.player.id);
      socketService.disconnect();
    }
    
    setGameState({
      inGame: false,
      inCategorySelection: false,
      roomCode: '',
      player: null,
      selectedCategory: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {!gameState.inCategorySelection && !gameState.inGame ? (
        <WelcomeScreen onGameStart={handleGameStart} />
      ) : gameState.inCategorySelection ? (
        <CategorySelection 
          onCategorySelect={handleCategorySelect} 
          onBack={handleLeaveRoom} 
          roomCode={gameState.roomCode}
        />
      ) : (
        <GameScreen 
          roomCode={gameState.roomCode} 
          currentPlayer={gameState.player!}
          category={gameState.selectedCategory!}
          onLeaveRoom={handleLeaveRoom} 
        />
      )}
    </div>
  );
};

export default Index;
