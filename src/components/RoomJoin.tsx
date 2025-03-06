
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generatePlayerId } from '@/lib/gameUtils';
import { ArrowRight, LogIn } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface RoomJoinProps {
  onRoomJoined: (roomCode: string, playerName: string, playerId: string) => void;
}

const RoomJoin: React.FC<RoomJoinProps> = ({ onRoomJoined }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !playerName.trim()) return;
    
    setIsLoading(true);
    
    // In a real application, we would verify the room code on the server
    // For this demo, we'll simulate a successful join after a brief delay
    setTimeout(() => {
      if (roomCode.length !== 6) {
        toast({
          title: "Invalid Room Code",
          description: "Please enter a valid 6-character room code",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      const playerId = generatePlayerId();
      onRoomJoined(roomCode.toUpperCase(), playerName, playerId);
      setIsLoading(false);
    }, 800);
  };

  // Format room code input (uppercase and max 6 chars)
  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setRoomCode(value);
  };

  return (
    <Card className="w-full max-w-md glass-card animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <CardHeader>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-icebreaker-light mb-4">
          <LogIn className="h-5 w-5 text-icebreaker-dark" />
        </div>
        <CardTitle className="text-center text-xl">Join a Room</CardTitle>
        <CardDescription className="text-center">
          Enter a room code to join a session
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleJoinRoom}>
        <CardContent className="space-y-4">
          <div>
            <Input
              placeholder="6-digit room code"
              value={roomCode}
              onChange={handleRoomCodeChange}
              className="text-center font-mono text-lg tracking-wider uppercase transition-all duration-300 focus:ring-2 focus:ring-icebreaker"
              required
            />
          </div>
          <div>
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
            disabled={isLoading || roomCode.length !== 6 || !playerName.trim()}
          >
            {isLoading ? 'Joining...' : 'Join Room'}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RoomJoin;
