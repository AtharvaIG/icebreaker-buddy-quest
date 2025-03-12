
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

interface WelcomeScreenProps {
  onGameStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGameStart }) => {
  return (
    <div className="container max-w-md mx-auto py-16 px-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Icebreaker
        </h1>
        <p className="text-xl text-gray-600">
          Get to know each other better
        </p>
      </div>

      <Card className="glass-card animate-fade-in-up">
        <CardHeader>
          <div className="flex justify-center">
            <div className="p-3 bg-icebreaker rounded-full">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-center text-xl mt-2">Local Multiplayer</CardTitle>
          <CardDescription className="text-center">
            Play with up to 4 friends on this device
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Add player names, select a category, and start answering fun questions!
          </p>

          <Button
            onClick={onGameStart}
            className="bg-icebreaker hover:bg-icebreaker-dark transition-colors w-full"
            size="lg"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500 mt-8">
        No internet connection or sign-up required.
      </p>
    </div>
  );
};

export default WelcomeScreen;
