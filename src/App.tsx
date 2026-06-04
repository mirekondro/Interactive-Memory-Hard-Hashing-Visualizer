import React from 'react';
import { MatrixGrid } from './components/MatrixGrid';
import { useHashingSimulation } from './hooks/useHashingSimulation';
import { SimulationConfig } from './types';

const DEFAULT_CONFIG: SimulationConfig = {
  password: 'my_secure_password',
  salt: 'random_salt',
  memoryCost: 24, // Number of columns
  parallelism: 4,  // Number of lanes
  timeCost: 3,     // Number of passes
  playbackSpeed: 100,
};

function App() {
  const { grid, simState, start, pause, reset, step } = useHashingSimulation(DEFAULT_CONFIG);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-blue-500/30">
      <header className="p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Memory-Hard Hashing Visualizer
        </h1>
        <p className="mt-2 text-gray-400 text-sm max-w-2xl">
          Interactive exploration of algorithms like Argon2id. Watch how memory (columns), 
          parallelism (lanes), and iterations (passes) work together to protect passwords 
          from custom hardware attacks.
        </p>
      </header>

      <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 max-w-[1600px] mx-auto w-full">
        {/* Controls */}
        <section className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-900 p-1.5 rounded-lg border border-gray-800">
            <button 
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              onClick={start}
              disabled={simState.status === 'RUNNING'}
            >
              Start
            </button>
            <button 
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20"
              onClick={pause}
              disabled={simState.status !== 'RUNNING'}
            >
              Pause
            </button>
            <button 
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 rounded-md font-semibold text-white transition-colors"
              onClick={step}
            >
              Step
            </button>
            <button 
              className="px-5 py-2 bg-gray-800 hover:bg-red-500/20 hover:text-red-400 rounded-md font-semibold text-white transition-colors"
              onClick={reset}
            >
              Reset
            </button>
          </div>

          <div className="ml-auto flex items-center gap-6 text-sm bg-gray-900 px-6 py-3 rounded-lg border border-gray-800 shadow-inner">
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Status</span> 
              <span className="font-mono font-bold text-blue-400">{simState.status}</span>
            </div>
            <div className="w-px h-8 bg-gray-800"></div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pass</span> 
              <span className="font-mono font-bold text-emerald-400">{simState.currentPass} / {DEFAULT_CONFIG.timeCost}</span>
            </div>
          </div>
        </section>

        {/* Grid Visualization */}
        <section className="flex-1 w-full overflow-hidden flex flex-col items-center justify-center">
          <MatrixGrid grid={grid} />
        </section>

        {/* Legend */}
        <section className="mt-auto pt-6 border-t border-gray-800/50 text-sm text-gray-400 flex flex-wrap justify-center gap-8">
           <div className="flex items-center gap-3">
             <div className="w-5 h-5 bg-gray-800 border border-gray-700 rounded-sm"></div> 
             <span className="font-medium">Uninitialized Memory</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-5 h-5 bg-yellow-400 rounded-sm shadow-[0_0_10px_rgba(250,204,21,0.3)]"></div> 
             <span className="font-medium text-gray-300">Active Write</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-5 h-5 bg-blue-400 rounded-sm shadow-[0_0_10px_rgba(96,165,250,0.3)]"></div> 
             <span className="font-medium text-gray-300">Active Read (Reference)</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-5 h-5 bg-emerald-500 rounded-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div> 
             <span className="font-medium">Computed Block</span>
           </div>
        </section>
      </main>
    </div>
  );
}

export default App;