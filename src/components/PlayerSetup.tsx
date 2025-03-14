
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, User, X, ArrowRight, Crown, Sparkles } from 'lucide-react';
import { Player, generatePlayerId } from '@/lib/gameUtils';
import { toast } from '@/components/ui/use-toast';
import ThemeToggle from './ThemeToggle';

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

  // Player colors for a bit of fun
  const playerColors = [
    'bg-pink-500 dark:bg-pink-600',
    'bg-blue-500 dark:bg-blue-600',
    'bg-green-500 dark:bg-green-600',
    'bg-amber-500 dark:bg-amber-600'
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in relative">
      <ThemeToggle />
      
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-icebreaker dark:bg-purple opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-icebreaker-dark dark:bg-purple-dark opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-icebreaker/10 dark:hover:bg-purple/10" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        
        <Badge 
          variant="outline" 
          className="bg-white bg-opacity-50 backdrop-blur-sm border-opacity-20 flex items-center gap-2 px-3 py-1.5 shadow-sm dark:bg-gray-800 dark:bg-opacity-50 dark:border-purple-300 dark:border-opacity-20"
        >
          Room: <span className="font-mono tracking-wider">{roomCode}</span>
        </Badge>
      </div>

      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-block relative">
          <h1 className="text-3xl font-bold mb-2 tracking-tight bg-gradient-to-r from-icebreaker via-icebreaker-dark to-icebreaker dark:from-purple-light dark:via-purple dark:to-purple-light bg-clip-text text-transparent">
            Who's Playing?
          </h1>
          <span className="absolute -top-4 -right-6 animate-pulse-subtle">
            <Sparkles className="h-5 w-5 text-amber-400 dark:text-amber-300" />
          </span>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Enter names for all players (1-4)
        </p>
      </div>
      
      <Card className="mb-8 animate-fade-in-up glass-card shadow-md border-2 border-icebreaker-light dark:border-purple-dark border-opacity-20 dark:border-opacity-20 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark opacity-10 rounded-full blur-xl pointer-events-none"></div>
        
        <CardHeader className="relative">
          <CardTitle className="flex justify-between items-center">
            Players
            <Button 
              onClick={handleAddPlayer}
              disabled={players.length >= 4}
              variant="ghost"
              className="flex items-center gap-2 dark:text-gray-200 bg-icebreaker/10 dark:bg-purple/10 hover:bg-icebreaker/20 dark:hover:bg-purple/20 transition-colors"
            >
              <UserPlus className="h-4 w-4" /> Add Player
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {players.map((player, index) => (
            <div 
              key={player.id} 
              className="flex items-center gap-2 mb-4 p-2 rounded-lg transition-all hover:bg-icebreaker/5 dark:hover:bg-purple/5 relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${playerColors[index % playerColors.length]} text-white shrink-0`}>
                {player.isHost ? (
                  <Crown className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              
              <Input
                placeholder={`Player ${index + 1}`}
                value={player.name}
                onChange={(e) => handleUpdatePlayerName(player.id, e.target.value)}
                className="flex-1 dark:bg-gray-800/50 dark:border-gray-700 dark:placeholder:text-gray-500 focus-within:ring-1 ring-icebreaker dark:ring-purple"
                maxLength={20}
              />
              
              {player.isHost && (
                <Badge className="bg-amber-500 dark:bg-amber-500 dark:text-gray-900 animate-pulse-subtle">Host</Badge>
              )}
              
              <Button 
                variant="ghost" 
                className="p-1 h-auto dark:text-gray-400 dark:hover:text-gray-200 hover:bg-red-500/10 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-500 rounded-full"
                onClick={() => handleRemovePlayer(player.id)}
                disabled={players.length <= 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-icebreaker via-icebreaker-dark to-icebreaker dark:from-purple dark:via-purple-dark dark:to-purple"></div>
      </Card>
      
      <div className="flex justify-center animate-fade-in-up">
        <Button 
          onClick={handleContinue}
          disabled={players.length === 0}
          className="relative overflow-hidden bg-gradient-to-r from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark hover:from-icebreaker-dark hover:to-icebreaker-dark dark:hover:from-purple-dark dark:hover:to-purple-dark transition-all shadow-md px-8"
          size="lg"
        >
          <span className="relative z-10 flex items-center gap-2">
            Continue
            <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
          </span>
          <span className="absolute inset-0 w-full h-full bg-white dark:bg-purple-light opacity-0 group-hover:opacity-20 transition-opacity"></span>
        </Button>
      </div>
    </div>
  );
};

export default PlayerSetup;
