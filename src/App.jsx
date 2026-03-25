import React, { useState, useEffect, useReducer } from 'react';
import { io } from 'socket.io-client';
import Board from './components/Board';
import Lobby from './components/Lobby';
import { INITIAL_STATE, makeMove, checkWin, getHeuristicMove, isValidMove } from './utils/gameLogic';
import './App.css';

const socket = io('https://172.28.178.141:3000', {
  rejectUnauthorized: false // Needed for self-signed certs in dev
});

function App() {
  const [view, setView] = useState('lobby'); // 'lobby', 'game'
  const [mode, setMode] = useState('local'); // 'local', 'ai', 'online'
  const [gameState, setGameState] = useState(INITIAL_STATE);
  const [roomCode, setRoomCode] = useState('');
  const [mySymbol, setMySymbol] = useState(null); // 'X' or 'O' for online
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('roomCreated', (code) => {
      setRoomCode(code);
      setMySymbol('X');
      setStatusMsg(`Room Code: ${code}. Waiting for opponent...`);
      setView('game');
    });

    socket.on('gameStart', ({ symbol }) => {
      if (symbol) setMySymbol(symbol); // Only if joining
      setStatusMsg('Game Started!');
      setGameState(INITIAL_STATE);
      setView('game');
    });

    socket.on('receiveMove', ({ boardIdx, cellIdx }) => {
      setGameState(prevState => {
        if (!isValidMove(prevState, boardIdx, cellIdx)) return prevState;
        const newState = makeMove(prevState, boardIdx, cellIdx);
        
        // Side effect: update status message
        // We can't do this inside the reducer, so we rely on another effect or do it here?
        // Doing it here is technically a side effect during render phase of the reducer? No.
        // The updater function runs during the state transition.
        // It's better to use a useEffect that watches gameState to update the message.
        return newState;
      });
    });

    socket.on('playerLeft', () => {
      setStatusMsg('Opponent disconnected.');
      setMode('local'); // Fallback or exit
    });

    return () => {
      socket.off('connect');
      socket.off('roomCreated');
      socket.off('gameStart');
      socket.off('receiveMove');
      socket.off('playerLeft');
    };
  }, [mySymbol]);

  // Update status message when game state changes
  useEffect(() => {
    if (gameState.winner) {
      setStatusMsg(gameState.winner === 'D' ? 'Game Over: Draw!' : `Winner: ${gameState.winner}!`);
    } else if (mode === 'online') {
      setStatusMsg(gameState.currentPlayer === mySymbol ? 'Your Turn' : "Opponent's Turn");
    } else if (mode === 'ai') {
       setStatusMsg(gameState.currentPlayer === 'X' ? 'Your Turn' : "AI is thinking...");
    } else {
      setStatusMsg(`Current Player: ${gameState.currentPlayer}`);
    }
  }, [gameState, mode, mySymbol]);

  // AI Logic
  useEffect(() => {
    if (mode === 'ai' && gameState.currentPlayer === 'O' && !gameState.winner) {
      const timer = setTimeout(() => {
        const move = getHeuristicMove(gameState);
        if (move) {
          // AI makes move locally
          // We need to call setGameState directly because handleMove has guard clauses
          // But handleMove is cleaner.
          // Wait, handleMove calls setGameState.
          // But handleMove is not in dependency array.
          // Let's call a simplified move function or just use handleMove if safe.
          // handleMove checks mode.
          handleMove(move.b, move.c);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, mode]); // removed handleMove from deps to avoid infinite loop if handleMove isn't memoized.
                         // But handleMove changes on every render?
                         // I should memoize handleMove or move logic inside effect.
  
  const handleMove = (boardIdx, cellIdx) => {
    if (gameState.winner) return;

    // Online check
    if (mode === 'online') {
      if (gameState.currentPlayer !== mySymbol) return;
      if (!isValidMove(gameState, boardIdx, cellIdx)) return;
      socket.emit('makeMove', { roomCode, boardIdx, cellIdx });
      // Optimistic update?
      // No, wait for receiveMove to avoid desync
      return; 
    }

    // Local/AI check
    if (!isValidMove(gameState, boardIdx, cellIdx)) return;

    const newState = makeMove(gameState, boardIdx, cellIdx);
    setGameState(newState);
  };

  const startAI = () => {
    setMode('ai');
    setGameState(INITIAL_STATE);
    setView('game');
    setStatusMsg('You vs AI');
  };

  const startLocal = () => {
    setMode('local');
    setGameState(INITIAL_STATE);
    setView('game');
    setStatusMsg('Local Multiplayer');
  };

  const createRoom = () => {
    setMode('online');
    socket.emit('createRoom');
  };

  const joinRoom = (code) => {
    setMode('online');
    setRoomCode(code);
    socket.emit('joinRoom', code);
  };

  const resetGame = () => {
    if (mode === 'online') return; // Cannot reset online game easily yet
    setGameState(INITIAL_STATE);
    setStatusMsg(mode === 'ai' ? 'You vs AI' : 'Local Multiplayer');
  };

  return (
    <div className="game-container">
      {view === 'lobby' && (
        <Lobby 
          onStartAI={startAI}
          onStartLocal={startLocal}
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
      )}

      {view === 'game' && (
        <>
          <div className="status-panel">
            {mode === 'online' && <div style={{fontSize: '0.8em', opacity: 0.7}}>Room: {roomCode}</div>}
            <div className={gameState.currentPlayer === 'X' ? 'player-x' : 'player-o'}>
              {statusMsg || `Current Player: ${gameState.currentPlayer}`}
            </div>
            {gameState.winner && (
              <div className="winner-banner">
                {gameState.winner === 'D' ? 'DRAW!' : `${gameState.winner} WINS!`}
              </div>
            )}
          </div>

          <Board 
            localBoards={gameState.localBoards}
            globalBoard={gameState.globalBoard}
            activeBoardIndex={gameState.activeBoardIndex}
            onCellClick={handleMove}
            currentPlayer={gameState.currentPlayer}
          />

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            {mode !== 'online' && (
              <button onClick={resetGame}>Restart Game</button>
            )}
            <button onClick={() => setView('lobby')}>Back to Menu</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
