import React, { useState } from 'react';
import { VisualizerMatrix } from './components/VisualizerMatrix';
import { Dashboard } from './components/Dashboard';
import { CodeExporter } from './components/CodeExporter';
import { useArgonEngine } from './hooks/useArgonEngine';
import { ArgonMode } from './types';
import type { SimulationConfig } from './types';

const INITIAL_CONFIG: SimulationConfig = {
  password: 'my_secure_password',
  salt: 'random_salt',
  memoryCost: 24,
  parallelism: 4,
  timeCost: 3,
  playbackSpeed: 100,
  mode: ArgonMode.ARGON2ID,
};

function App() {
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const { grid, simState, play, pause, reset, step } = useArgonEngine(config);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans selection:bg-blue-500/30 overflow-hidden h-screen">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800 bg-gray-900 z-10 flex-shrink-0">
        <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Memory-Hard Hashing Visualizer
        </h1>
        <p className="mt-1 text-gray-400 text-xs max-w-3xl">
          Interactive exploration of algorithms like Argon2id. Watch how memory (columns), 
          parallelism (lanes), and iterations (passes) work together to protect passwords.
        </p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Dashboard */}
        <Dashboard 
          config={config} 
          setConfig={setConfig} 
          simState={simState}
          play={play}
          pause={pause}
          step={step}
          reset={reset}
        />

        {/* Visualizer Canvas Area */}
        <section className="flex-1 flex flex-col overflow-y-auto relative bg-gray-950 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="flex-1 p-6 flex flex-col min-h-[500px]">
            <VisualizerMatrix grid={grid} simState={simState} />
          </div>

          {/* Legend */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-800/50 bg-gray-900/50 text-xs text-gray-400 flex flex-wrap justify-center gap-6 shadow-inner z-10">
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-[#1f2937] border border-[#374151] rounded-sm"></div> 
               <span className="font-medium">Uninitialized Memory</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-[#f59e0b] rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div> 
               <span className="font-medium text-gray-300">Active Write</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-[#991b1b] rounded-sm shadow-[0_0_8px_rgba(220,38,38,0.5)] border border-[#ef4444]"></div> 
               <span className="font-medium text-gray-300">Historical Read</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-4 h-4 bg-[#0d9488] rounded-sm shadow-[0_0_8px_rgba(20,184,166,0.2)]"></div> 
               <span className="font-medium">Computed Block</span>
             </div>
          </div>

          <CodeExporter config={config} />
        </section>
      </main>
    </div>
  );
}

export default App;