import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  SimulationStatus, 
  CellState 
} from '../types';
import type {
  MatrixCell, 
  SimulationConfig, 
  SimulationState
} from '../types';

const createInitialState = (config: SimulationConfig) => {
  const grid: MatrixCell[][] = [];
  for (let lane = 0; lane < config.parallelism; lane++) {
    const row: MatrixCell[] = [];
    for (let col = 0; col < config.memoryCost; col++) {
      const isSeed = col < 2; // First two columns represent initial H_0 seeding phase
      row.push({
        lane,
        col,
        state: isSeed ? CellState.COMPLETED : CellState.UNINITIALIZED,
        value: isSeed ? 'H0' : '',
      });
    }
    grid.push(row);
  }
  return {
    grid,
    simState: {
      currentPass: 0,
      currentLane: 0,
      currentCol: 2, // Start block calculation after the seed columns
      status: SimulationStatus.IDLE,
    }
  };
};

export const useArgonEngine = (config: SimulationConfig) => {
  const [engine, setEngine] = useState(() => createInitialState(config));
  const timerRef = useRef<number | null>(null);

  const initializeSimulation = useCallback(() => {
    setEngine(createInitialState(config));
  }, [config]);

  // If config changes, re-initialize
  useEffect(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  const stepForward = useCallback(() => {
    setEngine(prev => {
      const { grid: prevGrid, simState: prevSim } = prev;
      
      // Stop if finished
      if (prevSim.status === SimulationStatus.FINISHED) return prev;

      const { currentPass, currentLane, currentCol } = prevSim;
      
      // 1. Calculate Reference Block Coordinates
      // For Argon2id, it's a mix of data-independent (Argon2i) for early passes
      // and data-dependent (Argon2d) for later. We simulate a pseudo-random pick here.
      const pseudoRandomSeed = currentPass * 10000 + currentLane * 100 + currentCol;
      let refLane = (pseudoRandomSeed * 17) % config.parallelism;
      let refCol = 0;

      if (currentPass === 0) {
        // Can only read from previously computed columns in the current pass
        refCol = pseudoRandomSeed % Math.max(1, currentCol);
      } else {
        // Can read from anywhere in memory
        refCol = pseudoRandomSeed % config.memoryCost;
        // Avoid self-reference
        if (refCol === currentCol && refLane === currentLane) {
          refCol = (refCol + 1) % config.memoryCost;
        }
      }

      // 2. Compute Next State Coordinates
      let nextLane = currentLane + 1;
      let nextCol = currentCol;
      let nextPass = currentPass;
      let nextStatus = prevSim.status;

      if (nextLane >= config.parallelism) {
        nextLane = 0;
        nextCol++;
      }

      if (nextCol >= config.memoryCost) {
        nextCol = 0;
        nextPass++;
        if (nextPass >= config.timeCost) {
          nextStatus = SimulationStatus.FINISHED;
        }
      }

      // Skip seeds on new passes if we are strictly wrapping back (Argon2 normally computes all)
      // but for simplicity let's assume pass 0 skips seed columns, pass > 0 computes all.
      if (nextPass === 0 && nextCol < 2) {
        nextCol = 2;
      }

      // 3. Update Grid
      const newGrid = prevGrid.map(row => [...row]); // shallow copy rows

      // Clear previous READ/WRITE flags
      for (let r = 0; r < newGrid.length; r++) {
        for (let c = 0; c < newGrid[r].length; c++) {
          if (newGrid[r][c].state === CellState.READING || newGrid[r][c].state === CellState.WRITING) {
             newGrid[r][c] = { ...newGrid[r][c], state: CellState.COMPLETED, referencePointer: null };
          }
        }
      }

      // Mark new READ block
      newGrid[refLane][refCol] = { ...newGrid[refLane][refCol], state: CellState.READING };
      
      // Mark new WRITE block
      newGrid[currentLane][currentCol] = { 
        ...newGrid[currentLane][currentCol], 
        state: CellState.WRITING, 
        value: `B`, // Block identifier or hash mockup
        referencePointer: { lane: refLane, col: refCol }
      };

      return {
        grid: newGrid,
        simState: {
          ...prevSim,
          currentPass: nextPass,
          currentLane: nextLane,
          currentCol: nextCol,
          activeReadingCoords: { lane: refLane, col: refCol },
          status: nextStatus,
        }
      };
    });
  }, [config]);

  const play = useCallback(() => {
    setEngine(prev => ({
      ...prev,
      simState: { 
        ...prev.simState, 
        status: prev.simState.status === SimulationStatus.FINISHED 
                ? SimulationStatus.FINISHED 
                : SimulationStatus.RUNNING 
      }
    }));
  }, []);

  const pause = useCallback(() => {
    setEngine(prev => ({
      ...prev,
      simState: { ...prev.simState, status: SimulationStatus.PAUSED }
    }));
  }, []);

  const reset = useCallback(() => {
    initializeSimulation();
  }, [initializeSimulation]);

  const step = useCallback(() => {
    setEngine(prev => ({
      ...prev,
      simState: { 
        ...prev.simState, 
        status: prev.simState.status !== SimulationStatus.FINISHED 
                ? SimulationStatus.PAUSED 
                : prev.simState.status 
      }
    }));
    stepForward();
  }, [stepForward]);

  useEffect(() => {
    if (engine.simState.status === SimulationStatus.RUNNING) {
      timerRef.current = window.setInterval(() => {
        stepForward();
      }, config.playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [engine.simState.status, stepForward, config.playbackSpeed]);

  return { 
    grid: engine.grid, 
    simState: engine.simState, 
    play, 
    pause, 
    reset, 
    step 
  };
};