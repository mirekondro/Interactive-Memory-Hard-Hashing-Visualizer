import React from 'react';
import { MatrixCell } from '../types';
import { Cell } from './Cell';

interface MatrixGridProps {
  grid: MatrixCell[][];
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({ grid }) => {
  if (!grid || grid.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 overflow-x-auto p-6 bg-gray-900 rounded-xl shadow-2xl border border-gray-800">
      {grid.map((lane, laneIdx) => (
        <div key={`lane-${laneIdx}`} className="flex gap-2">
          {/* Lane Label */}
          <div className="flex items-center justify-end w-16 pr-4 text-gray-500 text-sm font-semibold tracking-wider">
            L{laneIdx}
          </div>
          {/* Cells */}
          <div className="flex gap-1.5">
            {lane.map((cell, colIdx) => (
              <Cell key={`cell-${laneIdx}-${colIdx}`} cell={cell} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};