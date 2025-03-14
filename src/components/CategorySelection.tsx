
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight,
  Heart, 
  BriefcaseBusiness, 
  Pizza, 
  Palette, 
  Compass, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface CategorySelectionProps {
  onCategorySelect: (category: string) => void;
  onBack: () => void;
  roomCode: string;
}

// Reduced to 6 specific categories with friendly descriptions
const categories = [
  { id: 'personal', name: 'Personal', icon: <Heart className="h-5 w-5" />, description: 'Get to know each other better', color: 'from-pink-400 to-rose-600 dark:from-pink-500 dark:to-rose-700', bgLight: 'bg-pink-100', bgDark: 'dark:bg-pink-900' },
  { id: 'work', name: 'Work Life', icon: <BriefcaseBusiness className="h-5 w-5" />, description: 'Office talk & career dreams', color: 'from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700', bgLight: 'bg-blue-100', bgDark: 'dark:bg-blue-900' },
  { id: 'food', name: 'Food & Drinks', icon: <Pizza className="h-5 w-5" />, description: 'Tasty talks & culinary adventures', color: 'from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700', bgLight: 'bg-orange-100', bgDark: 'dark:bg-orange-900'  },
  { id: 'hobbies', name: 'Hobbies', icon: <Palette className="h-5 w-5" />, description: 'Passions & pastimes', color: 'from-green-400 to-green-600 dark:from-green-500 dark:to-green-700', bgLight: 'bg-green-100', bgDark: 'dark:bg-green-900'  },
  { id: 'travel', name: 'Travel', icon: <Compass className="h-5 w-5" />, description: 'Adventures & dream destinations', color: 'from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700', bgLight: 'bg-amber-100', bgDark: 'dark:bg-amber-900'  },
  { id: 'deep', name: 'Deep Questions', icon: <MessageCircle className="h-5 w-5" />, description: 'Thought-provoking conversations', color: 'from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700', bgLight: 'bg-purple-100', bgDark: 'dark:bg-purple-900'  },
];

const CategorySelection: React.FC<CategorySelectionProps> = ({ onCategorySelect, onBack, roomCode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedCategory) {
      onCategorySelect(selectedCategory);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in relative">
      <ThemeToggle />
      
      <div className="absolute -top-28 -right-28 w-56 h-56 bg-icebreaker dark:bg-purple opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-28 -left-28 w-56 h-56 bg-icebreaker-dark dark:bg-purple-dark opacity-20 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 shadow-sm interactive-button dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 hover:bg-icebreaker/10 dark:hover:bg-purple/10" 
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
            Choose a Category
          </h1>
          <span className="absolute -top-4 -right-6 animate-pulse-subtle">
            <Sparkles className="h-5 w-5 text-amber-400 dark:text-amber-300" />
          </span>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          What would you like to talk about today?
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-md interactive-button overflow-hidden relative ${
              selectedCategory === category.id 
                ? `ring-2 ring-icebreaker dark:ring-purple ${category.bgLight} ${category.bgDark} bg-opacity-30 dark:bg-opacity-20 shadow-md transform scale-105` 
                : 'glass-card hover:bg-icebreaker-light hover:bg-opacity-20 dark:hover:bg-purple-dark dark:hover:bg-opacity-10'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {selectedCategory === category.id && (
              <div className="absolute inset-0 bg-gradient-to-br opacity-10 pointer-events-none"></div>
            )}
            <CardHeader className="pb-2 relative">
              <div className="flex justify-center mb-2">
                <div className={`p-3 rounded-lg ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-br ${category.color} text-white shadow-md` 
                    : `${category.bgLight} ${category.bgDark} bg-opacity-50 dark:bg-opacity-30`
                } transition-all duration-300`}>
                  {category.icon}
                </div>
              </div>
              <CardTitle className="text-center text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
            </CardContent>
            {selectedCategory === category.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-70 transition-opacity duration-300 animate-pulse-subtle"></div>
            )}
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center animate-fade-in-up">
        <Button 
          onClick={handleContinue}
          disabled={!selectedCategory}
          className="relative overflow-hidden bg-gradient-to-r from-icebreaker to-icebreaker-dark dark:from-purple dark:to-purple-dark hover:from-icebreaker-dark hover:to-icebreaker-dark dark:hover:from-purple-dark dark:hover:to-purple-dark transition-all shadow-md interactive-button group px-8"
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

export default CategorySelection;
