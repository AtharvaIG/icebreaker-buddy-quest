
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NumberSelector from './NumberSelector';
import { Room, Player, getRandomQuestion } from '@/lib/gameUtils';
import { ArrowLeft, ArrowRight, RefreshCw, Crown, MessageCircle, Copy, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface GameScreenProps {
  roomCode: string;
  currentPlayer: Player;
  category: string;
  onLeaveRoom: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ roomCode, currentPlayer, category, onLeaveRoom }) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [question, setQuestion] = useState(getRandomQuestion(category));
  const [players, setPlayers] = useState<Player[]>([
    { ...currentPlayer, isHost: true },
    // For demo purposes, add some fake players
    { id: 'player2', name: 'Alex', answer: 7, isHost: false },
    { id: 'player3', name: 'Taylor', answer: 4, isHost: false },
    { id: 'player4', name: 'Jordan', answer: 9, isHost: false },
  ]);

  const handleChooseNumber = () => {
    if (selectedNumber === null) return;
    
    // Get a new random question
    setQuestion(getRandomQuestion(category));
    
    toast({
      title: "New Question Selected",
      description: `You chose number ${selectedNumber}`,
    });
  };

  const handleNextTurn = () => {
    setQuestion(getRandomQuestion(category));
    setSelectedNumber(null);
    
    toast({
      title: "Next Turn",
      description: "New question loaded",
    });
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Room Code Copied",
      description: "Share this with your friends to join",
    });
  };

  const handleChooseAnotherNumber = () => {
    setSelectedNumber(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={onLeaveRoom}
        >
          <ArrowLeft className="h-4 w-4" /> Leave Room
        </Button>
        
        <div className="flex items-center">
          <Badge 
            variant="outline" 
            className="bg-white bg-opacity-50 backdrop-blur-sm border-opacity-20 cursor-pointer hover:bg-opacity-70 transition-all flex items-center gap-2 px-3 py-1.5"
            onClick={handleCopyRoomCode}
          >
            <span className="font-mono tracking-wider">{roomCode}</span>
            <Copy className="h-3.5 w-3.5 ml-1" />
          </Badge>
          
          <Badge variant="outline" className="ml-2 bg-white bg-opacity-50 backdrop-blur-sm border-opacity-20 flex items-center gap-2 px-3 py-1.5">
            <Users className="h-4 w-4" />
            <span className="font-medium mr-1">{players.length}</span>
          </Badge>

          <Badge variant="outline" className="ml-2 bg-icebreaker text-white flex items-center gap-1 px-3 py-1.5">
            <div className="flex items-center">
              <span className="text-xs uppercase tracking-wider mr-1">Category:</span> 
              {category}
            </div>
          </Badge>
        </div>
      </div>
      
      <Card className="glass-card mb-8 overflow-hidden">
        <CardHeader className="bg-icebreaker bg-opacity-10 border-b border-icebreaker border-opacity-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-icebreaker-light mb-3">
            <MessageCircle className="h-5 w-5 text-icebreaker-dark" />
          </div>
          <CardTitle className="text-center text-xl">Question</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 pb-8">
          <p className="text-2xl font-medium text-center px-4 animate-fade-in">
            {question}
          </p>
        </CardContent>
      </Card>
      
      <div className="mb-8">
        <h3 className="text-center text-lg font-medium mb-4 animate-fade-in-up">
          Select a number:
        </h3>
        <NumberSelector 
          onSelect={setSelectedNumber} 
          selectedNumber={selectedNumber} 
        />
        
        <div className="flex justify-center gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {selectedNumber !== null && (
            <Button 
              onClick={handleChooseNumber}
              className="bg-icebreaker hover:bg-icebreaker-dark transition-all duration-300 flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-5 w-5 mr-1" />
              Choose This Number
            </Button>
          )}
          
          {currentPlayer.isHost && (
            <Button 
              variant="outline"
              className="border-icebreaker text-icebreaker hover:bg-icebreaker hover:text-white transition-all duration-300 flex items-center gap-2"
              onClick={handleNextTurn}
              size="lg"
            >
              <ArrowRight className="h-5 w-5 mr-1" />
              Next Turn
            </Button>
          )}
        </div>
        
        {selectedNumber !== null && (
          <div className="flex justify-center mt-3">
            <Button 
              variant="ghost"
              className="text-gray-500 hover:text-icebreaker"
              onClick={handleChooseAnotherNumber}
            >
              Choose Another Number
            </Button>
          </div>
        )}
      </div>
      
      <div className="animate-fade-in-up">
        <h3 className="text-center text-lg font-medium mb-4">Players:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {players.map(player => (
            <Card key={player.id} className={`glass-card overflow-hidden ${player.id === currentPlayer.id ? 'ring-2 ring-icebreaker' : ''}`}>
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-center text-base truncate flex items-center justify-center gap-1">
                  {player.name}
                  {player.isHost && (
                    <Crown className="h-4 w-4 text-amber-500 ml-1" />
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
