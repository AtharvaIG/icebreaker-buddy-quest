
import random
from typing import List, Dict, Optional, Any

class Player:
    """Represents a player in the game"""
    
    def __init__(self, id: str, name: str, is_host: bool = False):
        self.id = id
        self.name = name
        self.is_host = is_host
        self.answer: Optional[int] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert player to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'name': self.name,
            'isHost': self.is_host,
            'answer': self.answer
        }

class GameSession:
    """Manages the state for a game room"""
    
    # Dictionary of questions by category
    QUESTIONS = {
        "personal": [
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
        "work": [
            "What's the nicest thing someone has done for you at work?",
            "If someone wrote a book about your work life, what would it be called?",
            "What's one thing you would change about your work environment?",
            "What was the last turning point in your career?",
            "What thing keeps you going on hard work days?",
            "What's your biggest work achievement?",
        ],
        "food": [
            "What's your favorite comfort food?",
            "If you could only eat one condiment for the rest of your life, which would you choose?",
            "What's the spiciest food you've ever eaten?",
            "What's a food combination that you love but others find strange?",
            "If you had to eat an entire barrel of one single thing, what would you choose?",
            "What's the most unusual food you've ever tried?",
        ],
        "hobbies": [
            "What hobby would you like to get into if time and money weren't issues?",
            "Have you ever had a crush on a cartoon character?",
            "Did you build forts when you were a kid? What did they look like?",
            "If you got to design a new instrument, what would you create?",
            "What's your favorite way to exercise?",
            "If you were to write a book, what would it be about?",
        ],
        "travel": [
            "Where do you want to travel the most?",
            "What's the luckiest thing that's ever happened to you while traveling?",
            "If you had to live in another time period, what would you choose?",
            "If you could only visit beaches or mountains for the rest of your life, which would you choose?",
            "What's your favorite form of transportation?",
            "What's the best museum you've ever been to?",
        ],
        "deep": [
            "What's something you consider unforgivable?",
            "What's the most loved you've ever felt?",
            "What do you think happens when we die?",
            "When's the last time you felt inspired to create something?",
            "What does friendship mean to you?",
            "Do you believe in soulmates?",
        ]
    }
    
    # Default questions if no category is selected
    DEFAULT_QUESTIONS = [
        "What's the weirdest thing you've done in public?",
        "What's your most embarrassing moment?",
        "Have you ever been in love?",
        "If you could have any superpower, what would it be?",
    ]
    
    def __init__(self, room_code: str, host: Player):
        self.room_code = room_code
        self.host = host
        self.players: List[Player] = [host]
        self.category = "personal"  # Default category
        self.current_question = self._get_random_question()
        self.used_questions: List[str] = [self.current_question]  # Track used questions
    
    def add_player(self, player: Player) -> None:
        """Add a player to the session"""
        self.players.append(player)
    
    def remove_player(self, player_id: str) -> None:
        """Remove a player from the session"""
        self.players = [p for p in self.players if p.id != player_id]
    
    def get_player(self, player_id: str) -> Optional[Player]:
        """Get a player by ID"""
        for player in self.players:
            if player.id == player_id:
                return player
        return None
    
    def set_category(self, category: str) -> None:
        """Set the question category"""
        if category in self.QUESTIONS:
            self.category = category
        else:
            self.category = "personal"  # Fallback to personal if category doesn't exist
    
    def next_question(self) -> str:
        """Get the next question, avoiding duplicates"""
        new_question = self._get_random_question()
        # Try up to 10 times to get a non-duplicate question
        attempts = 0
        while new_question in self.used_questions and attempts < 10:
            new_question = self._get_random_question()
            attempts += 1
        
        self.current_question = new_question
        self.used_questions.append(new_question)
        return new_question
    
    def _get_random_question(self) -> str:
        """Get a random question based on the current category"""
        if self.category in self.QUESTIONS:
            category_questions = self.QUESTIONS[self.category]
            return random.choice(category_questions)
        return random.choice(self.DEFAULT_QUESTIONS)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary for JSON serialization"""
        return {
            'roomCode': self.room_code,
            'hostId': self.host.id,
            'players': [p.to_dict() for p in self.players],
            'currentQuestion': self.current_question,
            'category': self.category
        }
