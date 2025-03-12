
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Heart, 
  BriefcaseBusiness, 
  Pizza, 
  Palette, 
  Compass, 
  MessageCircle 
} from 'lucide-react';

interface CategorySelectionProps {
  onCategorySelect: (category: string) => void;
  onBack: () => void;
  roomCode: string;
}

// Reduced to 6 specific categories
const categories = [
  { id: 'personal', name: 'Personal', icon: <Heart className="h-5 w-5" />, description: 'Get to know each other on a personal level' },
  { id: 'work', name: 'Work Life', icon: <BriefcaseBusiness className="h-5 w-5" />, description: 'Discover work preferences and habits' },
  { id: 'food', name: 'Food & Drinks', icon: <Pizza className="h-5 w-5" />, description: 'All about culinary tastes and preferences' },
  { id: 'hobbies', name: 'Hobbies', icon: <Palette className="h-5 w-5" />, description: 'Explore interests and pastimes' },
  { id: 'travel', name: 'Travel', icon: <Compass className="h-5 w-5" />, description: 'Adventures and destination preferences' },
  { id: 'deep', name: 'Deep Questions', icon: <MessageCircle className="h-5 w-5" />, description: 'Thought-provoking questions' },
];

const CategorySelection: React.FC<CategorySelectionProps> = ({ onCategorySelect, onBack, roomCode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedCategory) {
      onCategorySelect(selectedCategory);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        
        <Badge 
          variant="outline" 
          className="bg-white bg-opacity-50 backdrop-blur-sm border-opacity-20 flex items-center gap-2 px-3 py-1.5"
        >
          Room: <span className="font-mono tracking-wider">{roomCode}</span>
        </Badge>
      </div>

      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          Select a Category
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          Choose a topic for your icebreaker questions
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in-up">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
              selectedCategory === category.id 
                ? 'ring-2 ring-icebreaker bg-icebreaker bg-opacity-5' 
                : 'glass-card hover:bg-icebreaker-light hover:bg-opacity-20'
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-center mb-2">
                <div className={`p-2 rounded-full ${
                  selectedCategory === category.id 
                    ? 'bg-icebreaker text-white' 
                    : 'bg-icebreaker-light'
                }`}>
                  {category.icon}
                </div>
              </div>
              <CardTitle className="text-center text-lg">{category.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-4">
              <p className="text-sm text-gray-600">{category.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-center animate-fade-in-up">
        <Button 
          onClick={handleContinue}
          disabled={!selectedCategory}
          className="bg-icebreaker hover:bg-icebreaker-dark transition-all duration-300"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CategorySelection;
