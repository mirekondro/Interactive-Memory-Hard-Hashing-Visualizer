import { useState, useCallback, useEffect } from 'react';
import { 
  MatrixCell, 
  SimulationConfig, 
  SimulationState, 
  SimulationStatus, 
  CellState 
} from '../types';

export const useHashingSimulation = (config: SimulationConfig) => {
  const [grid, setGrid] = useState<MatrixCell[][]>([]);
  const [simState, setSimState] = useState<SimulationState>({
    currentPass: 0,
    currentLane: 0,
    currentCol: 0,
    status: SimulationStatus.IDLE,
  });

  const initializeGrid = useCallback(() => {
    const newGrid: MatrixCell[][] = [];
    for (let lane = 0; lane < config.parallelism; lane++) {
      const row: MatrixCell[] = [];
      for (let col = 0; col < config.memoryCost; col++) {
        row.push({
          lane,
          col,
          state: CellState.UNINITIALIZED,
          value: '',
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setSimState({
      currentPass: 0,
      currentLane: 0,
      currentCol: 0,
      status: SimulationStatus.IDLE,
    });
  }, [config]);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  const start = () => setSimState(s => ({ ...s, status: SimulationStatus.RUNNING }));
  const pause = () => setSimState(s => ({ ...s, status: SimulationStatus.PAUSED }));
  const reset = () => initializeGrid();
  const step = () => { 
    // TODO: implement single step logic
  };

  return { grid, simState, start, pause, reset, step };
};