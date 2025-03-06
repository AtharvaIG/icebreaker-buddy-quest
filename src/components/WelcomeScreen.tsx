
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
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-icebreaker to-icebreaker-dark">
            Icebreaker
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto mb-6">
          A fun way to get to know each other better
        </p>
        
        <div className="max-w-md mx-auto bg-white bg-opacity-50 backdrop-blur-sm rounded-lg p-4 mb-8">
          <h2 className="text-lg font-medium mb-2">How to Play:</h2>
          <ol className="text-left text-gray-700 space-y-2 pl-5 list-decimal">
            <li>Create a room or join with a code</li>
            <li>Select a question category</li>
            <li>Answer questions by rating them on a scale of 1-10</li>
            <li>See how everyone answered and discuss!</li>
          </ol>
        </div>
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
