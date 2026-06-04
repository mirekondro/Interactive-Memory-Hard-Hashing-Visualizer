export enum CellState {
  UNINITIALIZED = 'UNINITIALIZED',
  WRITING = 'WRITING',
  READING = 'READING',
  COMPLETED = 'COMPLETED'
}

export interface MatrixCell {
  lane: number;
  col: number;
  state: CellState;
  value: string;
  referencePointer?: {
    lane: number;
    col: number;
  } | null;
}

export interface SimulationConfig {
  password: string;
  salt: string;
  memoryCost: number;
  parallelism: number;
  timeCost: number;
  playbackSpeed: number;
}

export enum SimulationStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}

export interface SimulationState {
  currentPass: number;
  currentLane: number;
  currentCol: number;
  activeReadingCoords?: {
    lane: number;
    col: number;
  } | null;
  status: SimulationStatus;
}