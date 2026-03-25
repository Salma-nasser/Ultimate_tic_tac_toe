import React from 'react';
import SmallBoard from './SmallBoard';

const Board = ({ 
  localBoards, 
  globalBoard, 
  activeBoardIndex, 
  onCellClick,
  currentPlayer 
}) => {
  return (
    <div className="global-board">
      {localBoards.map((board, idx) => (
        <SmallBoard
          key={idx}
          boardIndex={idx}
          cells={board}
          onClick={onCellClick}
          isActive={
            (activeBoardIndex === null || activeBoardIndex === -1) 
              ? globalBoard[idx] === null 
              : activeBoardIndex === idx
          }
          status={globalBoard[idx]}
          isValidTarget={
            (activeBoardIndex === null || activeBoardIndex === -1) 
              ? globalBoard[idx] === null 
              : activeBoardIndex === idx
          }
        />
      ))}
    </div>
  );
};

export default Board;
