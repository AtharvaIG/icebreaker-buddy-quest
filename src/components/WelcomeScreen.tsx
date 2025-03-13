
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface WelcomeScreenProps {
  onGameStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGameStart }) => {
  return (
    <div className="container max-w-md mx-auto py-16 px-4 animate-fade-in relative">
      <ThemeToggle />
      
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-icebreaker to-icebreaker-dark dark:from-purple-light dark:to-purple bg-clip-text text-transparent">
          Icebreaker
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Get to know each other better
        </p>
      </div>

      <Card className="glass-card animate-fade-in-up shadow-md">
        <CardHeader>
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark rounded-full shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-xl mt-2">Local Multiplayer</CardTitle>
          <CardDescription className="text-center">
            Play with up to 4 friends on this device
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6 dark:text-gray-300">
            Add player names, select a category, and start answering fun questions!
          </p>

          <Button
            onClick={onGameStart}
            className="bg-gradient-to-r from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark hover:from-icebreaker-dark hover:to-icebreaker-dark dark:hover:from-purple-dark dark:hover:to-purple-dark transition-all w-full shadow-md interactive-button group"
            size="lg"
          >
            <span className="flex items-center gap-2">
              Start Game
              <Sparkles className="h-4 w-4 transition-all duration-300 group-hover:rotate-12" />
            </span>
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        No internet connection or sign-up required.
      </p>
    </div>
  );
};

export default WelcomeScreen;
