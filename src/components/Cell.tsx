import React from 'react';
import { MatrixCell, CellState } from '../types';

interface CellProps {
  cell: MatrixCell;
}

export const Cell: React.FC<CellProps> = ({ cell }) => {
  const getBackgroundColor = () => {
    switch (cell.state) {
      case CellState.UNINITIALIZED: return 'bg-gray-800';
      case CellState.WRITING: return 'bg-yellow-400 text-gray-900';
      case CellState.READING: return 'bg-blue-400 text-gray-900';
      case CellState.COMPLETED: return 'bg-emerald-500 text-gray-900';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div 
      className={`w-8 h-8 md:w-10 md:h-10 border border-gray-700 flex items-center justify-center text-xs font-mono transition-colors duration-200 ${getBackgroundColor()}`}
      title={`Lane: ${cell.lane}, Col: ${cell.col}`}
    >
      {cell.value || '\u00A0'}
    </div>
  );
};