import React, { useState } from 'react';

const Lobby = ({ onStartAI, onStartLocal, onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');

  return (
    <div className="menu-container">
      <h1>Ultimate Tic-Tac-Toe</h1>
      <button onClick={() => onStartAI('heuristic')}>Play vs AI (Heuristic)</button>
      <button onClick={onStartLocal}>Local Multiplayer (Pass & Play)</button>
      <div style={{ borderTop: '1px solid #ffffff33', margin: '10px 0' }}></div>
      <button onClick={onCreateRoom}>Create Online Room</button>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Enter Room Code" 
          value={roomCode} 
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
        />
        <button onClick={() => onJoinRoom(roomCode)} disabled={!roomCode}>Join</button>
      </div>
    </div>
  );
};

export default Lobby;
