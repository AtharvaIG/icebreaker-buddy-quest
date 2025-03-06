
import React, { useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import GameScreen from '@/components/GameScreen';
import CategorySelection from '@/components/CategorySelection';
import { Player, useLocalStorage } from '@/lib/gameUtils';

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

  const handleGameStart = (roomCode: string, player: Player) => {
    setGameState({
      ...gameState,
      inCategorySelection: true,
      roomCode,
      player,
    });
  };

  const handleCategorySelect = (category: string) => {
    setGameState({
      ...gameState,
      inGame: true,
      inCategorySelection: false,
      selectedCategory: category,
    });
  };

  const handleLeaveRoom = () => {
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
