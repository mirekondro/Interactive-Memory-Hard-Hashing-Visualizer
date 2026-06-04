import React, { useState } from 'react';
import type { SimulationConfig } from '../types';

interface ServerLoadSimulatorProps {
  config: SimulationConfig;
}

// Simulated server hardware limits
const SERVER_CORES = 8;
const SERVER_RAM_MB = 16384; // 16 GB
// Base equivalent: in our visualizer, we can assume 1 "memoryCost" column roughly translates to 1 MiB for the sake of the OWASP preset comparison (19 cols ~ 19 MiB, 64 cols ~ 64 MiB)
const COL_TO_MB_FACTOR = 1; 

export const ServerLoadSimulator: React.FC<ServerLoadSimulatorProps> = ({ config }) => {
  const [concurrentRequests, setConcurrentRequests] = useState<number>(10);

  // Calculations
  const requestMemoryMB = config.memoryCost * COL_TO_MB_FACTOR;
  const totalMemoryRequiredMB = requestMemoryMB * concurrentRequests;
  const totalThreadsRequired = config.parallelism * concurrentRequests;

  const isOOM = totalMemoryRequiredMB > SERVER_RAM_MB;
  const isThreadStarved = totalThreadsRequired > SERVER_CORES;

  const memoryPercentage = Math.min((totalMemoryRequiredMB / SERVER_RAM_MB) * 100, 100);
  const threadPercentage = Math.min((totalThreadsRequired / SERVER_CORES) * 100, 100);

  const formatMB = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb} MB`;
  };

  return (
    <div className="bg-gray-950 border-t border-gray-800 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          Server Load Simulator
        </h3>
        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
          Simulate production traffic against an <strong>8-Core / 16GB RAM</strong> backend.
        </p>
      </div>

      <div className="space-y-2 mt-2">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-gray-400 uppercase">Concurrent Logins</label>
          <span className="text-xs font-mono text-purple-400 font-bold">{concurrentRequests} users</span>
        </div>
        <input 
          type="range" 
          min="1" max="100" step="1"
          value={concurrentRequests}
          onChange={(e) => setConcurrentRequests(Number(e.target.value))}
          className="w-full accent-purple-500 cursor-pointer"
        />
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {/* RAM Usage Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-3">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-400">RAM Exhaustion</span>
            <span className={`text-xs font-mono font-bold ${isOOM ? 'text-red-500' : 'text-emerald-400'}`}>
              {formatMB(totalMemoryRequiredMB)} / 16 GB
            </span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isOOM ? 'bg-red-500' : 'bg-emerald-500'}`} 
              style={{ width: `${memoryPercentage}%` }}
            ></div>
          </div>
          {isOOM && (
             <div className="mt-3 bg-red-900/20 border border-red-900/50 rounded p-2 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-red-400/90 leading-tight">
                  <strong>Out Of Memory (OOM) Crash Risk!</strong> Server will drop connections. Tune down Memory Cost or scale hardware.
                </span>
             </div>
          )}
        </div>

        {/* CPU Threads Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-3">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-bold text-gray-400">CPU Thread Bottleneck</span>
            <span className={`text-xs font-mono font-bold ${isThreadStarved ? 'text-amber-500' : 'text-emerald-400'}`}>
              {totalThreadsRequired} / 8 Cores
            </span>
          </div>
          <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isThreadStarved ? 'bg-amber-500' : 'bg-emerald-500'}`} 
              style={{ width: `${threadPercentage}%` }}
            ></div>
          </div>
          {isThreadStarved && (
             <div className="mt-3 bg-amber-900/20 border border-amber-900/50 rounded p-2 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-amber-400/90 leading-tight">
                  <strong>Thread Starvation Imminent!</strong> Authentication response latency will spike from 200ms to 4.5 seconds under load due to context switching.
                </span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};