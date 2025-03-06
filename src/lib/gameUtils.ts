
import { useEffect, useState } from 'react';

// Types
export interface Room {
  id: string;
  hostId: string;
  players: Player[];
  currentQuestion: string;
  currentRound: number;
  status: 'waiting' | 'playing' | 'ended';
}

export interface Player {
  id: string;
  name: string;
  answer?: number | null;
  isHost: boolean;
}

// Sample questions for the icebreaker game
export const icebreakQuestions = [
  "On a scale of 1-10, how adventurous are you?",
  "From 1-10, how much of a morning person are you?",
  "On a scale of 1-10, how good are you at keeping secrets?",
  "Rate from 1-10 how likely you are to binge-watch an entire series in one sitting.",
  "On a scale of 1-10, how good are you at cooking?",
  "From 1-10, how organized would you say your digital files are?",
  "On a scale of 1-10, how comfortable are you with public speaking?", 
  "Rate from 1-10 how likely you are to try exotic foods.",
  "On a scale of 1-10, how patient are you when waiting in line?",
  "From 1-10, how much do you enjoy surprise parties?",
  "On a scale of 1-10, how attached are you to your phone?",
  "Rate from 1-10 how likely you are to cry during emotional movies.",
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
 * Get a random question from the list
 */
export function getRandomQuestion(): string {
  return icebreakQuestions[Math.floor(Math.random() * icebreakQuestions.length)];
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
