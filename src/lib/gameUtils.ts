
import { useEffect, useState } from 'react';

// Types
export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  currentQuestion: string;
  currentRound: number;
  status: 'waiting' | 'playing' | 'ended';
  category: string;
}

export interface Player {
  id: string;
  name: string;
  answer?: number | null;
  isHost: boolean;
}

// Sample questions for the icebreaker game by category
export const questionsMap = {
  personal: [
    "On a scale of 1-10, how adventurous are you?",
    "From 1-10, how much of a morning person are you?",
    "On a scale of 1-10, how good are you at keeping secrets?",
    "Rate from 1-10 how much you enjoy spending time alone",
    "On a scale of 1-10, how organized would you say you are?",
    "From 1-10, how superstitious are you?",
  ],
  work: [
    "On a scale of 1-10, how much do you enjoy working from home?",
    "Rate from 1-10 how much you like giving presentations",
    "On a scale of 1-10, how organized is your work desk?",
    "From 1-10, how important is work-life balance to you?",
    "On a scale of 1-10, how comfortable are you with public speaking?",
    "From 1-10, how well do you handle tight deadlines?",
  ],
  food: [
    "On a scale of 1-10, how spicy do you like your food?",
    "Rate from 1-10 how likely you are to try exotic foods",
    "From 1-10, how good are you at cooking?",
    "On a scale of 1-10, how important is dessert to you?",
    "Rate from 1-10 how much you enjoy trying new restaurants",
    "From 1-10, how likely are you to finish someone else's food?",
  ],
  hobbies: [
    "On a scale of 1-10, how good are you at sticking with new hobbies?",
    "Rate from 1-10 how much you enjoy outdoor activities",
    "From 1-10, how competitive are you in games?",
    "On a scale of 1-10, how many hours do you spend on hobbies weekly?",
    "From 1-10, how likely are you to try an extreme sport?",
    "Rate from 1-10 how much you enjoy reading books",
  ],
  travel: [
    "On a scale of 1-10, how well do you pack for a trip?",
    "Rate from 1-10 how adventurous you are with local foods when traveling",
    "From 1-10, how much do you plan versus wing it when traveling?",
    "On a scale of 1-10, how comfortable are you with language barriers?",
    "Rate from 1-10, how far in advance do you plan your travels?",
    "From 1-10, how anxious are you about flying?",
  ],
  random: [
    "On a scale of 1-10, how patient are you when waiting in line?",
    "From 1-10, how much do you enjoy surprise parties?",
    "On a scale of 1-10, how attached are you to your phone?",
    "Rate from 1-10 how likely you are to cry during emotional movies",
    "From 1-10, how likely are you to binge-watch an entire series in one sitting?",
    "On a scale of 1-10, how important is social media in your daily life?",
  ],
  deep: [
    "On a scale of 1-10, how much does your personality change when you're around different people?",
    "Rate from 1-10 how stressful your life is right now",
    "From 1-10, how often do you feel alone even when you're with others?",
    "On a scale of 1-10, how much do you believe in love at first sight?",
    "From 1-10, how difficult do you find it to apologize to someone?",
    "Rate from 1-10 how much you believe in soulmates",
  ],
  fun: [
    "On a scale of 1-10, how likely would you be to open your own business?",
    "Rate from 1-10 how gullible you consider yourself",
    "From 1-10, how spicy can you handle your food?",
    "On a scale of 1-10, how likely are you to wait in line for a week for something you really want?",
    "Rate from 1-10 how much you enjoy roller coasters",
    "From 1-10, how lucky do you consider yourself?",
  ],
  friendship: [
    "On a scale of 1-10, how much do you value having one best friend versus many good friends?",
    "Rate from 1-10 how important friendships are in your life",
    "From 1-10, how difficult do you find making new friends?",
    "On a scale of 1-10, how good are you at maintaining long-distance friendships?",
    "Rate from 1-10 how good you are at resolving conflicts with friends",
    "From 1-10, how much do you share your personal life with friends?",
  ],
  hypothetical: [
    "On a scale of 1-10, how well would you survive a zombie apocalypse?",
    "Rate from 1-10 how good of a ghost you think you'd be",
    "From 1-10, how well would you rule a country if you were suddenly president?",
    "On a scale of 1-10, how well would you fare if you had to live in another time period?",
    "Rate from 1-10 how adaptable you'd be if you suddenly had to move to another country",
    "From 1-10, how successful do you think you'd be as a professional athlete?",
  ]
};

// Default fallback questions
export const defaultQuestions = [
  "On a scale of 1-10, how adventurous are you?",
  "From 1-10, how much of a morning person are you?",
  "On a scale of 1-10, how good are you at keeping secrets?",
  "Rate from 1-10 how likely you are to binge-watch an entire series in one sitting.",
];

/**
 * Generate a random 6-character room code
 */
export function generateRoomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Get a random question from the list based on category
 */
export function getRandomQuestion(category?: string): string {
  if (category && questionsMap[category as keyof typeof questionsMap]) {
    const categoryQuestions = questionsMap[category as keyof typeof questionsMap];
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
  }
  return defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)];
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Custom hook for storing and retrieving data from localStorage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
