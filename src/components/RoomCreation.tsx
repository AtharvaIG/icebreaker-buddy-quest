
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import socketService from '@/lib/socketService';

interface RoomCreationProps {
  onRoomCreated: (roomCode: string, playerName: string, playerId: string) => void;
}

const RoomCreation: React.FC<RoomCreationProps> = ({ onRoomCreated }) => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Call the actual API through our socket service
      const result = await socketService.createRoom(playerName);
      onRoomCreated(result.roomCode, playerName, result.playerId);
    } catch (error) {
      console.error('Failed to create room:', error);
      toast({
        title: "Failed to Create Room",
        description: "There was an error creating the room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md glass-card animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-icebreaker-light mb-4">
          <Plus className="h-5 w-5 text-icebreaker-dark" />
        </div>
        <CardTitle className="text-center text-xl">Create a Room</CardTitle>
        <CardDescription className="text-center">
          Start a new icebreaker session
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
