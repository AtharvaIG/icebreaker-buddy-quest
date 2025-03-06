
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRoomCode, generatePlayerId, getRandomQuestion } from '@/lib/gameUtils';
import { ArrowRight, Users } from 'lucide-react';

interface RoomCreationProps {
  onRoomCreated: (roomCode: string, playerName: string, playerId: string) => void;
}

const RoomCreation: React.FC<RoomCreationProps> = ({ onRoomCreated }) => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setIsLoading(true);
    
    // Simulate network delay (would be a real API call in production)
    setTimeout(() => {
      const roomCode = generateRoomCode();
      const playerId = generatePlayerId();
      
      onRoomCreated(roomCode, playerName, playerId);
      setIsLoading(false);
    }, 800);
  };

  return (
    <Card className="w-full max-w-md glass-card animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-icebreaker-light mb-4">
          <Users className="h-6 w-6 text-icebreaker-dark" />
        </div>
        <CardTitle className="text-center text-2xl">Create a Room</CardTitle>
        <CardDescription className="text-center">
          Start a new icebreaker session with friends
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleCreateRoom}>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="transition-all duration-300 focus:ring-2 focus:ring-icebreaker"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full bg-icebreaker hover:bg-icebreaker-dark transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoomCreation;
