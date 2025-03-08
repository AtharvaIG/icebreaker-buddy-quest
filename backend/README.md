
# Icebreaker Game Backend

This is the backend for the Icebreaker game, handling room management and real-time communication between players.

## Features

- Room creation with unique codes
- WebSocket-based real-time communication
- Automatic admin assignment (first player to join)
- Question tracking to avoid repeats in the same session
- Multiple question categories
- Player join/exit handling with game state consistency

## Setup and Running

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables (optional, defaults provided):
   - Create a `.env` file or set environment variables:
     ```
     SECRET_KEY=your-secret-key
     DEBUG=False
     PORT=5000
     ```

3. Run the server:
   ```
   python app.py
   ```
   
   The server will start on port 5000 by default (configurable via PORT).

## API Endpoints

- `POST /api/create_room`: Create a new game room
  - Request body: `{ "playerName": "string" }`
  - Response: `{ "roomCode": "string", "playerId": "string", "isHost": true }`

- `POST /api/join_room`: Join an existing room via REST API
  - Request body: `{ "roomCode": "string", "playerName": "string" }`
  - Response: `{ "roomCode": "string", "playerId": "string", "isHost": false }`

## WebSocket Events

### Client to Server:

- `join_room`: Join a room
  - Data: `{ "roomCode": "string", "playerId": "string", "playerName": "string" }`

- `leave_room`: Leave a room
  - Data: `{ "roomCode": "string", "playerId": "string" }`

- `select_category`: Select a question category
  - Data: `{ "roomCode": "string", "playerId": "string", "category": "string" }`

- `select_number`: Select a number answer
  - Data: `{ "roomCode": "string", "playerId": "string", "number": number }`

- `next_turn`: Move to the next question (host only)
  - Data: `{ "roomCode": "string", "playerId": "string" }`

### Server to Client:

- `room_update`: Room state update
  - Data: `{ "players": Array, "currentQuestion": "string", "hostId": "string", "category": "string" }`

- `player_joined`: New player joined notification
  - Data: `{ "playerName": "string", "playerId": "string", "isHost": boolean }`

- `player_left`: Player left notification
  - Data: `{ "playerId": "string", "playerName": "string" }`

- `category_selected`: Category was selected
  - Data: `{ "category": "string", "currentQuestion": "string" }`

- `player_answered`: A player selected a number
  - Data: `{ "playerId": "string", "playerName": "string", "answer": number }`

- `new_question`: New question for next turn
  - Data: `{ "question": "string", "players": Array }`

- `error`: Error notification
  - Data: `{ "message": "string" }`
