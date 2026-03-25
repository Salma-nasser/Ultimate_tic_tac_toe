import React from 'react';

const Cell = ({ value, onClick, disabled, isHighlight }) => {
  return (
    <div 
      className={`cell ${value ? value.toLowerCase() : ''} ${disabled ? 'disabled' : ''} ${isHighlight ? 'highlight' : ''}`}
      onClick={!disabled ? onClick : undefined}
    >
      {value}
    </div>
  );
};

export default Cell;
