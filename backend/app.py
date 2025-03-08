
import os
import uuid
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room
from game_session import GameSession, Player

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'icebreaker-dev-key')

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Store active game sessions
active_sessions = {}

# API Routes
@app.route('/api/create_room', methods=['POST'])
def create_room():
    """Create a new game room"""
    data = request.json
    player_name = data.get('playerName')
    
    if not player_name:
        return jsonify({'error': 'Player name is required'}), 400
    
    # Generate unique room code
    room_code = generate_room_code()
    
    # Create player with host privileges
    player_id = str(uuid.uuid4())
    host = Player(player_id, player_name, is_host=True)
    
    # Create new game session
    session = GameSession(room_code, host)
    active_sessions[room_code] = session
    
    return jsonify({
        'roomCode': room_code,
        'playerId': player_id,
        'isHost': True
    })

@app.route('/api/join_room', methods=['POST'])
def join_room_api():
    """Join an existing room via API"""
    data = request.json
    room_code = data.get('roomCode')
    player_name = data.get('playerName')
    
    if not room_code or not player_name:
        return jsonify({'error': 'Room code and player name are required'}), 400
    
    # Check if room exists
    if room_code not in active_sessions:
        return jsonify({'error': 'Room not found'}), 404
    
    # Generate player ID
    player_id = str(uuid.uuid4())
    
    return jsonify({
        'roomCode': room_code,
        'playerId': player_id,
        'isHost': False
    })

# Socket.IO Events
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('join_room')
def handle_join_room(data):
    """Handle a player joining a room via WebSocket"""
    room_code = data.get('roomCode')
    player_id = data.get('playerId')
    player_name = data.get('playerName')
    
    if not room_code or not player_id or not player_name:
        emit('error', {'message': 'Invalid data provided'})
        return
    
    # Join the Socket.IO room
    join_room(room_code)
    
    # Get the game session
    session = active_sessions.get(room_code)
    
    if not session:
        emit('error', {'message': 'Room not found'})
        return
    
    # Check if player is rejoining
    existing_player = session.get_player(player_id)
    
    if existing_player:
        # Player is rejoining
        print(f"Player {player_name} rejoined room {room_code}")
    else:
        # New player joining
        is_host = len(session.players) == 0
        new_player = Player(player_id, player_name, is_host=is_host)
        session.add_player(new_player)
        print(f"Player {player_name} joined room {room_code}")
    
    # Send updated player list to everyone in the room
    emit('room_update', {
        'players': [p.to_dict() for p in session.players],
        'currentQuestion': session.current_question,
        'hostId': session.host.id,
        'category': session.category
    }, to=room_code)
    
    # Notify others that a new player joined
    emit('player_joined', {
        'playerName': player_name,
        'playerId': player_id,
        'isHost': session.get_player(player_id).is_host
    }, to=room_code, include_self=False)

@socketio.on('leave_room')
def handle_leave_room(data):
    """Handle a player leaving a room"""
    room_code = data.get('roomCode')
    player_id = data.get('playerId')
    
    if not room_code or not player_id:
        emit('error', {'message': 'Invalid data provided'})
        return
    
    # Leave the Socket.IO room
    leave_room(room_code)
    
    # Get the game session
    session = active_sessions.get(room_code)
    
    if not session:
        return
    
    # Remove player from session
    player = session.get_player(player_id)
    if player:
        session.remove_player(player_id)
        
        # If all players have left, remove the room
        if not session.players:
            del active_sessions[room_code]
            print(f"Room {room_code} has been closed (no players left)")
            return
        
        # If the host left, assign a new host
        if player.is_host and session.players:
            new_host = session.players[0]
            new_host.is_host = True
            session.host = new_host
        
        # Send updated player list to everyone in the room
        emit('room_update', {
            'players': [p.to_dict() for p in session.players],
            'currentQuestion': session.current_question,
            'hostId': session.host.id if session.host else None,
            'category': session.category
        }, to=room_code)
        
        # Notify others that a player left
        emit('player_left', {
            'playerId': player_id,
            'playerName': player.name
        }, to=room_code)

@socketio.on('select_category')
def handle_select_category(data):
    """Handle category selection"""
    room_code = data.get('roomCode')
    player_id = data.get('playerId')
    category = data.get('category')
    
    if not room_code or not player_id or not category:
        emit('error', {'message': 'Invalid data provided'})
        return
    
    # Get the game session
    session = active_sessions.get(room_code)
    
    if not session:
        emit('error', {'message': 'Room not found'})
        return
    
    # Verify the player is in the room
    player = session.get_player(player_id)
    if not player:
        emit('error', {'message': 'Player not found in room'})
        return
    
    # Update the category
    session.set_category(category)
    
    # Get a new question based on the category
    session.next_question()
    
    # Notify all players of the category and question change
    emit('category_selected', {
        'category': category,
        'currentQuestion': session.current_question
    }, to=room_code)

@socketio.on('select_number')
def handle_select_number(data):
    """Handle a player selecting a number"""
    room_code = data.get('roomCode')
    player_id = data.get('playerId')
    number = data.get('number')
    
    if not room_code or not player_id or number is None:
        emit('error', {'message': 'Invalid data provided'})
        return
    
    # Get the game session
    session = active_sessions.get(room_code)
    
    if not session:
        emit('error', {'message': 'Room not found'})
        return
    
    # Verify the player is in the room
    player = session.get_player(player_id)
    if not player:
        emit('error', {'message': 'Player not found in room'})
        return
    
    # Update the player's answer
    player.answer = number
    
    # Notify all players of the answer
    emit('player_answered', {
        'playerId': player_id,
        'playerName': player.name,
        'answer': number
    }, to=room_code)

@socketio.on('next_turn')
def handle_next_turn(data):
    """Move to the next question (host only)"""
    room_code = data.get('roomCode')
    player_id = data.get('playerId')
    
    if not room_code or not player_id:
        emit('error', {'message': 'Invalid data provided'})
        return
    
    # Get the game session
    session = active_sessions.get(room_code)
    
    if not session:
        emit('error', {'message': 'Room not found'})
        return
    
    # Verify the player is the host
    player = session.get_player(player_id)
    if not player or not player.is_host:
        emit('error', {'message': 'Only the host can advance to the next turn'})
        return
    
    # Reset all players' answers
    for p in session.players:
        p.answer = None
    
    # Get the next question
    session.next_question()
    
    # Notify all players of the new question
    emit('new_question', {
        'question': session.current_question,
        'players': [p.to_dict() for p in session.players]
    }, to=room_code)

def generate_room_code():
    """Generate a unique 6-character room code"""
    while True:
        # Generate a code with uppercase letters and numbers (no confusing chars like O, 0, I, 1)
        chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        code = ''.join(chars[uuid.uuid4().int % len(chars)] for _ in range(6))
        
        # Check if the code is already in use
        if code not in active_sessions:
            return code

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'False').lower() == 'true')
