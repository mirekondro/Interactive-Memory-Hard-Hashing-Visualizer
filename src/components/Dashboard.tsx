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

const PRESETS = {
  OWASP_MIN: { memoryCost: 19, timeCost: 2, parallelism: 1 },
  OWASP_HIGH: { memoryCost: 64, timeCost: 3, parallelism: 4 },
  RFC_9106: { memoryCost: 128, timeCost: 1, parallelism: 4 },
  WEAK: { memoryCost: 2, timeCost: 1, parallelism: 1 },
};

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

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetKey = e.target.value as keyof typeof PRESETS;
    if (PRESETS[presetKey]) {
      setConfig((prev) => ({
        ...prev,
        ...PRESETS[presetKey],
      }));
    }
  };

  const isRunning = simState.status === SimulationStatus.RUNNING;
  const isBelowStandard = config.memoryCost < 19 || config.timeCost < 2;

  // Determine current preset selection based on exact config match
  let currentPreset = 'CUSTOM';
  for (const [key, preset] of Object.entries(PRESETS)) {
    if (
      preset.memoryCost === config.memoryCost &&
      preset.timeCost === config.timeCost &&
      preset.parallelism === config.parallelism
    ) {
      currentPreset = key;
      break;
    }
  }

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

        {/* Presets and Sliders */}
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Industry Presets</label>
            <select
              value={currentPreset}
              onChange={handlePresetChange}
              className="w-full bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="CUSTOM">Custom Configuration</option>
              <option value="OWASP_MIN">OWASP Minimum Recommendation</option>
              <option value="OWASP_HIGH">OWASP High Security</option>
              <option value="RFC_9106">RFC 9106 Global Default (2 GiB equiv)</option>
              <option value="WEAK">Legacy / Weak Hashing</option>
            </select>
          </div>

          {isBelowStandard && (
            <div className="bg-amber-900/20 border border-amber-900/50 rounded-md p-3 flex items-start gap-2 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-[11px] text-amber-400/90 leading-tight font-medium">
                Below Industry Standard Baseline (Potential GPU Crack Vulnerability)
              </span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-400 uppercase">Memory Cost (Columns)</label>
              <span className="text-xs font-mono text-blue-400 font-bold">{config.memoryCost}</span>
            </div>
            <input 
              type="range" 
              name="memoryCost"
              min="2" max="128" step="1"
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