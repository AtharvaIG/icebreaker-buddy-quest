
import React, { useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import GameScreen from '@/components/GameScreen';
import { Player, useLocalStorage } from '@/lib/gameUtils';

const Index = () => {
  // Store game state in localStorage to persist across refreshes
  const [gameState, setGameState] = useLocalStorage<{
    inGame: boolean;
    roomCode: string;
    player: Player | null;
  }>('icebreaker_game_state', {
    inGame: false,
    roomCode: '',
    player: null,
  });

  const handleGameStart = (roomCode: string, player: Player) => {
    setGameState({
      inGame: true,
      roomCode,
      player,
    });
  };

  const handleLeaveRoom = () => {
    setGameState({
      inGame: false,
      roomCode: '',
      player: null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {!gameState.inGame ? (
        <WelcomeScreen onGameStart={handleGameStart} />
      ) : (
        <GameScreen 
          roomCode={gameState.roomCode} 
          currentPlayer={gameState.player!} 
          onLeaveRoom={handleLeaveRoom} 
        />
      )}
    </div>
  );
};

export default Index;
