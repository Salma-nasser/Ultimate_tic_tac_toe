import React from 'react';
import Cell from './Cell';

const SmallBoard = ({ 
  boardIndex, 
  cells, 
  onClick, 
  isActive, 
  status, // 'X', 'O', 'D' (Draw), or null (Active)
  isValidTarget 
}) => {
  return (
    <div className={`small-board ${isActive ? 'active' : ''} ${status ? `won-${status.toLowerCase()}` : ''}`}>
      {cells.map((val, idx) => (
        <Cell 
          key={idx} 
          value={val} 
          onClick={() => onClick(boardIndex, idx)}
          disabled={status !== null || !isActive}
        />
      ))}
      {status && (
        <div className="small-board-overlay">
          <span className={status.toLowerCase()}>{status === 'D' ? '-' : status}</span>
        </div>
      )}
    </div>
  );
};

export default SmallBoard;
