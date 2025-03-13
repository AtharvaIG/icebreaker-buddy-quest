
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NumberSelector from './NumberSelector';
import { Player } from '@/lib/gameUtils';
import { ArrowLeft, ArrowRight, Crown, MessageCircle, Copy, Users } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import offlineGameService from '@/lib/offlineGameService';

interface GameScreenProps {
  roomCode: string;
  players: Player[];
  category: string;
  onLeaveRoom: () => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ roomCode, players, category, onLeaveRoom }) => {
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [question, setQuestion] = useState<string>('');
  const [gamePlayers, setGamePlayers] = useState<Player[]>(players);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [currentHostId, setCurrentHostId] = useState<string | null>(null);
  const [showQuestion, setShowQuestion] = useState<boolean>(false);

  useEffect(() => {
    // Set up offline game event listeners
    const roomUpdateHandler = (data: any) => {
      setGamePlayers(data.players || []);
      if (data.currentQuestion) {
        setQuestion(data.currentQuestion);
      }
      setShowQuestion(data.showQuestion);
      // Find current host
      const host = data.players?.find((p: Player) => p.isHost);
      if (host) {
        setCurrentHostId(host.id);
      }
    };

    const playerAnsweredHandler = (data: any) => {
      // Update the player's answer in the local state
      setGamePlayers(prevPlayers => 
        prevPlayers.map(player => 
          player.id === data.playerId 
            ? { ...player, answer: data.answer }
            : player
        )
      );
      
      // Show the question associated with this number
      if (data.question) {
        setQuestion(data.question);
      }
    };

    const newQuestionHandler = (data: any) => {
      setQuestion(data.question || '');
      setSelectedNumber(null);
      setSelectedPlayerId(null);
      
      // Update players list
      if (data.players) {
        setGamePlayers(data.players);
      }
    };

    // Register event listeners
    offlineGameService.on('room_update', roomUpdateHandler);
    offlineGameService.on('player_answered', playerAnsweredHandler);
    offlineGameService.on('new_question', newQuestionHandler);

    // Get initial state
    const gameState = offlineGameService.getState();
    if (gameState) {
      setQuestion(gameState.currentQuestion);
      setGamePlayers(gameState.players);
      setShowQuestion(gameState.showQuestion);
      const host = gameState.players.find(p => p.isHost);
      if (host) {
        setCurrentHostId(host.id);
      }
    }

    // Cleanup on component unmount
    return () => {
      offlineGameService.off('room_update', roomUpdateHandler);
      offlineGameService.off('player_answered', playerAnsweredHandler);
      offlineGameService.off('new_question', newQuestionHandler);
    };
  }, []);

  const handleLeaveRoom = () => {
    onLeaveRoom();
  };

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayerId(playerId);
  };

  const handleNumberSelect = (number: number) => {
    if (selectedPlayerId === null) return;
    
    setSelectedNumber(number);
    offlineGameService.selectNumber(selectedPlayerId, number);
    
    toast({
      title: "Number Selected",
      description: `${gamePlayers.find(p => p.id === selectedPlayerId)?.name} chose ${number}`,
    });
  };

  const handleNextTurn = () => {
    offlineGameService.nextQuestion();
    setSelectedNumber(null);
    setSelectedPlayerId(null);
  };

  const isHost = (playerId: string) => {
    return playerId === currentHostId;
  };

  const getPlayerStatus = (player: Player) => {
    if (showQuestion) {
      return player.answer !== null && player.answer !== undefined 
        ? "Answered" 
        : "Waiting for next question";
    } else {
      return "Waiting to select a number";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200" 
          onClick={handleLeaveRoom}
        >
          <ArrowLeft className="h-4 w-4" /> Leave Game
        </Button>
        
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="bg-white bg-opacity-50 backdrop-blur-sm border-opacity-20 flex items-center gap-2 px-3 py-1.5 shadow-sm dark:bg-gray-800 dark:bg-opacity-50 dark:border-gray-700"
          >
            <Users className="h-4 w-4" />
            <span className="font-medium mr-1">{gamePlayers.length}</span>
          </Badge>

          <Badge variant="outline" className="bg-icebreaker text-white dark:bg-purple flex items-center gap-1 px-3 py-1.5 shadow-sm">
            <div className="flex items-center">
              <span className="text-xs uppercase tracking-wider mr-1">Category:</span> 
              {category}
            </div>
          </Badge>
        </div>
      </div>
      
      {showQuestion ? (
        <Card className="glass-card mb-8 overflow-hidden animate-fade-in shadow-md">
          <CardHeader className="bg-icebreaker bg-opacity-10 border-b border-icebreaker border-opacity-10 dark:bg-gray-800 dark:bg-opacity-50 dark:border-purple dark:border-opacity-20">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-icebreaker-light mb-3 mx-auto dark:bg-purple dark:bg-opacity-20">
              <MessageCircle className="h-5 w-5 text-icebreaker-dark dark:text-purple-light" />
            </div>
            <CardTitle className="text-center text-xl">Question #{selectedNumber}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            <p className="text-2xl font-medium text-center px-4 animate-fade-in">
              {question || "Waiting for the first question..."}
            </p>
          </CardContent>
          <CardFooter className="pb-6 flex justify-center">
            <Button 
              className="bg-icebreaker hover:bg-icebreaker-dark dark:bg-purple dark:hover:bg-purple-dark transition-all duration-300 flex items-center gap-2 shadow-sm"
              onClick={handleNextTurn}
              size="lg"
            >
              Next Question
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="mb-8 text-center animate-fade-in-up">
          <h3 className="text-lg font-medium mb-4">Select a player to roll:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {gamePlayers.map(player => (
              <Button
                key={player.id}
                variant={selectedPlayerId === player.id ? "default" : player.answer !== null && player.answer !== undefined ? "outline" : "default"}
                className={`m-1 ${
                  selectedPlayerId === player.id 
                    ? "bg-icebreaker-dark dark:bg-purple-dark hover:bg-icebreaker-dark dark:hover:bg-purple-dark ring-2 ring-icebreaker-light dark:ring-purple-light" 
                    : player.answer !== null && player.answer !== undefined 
                      ? "text-gray-500 dark:text-gray-400" 
                      : "bg-icebreaker hover:bg-icebreaker-dark dark:bg-purple dark:hover:bg-purple-dark"
                } shadow-sm transition-all`}
                onClick={() => handlePlayerSelect(player.id)}
                disabled={player.answer !== null && player.answer !== undefined}
              >
                {player.name}
                {isHost(player.id) && (
                  <Crown className="h-4 w-4 text-amber-500 ml-1" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {selectedPlayerId && !showQuestion && (
        <div className="mb-8 animate-fade-in-up">
          <h3 className="text-center text-lg font-medium mb-4">
            {gamePlayers.find(p => p.id === selectedPlayerId)?.name}, enter a number:
          </h3>
          <NumberSelector 
            onSelect={handleNumberSelect} 
            selectedNumber={selectedNumber} 
            min={1}
            max={100}
          />
        </div>
      )}
      
      <div className="animate-fade-in-up">
        <h3 className="text-center text-lg font-medium mb-4">Players:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {gamePlayers.map(player => (
            <Card key={player.id} className="glass-card overflow-hidden shadow-sm hover:shadow-md transition-all">
              <CardHeader className="py-3 px-4 bg-gradient-to-b from-white to-transparent dark:from-gray-800 dark:to-transparent">
                <CardTitle className="text-center text-base truncate flex items-center justify-center gap-1">
                  {player.name}
                  {isHost(player.id) && (
                    <Crown className="h-4 w-4 text-amber-500 ml-1" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3 text-center">
                {player.answer !== null && player.answer !== undefined ? (
                  <Badge className="bg-icebreaker dark:bg-purple">{player.answer}</Badge>
                ) : (
                  <span className="text-gray-400 text-sm">No answer yet</span>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{getPlayerStatus(player)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
