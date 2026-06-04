import React from 'react';
import type { SimulationConfig, SimulationState } from '../types';
import { SimulationStatus } from '../types';
import { CrackingSimulator } from './CrackingSimulator';

interface DashboardProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  simState: SimulationState;
  play: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  config,
  setConfig,
  simState,
  play,
  pause,
  step,
  reset
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === 'range' ? Number(value) : value,
    }));
  };

  const isRunning = simState.status === SimulationStatus.RUNNING;

  return (
    <aside className="w-full lg:w-[380px] flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-white tracking-wide">Controls</h2>
        <p className="text-xs text-gray-400 mt-1">Configure hashing parameters</p>
      </div>

      <div className="p-6 flex flex-col gap-6 flex-1">
        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Password</label>
            <input 
              type="text" 
              name="password"
              value={config.password}
              onChange={handleInputChange}
              className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Salt</label>
            <input 
              type="text" 
              name="salt"
              value={config.salt}
              onChange={handleInputChange}
              className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Sliders */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Memory Cost (Columns)</label>
              <span className="text-xs font-mono text-blue-400 font-bold">{config.memoryCost}</span>
            </div>
            <input 
              type="range" 
              name="memoryCost"
              min="8" max="128" step="1"
              value={config.memoryCost}
              onChange={handleInputChange}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Parallelism (Lanes)</label>
              <span className="text-xs font-mono text-blue-400 font-bold">{config.parallelism}</span>
            </div>
            <input 
              type="range" 
              name="parallelism"
              min="1" max="16" step="1"
              value={config.parallelism}
              onChange={handleInputChange}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Time Cost (Passes)</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">{config.timeCost}</span>
            </div>
            <input 
              type="range" 
              name="timeCost"
              min="1" max="10" step="1"
              value={config.timeCost}
              onChange={handleInputChange}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Playback Speed (ms)</label>
              <span className="text-xs font-mono text-yellow-400 font-bold">{config.playbackSpeed}ms</span>
            </div>
            <input 
              type="range" 
              name="playbackSpeed"
              min="10" max="1000" step="10"
              value={config.playbackSpeed}
              onChange={handleInputChange}
              className="w-full accent-yellow-500 cursor-pointer flex-row-reverse"
              style={{ direction: 'rtl' }}
            />
          </div>
        </div>

        <hr className="border-gray-800 mt-2" />

        {/* Playback Controls */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button 
            onClick={play}
            disabled={isRunning || simState.status === SimulationStatus.FINISHED}
            className="flex items-center justify-center py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md font-bold text-sm transition-all shadow-lg shadow-blue-500/10"
          >
            Play
          </button>
          <button 
            onClick={pause}
            disabled={!isRunning}
            className="flex items-center justify-center py-2.5 bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md font-bold text-sm transition-all shadow-lg shadow-yellow-500/10"
          >
            Pause
          </button>
          <button 
            onClick={step}
            disabled={isRunning || simState.status === SimulationStatus.FINISHED}
            className="flex items-center justify-center py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md font-bold text-sm transition-all"
          >
            Step
          </button>
          <button 
            onClick={reset}
            className="flex items-center justify-center py-2.5 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-white rounded-md font-bold text-sm transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Real-time Status Readout */}
      <div className="p-6 bg-gray-950 border-t border-gray-800">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Live Status</h3>
        <div className="font-mono text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">State:</span>
            <span className={`font-bold ${isRunning ? 'text-blue-400' : simState.status === SimulationStatus.FINISHED ? 'text-emerald-400' : 'text-yellow-500'}`}>
              {simState.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Progress:</span>
            <span className="text-emerald-400">Pass {simState.currentPass + 1}/{config.timeCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Location:</span>
            <span className="text-gray-200">Lane {simState.currentLane} | Col {simState.currentCol}</span>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
            {simState.status === SimulationStatus.FINISHED ? (
              <span className="text-emerald-500">Hash computed successfully.</span>
            ) : isRunning ? (
              <span className="text-blue-400 animate-pulse">Computing memory block...</span>
            ) : (
              <span>Ready. Adjust parameters or hit play.</span>
            )}
          </div>
        </div>
      </div>

      <CrackingSimulator config={config} />
    </aside>
  );
};