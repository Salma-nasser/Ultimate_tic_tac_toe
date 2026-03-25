// Winning combinations indices
const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

export const INITIAL_STATE = {
  globalBoard: Array(9).fill(null), // null, 'X', 'O', 'D' (Draw)
  localBoards: Array(9).fill(null).map(() => Array(9).fill(null)),
  currentPlayer: 'X',
  activeBoardIndex: null, // null means play anywhere (start or free move)
  winner: null,
  scores: { X: 0, O: 0 }
};

export function checkWin(board) {
  for (let combo of WIN_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== null)) return 'D';
  return null;
}

export function isValidMove(state, boardIdx, cellIdx) {
  if (state.winner) return false;
  if (state.globalBoard[boardIdx] !== null) return false; // Board already won/drawn
  if (state.localBoards[boardIdx][cellIdx] !== null) return false; // Cell taken
  
  // If activeBoardIndex is null (or -1), any open board is valid
  // But we usually restrict to non-won boards unless ALL are won (game over)
  if (state.activeBoardIndex === null || state.activeBoardIndex === -1) {
    return state.globalBoard[boardIdx] === null;
  }
  
  return boardIdx === state.activeBoardIndex;
}

export function makeMove(state, boardIdx, cellIdx) {
  if (!isValidMove(state, boardIdx, cellIdx)) return state;

  const newLocalBoards = state.localBoards.map(b => [...b]);
  newLocalBoards[boardIdx][cellIdx] = state.currentPlayer;

  const newGlobalBoard = [...state.globalBoard];
  // Check if this local board is won
  const localWin = checkWin(newLocalBoards[boardIdx]);
  if (localWin) {
    newGlobalBoard[boardIdx] = localWin;
  }

  // Determine next active board
  // Rule: Next player must play in board corresponding to cellIdx
  // Unless that board is full or won, then play anywhere
  let nextActiveBoard = cellIdx;
  if (newGlobalBoard[nextActiveBoard] !== null) {
    nextActiveBoard = null; // Free move
  } else {
    // Check if the target board is full (draw) but not marked as 'D' yet?
    // checkWin handles 'D' if full.
    // So if newGlobalBoard[nextActiveBoard] is null, it's playable.
  }

  // Check global win
  const globalWinner = checkWin(newGlobalBoard);

  return {
    ...state,
    localBoards: newLocalBoards,
    globalBoard: newGlobalBoard,
    currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
    activeBoardIndex: nextActiveBoard,
    winner: globalWinner,
  };
}

export function getHeuristicMove(state) {
  const validMoves = [];
  // Find all valid moves
  for (let b = 0; b < 9; b++) {
    for (let c = 0; c < 9; c++) {
      if (isValidMove(state, b, c)) {
        validMoves.push({ b, c });
      }
    }
  }

  if (validMoves.length === 0) return null;

  // Simple Heuristic:
  // 1. Win a local board
  // 2. Block opponent from winning a local board
  // 3. Pick random
  
  // Try to win
  for (let move of validMoves) {
    const nextState = makeMove(state, move.b, move.c);
    if (nextState.globalBoard[move.b] === state.currentPlayer) return move;
  }

  // Try to block (simulate opponent move)
  const opponent = state.currentPlayer === 'X' ? 'O' : 'X';
  for (let move of validMoves) {
    // Check if opponent would win this board if they played here
    // Clone board to check
    const tempBoard = [...state.localBoards[move.b]];
    tempBoard[move.c] = opponent;
    if (checkWin(tempBoard) === opponent) return move;
  }

  // Avoid sending opponent to a free move (unless necessary)
  const safeMoves = validMoves.filter(m => {
    const targetBoardStatus = state.globalBoard[m.c];
    return targetBoardStatus === null; // Target board is playable, so they are constrained
  });

  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}
