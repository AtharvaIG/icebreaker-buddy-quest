
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
    "What's the weirdest thing you've done in public?",
    "What's an embarrassing thing you've done and never told anyone about?",
    "What's the most bizarre text you've ever received?",
    "What's the cringiest thing you've ever put up on social media?",
    "What do you feel the most guilty about?",
    "Who do you wish you could reconnect with?",
    "How much does your personality change when you're around different people?",
    "What stresses you out the most?",
    "When do you feel the most alone?",
    "Have you ever been in love?",
    "Do you believe in love at first sight?",
    "What's the biggest lesson your last relationship taught you?",
  ],
  work: [
    "What's the nicest thing someone has done for you at work?",
    "If someone wrote a book about your work life, what would it be called?",
    "What's one thing you would change about your work environment?",
    "What was the last turning point in your career?",
    "What thing keeps you going on hard work days?",
    "What's your biggest work achievement?",
  ],
  food: [
    "What's your favorite comfort food?",
    "If you could only eat one condiment for the rest of your life, which would you choose?",
    "What's the spiciest food you've ever eaten?",
    "What's a food combination that you love but others find strange?",
    "If you had to eat an entire barrel of one single thing, what would you choose?",
    "What's the most unusual food you've ever tried?",
  ],
  hobbies: [
    "What hobby would you like to get into if time and money weren't issues?",
    "Have you ever had a crush on a cartoon character?",
    "Did you build forts when you were a kid? What did they look like?",
    "If you got to design a new instrument, what would you create?",
    "What's your favorite way to exercise?",
    "If you were to write a book, what would it be about?",
  ],
  travel: [
    "Where do you want to travel the most?",
    "What's the luckiest thing that's ever happened to you while traveling?",
    "If you had to live in another time period, what would you choose?",
    "If you could only visit beaches or mountains for the rest of your life, which would you choose?",
    "What's your favorite form of transportation?",
    "What's the best museum you've ever been to?",
  ],
  random: [
    "If flowers could talk, what do you think they would sound like?",
    "If you could be any household item, which would you choose?",
    "If you were a ghost, how would you haunt people?",
    "What bodily function do you wish would just go away?",
    "If you could shoot anything from a cannon, what would you pick?",
    "Do you have a favourite family tradition?",
  ],
  deep: [
    "What's something you consider unforgivable?",
    "What's the most loved you've ever felt?",
    "What do you think happens when we die?",
    "When's the last time you felt inspired to create something?",
    "What does friendship mean to you?",
    "Do you believe in soulmates?",
  ],
  fun: [
    "Would you ever open a business?",
    "How gullible do you consider yourself?",
    "What's the spiciest food you've ever eaten?",
    "Is there anything you'd wait in line for a week to do, see, or get?",
    "How do you like to be comforted when you're sad or upset?",
    "Do you consider yourself lucky?",
  ],
  friendship: [
    "Do you believe in having one best friend?",
    "Who do you feel the safest around?",
    "What's your favourite childhood memory with a friend?",
    "Have you ever experienced a 'friendship breakup'? What did it teach you?",
    "Who was your first friend, and are they still in your life?",
    "How can I be a better friend to you?",
  ],
  hypothetical: [
    "If you could be an expert at one thing, what would it be?",
    "If money was no object, what would you buy?",
    "If you could time travel, where would you go?",
    "What's your survival plan during a zombie apocalypse?",
    "If you were an animal, what would you be?",
    "If a song played every time you entered a room, what would it be?",
  ]
};

// Default fallback questions
export const defaultQuestions = [
  "What's the weirdest thing you've done in public?",
  "What's your most embarrassing moment?",
  "Have you ever been in love?",
  "If you could have any superpower, what would it be?",
];

// Generate numbered questions map (1-100) for each category
export function generateNumberedQuestions(category: string): Map<number, string> {
  const questionMap = new Map<number, string>();
  const allQuestions: string[] = [];
  
  // First, add all questions from the specified category
  if (questionsMap[category as keyof typeof questionsMap]) {
    allQuestions.push(...questionsMap[category as keyof typeof questionsMap]);
  }
  
  // Then add questions from other categories to fill up to 100
  const categories = Object.keys(questionsMap);
  let currentCategoryIndex = 0;
  
  while (allQuestions.length < 100) {
    // Skip the specified category as we've already added it
    if (categories[currentCategoryIndex] === category) {
      currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
      continue;
    }
    
    const currentCategory = categories[currentCategoryIndex];
    const categoryQuestions = questionsMap[currentCategory as keyof typeof questionsMap];
    
    for (const question of categoryQuestions) {
      if (!allQuestions.includes(question)) {
        allQuestions.push(question);
        if (allQuestions.length >= 100) break;
      }
    }
    
    currentCategoryIndex = (currentCategoryIndex + 1) % categories.length;
  }
  
  // Shuffle the questions to make the distribution random
  const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
  
  // Map each number to a question
  for (let i = 1; i <= 100; i++) {
    // Use modulo to cycle through available questions if we have fewer than 100
    const questionIndex = (i - 1) % shuffledQuestions.length;
    questionMap.set(i, shuffledQuestions[questionIndex]);
  }
  
  return questionMap;
}

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
 * Get a specific question based on selected number and category
 */
export function getQuestionByNumber(number: number, category: string): string {
  const questionMap = generateNumberedQuestions(category);
  return questionMap.get(number) || getRandomQuestion(category);
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
