
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoomCreation from './RoomCreation';
import RoomJoin from './RoomJoin';
import { Player } from '@/lib/gameUtils';

interface WelcomeScreenProps {
  onGameStart: (roomCode: string, player: Player) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGameStart }) => {
  const handleRoomCreated = (roomCode: string, playerName: string, playerId: string) => {
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: true
    };
    onGameStart(roomCode, player);
  };

  const handleRoomJoined = (roomCode: string, playerName: string, playerId: string) => {
    const player: Player = {
      id: playerId,
      name: playerName,
      isHost: false
    };
    onGameStart(roomCode, player);
  };

  return (
    <div className="page-container">
      <div className="text-center mb-10 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-icebreaker to-icebreaker-dark">
            Icebreaker
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          A fun way to get to know your friends, colleagues, or classmates better
        </p>
      </div>
      
      <Tabs defaultValue="join" className="w-full max-w-md animate-fade-in-up">
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="join">Join a Room</TabsTrigger>
          <TabsTrigger value="create">Create a Room</TabsTrigger>
        </TabsList>
        <TabsContent value="join">
          <RoomJoin onRoomJoined={handleRoomJoined} />
        </TabsContent>
        <TabsContent value="create">
          <RoomCreation onRoomCreated={handleRoomCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WelcomeScreen;
