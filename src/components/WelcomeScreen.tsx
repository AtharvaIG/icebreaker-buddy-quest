
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight, Sparkles, GamepadIcon, Zap, Star } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface WelcomeScreenProps {
  onGameStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGameStart }) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="container max-w-md mx-auto py-16 px-4 animate-fade-in relative">
      <ThemeToggle />
      
      <div className="absolute -top-8 -right-8 w-40 h-40 bg-icebreaker dark:bg-purple opacity-20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-icebreaker-dark dark:bg-purple-dark opacity-20 rounded-full blur-3xl pointer-events-none z-0"></div>
      
      <div className="text-center mb-8 relative z-10">
        <div className="inline-block relative">
          <h1 className="text-5xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-icebreaker via-icebreaker-dark to-icebreaker dark:from-purple-light dark:via-purple dark:to-purple-light bg-clip-text text-transparent">
            Icebreaker
          </h1>
          <span className="absolute -top-5 -right-4 animate-bounce-subtle">
            <Sparkles className="h-6 w-6 text-amber-400 dark:text-amber-300" />
          </span>
        </div>
        <p className="text-xl text-gray-600 dark:text-gray-300 font-light">
          Break the ice, make new friends
        </p>
      </div>

      <Card 
        className={`glass-card animate-fade-in-up shadow-xl hover:shadow-2xl transition-all border-2 border-icebreaker-light dark:border-purple-dark border-opacity-20 dark:border-opacity-30 overflow-hidden ${isHovering ? 'transform scale-[1.02]' : ''}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark opacity-10 rounded-full blur-xl pointer-events-none"></div>
        <CardHeader>
          <div className={`flex justify-center transition-all duration-500 ${isHovering ? 'transform rotate-6' : ''}`}>
            <div className="p-3 bg-gradient-to-br from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
              <GamepadIcon className={`h-6 w-6 text-white transition-all duration-300 ${isHovering ? 'animate-pulse-subtle' : ''}`} />
            </div>
          </div>
          <CardTitle className="text-center text-xl mt-2 flex items-center justify-center gap-2">
            <span className={`transition-all duration-300 ${isHovering ? 'text-icebreaker dark:text-purple' : ''}`}>
              Play Together
            </span>
            <Zap className={`h-4 w-4 text-yellow-500 transition-all duration-300 ${isHovering ? 'animate-pulse-subtle' : 'opacity-0'}`} />
          </CardTitle>
          <CardDescription className="text-center">
            Fun questions to spark interesting conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className={`mb-6 dark:text-gray-300 transition-all duration-300 ${isHovering ? 'transform translate-y-[-4px]' : ''}`}>
            Add player names, pick a category, and discover something new about each other!
          </p>

          <Button
            onClick={onGameStart}
            className="bg-gradient-to-r from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark hover:from-icebreaker-dark hover:to-icebreaker-dark dark:hover:from-purple-dark dark:hover:to-purple-dark transition-all w-full shadow-md interactive-button group overflow-hidden relative"
            size="lg"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Game
              <Star className={`h-4 w-4 transition-all duration-500 ${isHovering ? 'animate-spin-slow' : ''}`} />
            </span>
            <span className={`absolute inset-0 w-full h-full bg-white dark:bg-purple-light opacity-0 group-hover:opacity-20 transition-opacity ${isHovering ? 'opacity-10' : ''}`}></span>
          </Button>
        </CardContent>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-icebreaker via-icebreaker-dark to-icebreaker dark:from-purple dark:via-purple-dark dark:to-purple transition-all duration-300 ${isHovering ? 'h-2' : ''}`}></div>
      </Card>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8 relative z-10">
        No internet connection or sign-up required ✨
      </p>
    </div>
  );
};

export default WelcomeScreen;
