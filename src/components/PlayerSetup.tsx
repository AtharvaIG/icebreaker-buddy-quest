
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, User, X, ArrowRight } from 'lucide-react';
import { Player, generatePlayerId } from '@/lib/gameUtils';
import { toast } from '@/components/ui/use-toast';

interface PlayerSetupProps {
  onComplete: (players: Player[]) => void;
  onBack: () => void;
  roomCode: string;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onComplete, onBack, roomCode }) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: generatePlayerId(), name: '', isHost: true } // Start with one empty player
  ]);
  const [currentPlayerName, setCurrentPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (players.length >= 4) {
      toast({
        title: "Maximum Players Reached",
        description: "You can only have up to 4 players",
      });
      return;
    }
    
    setPlayers([...players, { 
      id: generatePlayerId(), 
      name: '', 
      isHost: false 
    }]);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "You need at least one player",
      });
      return;
    }
    
    const newPlayers = players.filter(p => p.id !== id);
    
    // If we removed the host, assign the first player as host
    if (!newPlayers.some(p => p.isHost)) {
      newPlayers[0].isHost = true;
    }
    
    setPlayers(newPlayers);
  };

  const handleUpdatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };

  const handleContinue = () => {
    // Validate that all players have names
    const emptyNames = players.some(p => !p.name.trim());
    if (emptyNames) {
      toast({
        title: "Missing Names",
        description: "All players must have names",
      });
      return;
    }
    
    // Check for duplicate names
    const names = players.map(p => p.name.trim());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== players.length) {
      toast({
        title: "Duplicate Names",
        description: "All players must have unique names",
      });
      return;
    }
    
    onComplete(players);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 shadow-sm" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        
        <Badge 
          variant="outline" 
          className="bg-white bg-opacity-50 backdrop-blur-sm border-opacity-20 flex items-center gap-2 px-3 py-1.5 shadow-sm"
        >
          Room: <span className="font-mono tracking-wider">{roomCode}</span>
        </Badge>
      </div>

      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 tracking-tight bg-gradient-to-r from-icebreaker to-icebreaker-dark bg-clip-text text-transparent">
          Add Players
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Enter names for all players (1-4)
        </p>
      </div>
      
      <Card className="mb-8 animate-fade-in-up glass-card shadow-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Players
            <Button 
              onClick={handleAddPlayer}
              disabled={players.length >= 4}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Add Player
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {players.map((player, index) => (
            <div key={player.id} className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-icebreaker bg-opacity-10">
                <User className="h-4 w-4 text-icebreaker" />
              </div>
              
              <Input
                placeholder={`Player ${index + 1} name`}
                value={player.name}
                onChange={(e) => handleUpdatePlayerName(player.id, e.target.value)}
                className="flex-1"
                maxLength={20}
              />
              
              {player.isHost && (
                <Badge className="bg-amber-500">Host</Badge>
              )}
              
              <Button 
                variant="ghost" 
                className="p-1 h-auto"
                onClick={() => handleRemovePlayer(player.id)}
                disabled={players.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-center animate-fade-in-up">
        <Button 
          onClick={handleContinue}
          disabled={players.length === 0}
          className="bg-gradient-to-r from-icebreaker to-icebreaker-dark hover:from-icebreaker-dark hover:to-icebreaker-dark transition-all shadow-md"
          size="lg"
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerSetup;
