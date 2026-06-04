import React, { useMemo } from 'react';
import type { SimulationConfig } from '../types';

interface CrackingSimulatorProps {
  config: SimulationConfig;
}

// Format seconds into readable human time
const formatTime = (seconds: number): string => {
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hr`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} years`;
  if (seconds < 31536000 * 1000000) return `${Math.round(seconds / (31536000 * 1000))}k yrs`;
  return '> 1M years';
};

export const CrackingSimulator: React.FC<CrackingSimulatorProps> = ({ config }) => {
  const estimates = useMemo(() => {
    // Estimate Password Entropy (Assume 70 char alphabet for mix of upper/lower/num/sym)
    const length = Math.max(1, config.password.length);
    const combinations = Math.pow(70, length);

    // Hardcoded Hashrates (Hashes per second)
    // Basic Consumer GPU (e.g. RTX 4090)
    const basicMD5 = 100_000_000_000; // 100 GH/s
    const basicBcrypt = 100_000; // 100 kH/s
    
    // Enterprise GPU Array (e.g. 1000x scaling for raw compute)
    const enterpriseMD5 = 100_000_000_000_000; // 100 TH/s
    const enterpriseBcrypt = 100_000_000; // 100 MH/s

    // Argon2id Calculation
    // operations = memory columns * passes
    const operations = Math.max(1, config.memoryCost * config.timeCost);
    // Base rate for a simple setup. Scales inversely with cost.
    const argonBaseRate = 10_000_000 / operations; 
    
    // Memory bound limits scaling: compute scales 1000x, but memory bandwidth maybe only scales 50x 
    // due to bus limitations across nodes and shared RAM access compared to purely parallel compute.
    const basicArgon2 = argonBaseRate;
    const enterpriseArgon2 = argonBaseRate * 50; 

    return {
      combinations,
      basic: {
        md5: combinations / basicMD5,
        bcrypt: combinations / basicBcrypt,
        argon2: combinations / basicArgon2,
      },
      enterprise: {
        md5: combinations / enterpriseMD5,
        bcrypt: combinations / enterpriseBcrypt,
        argon2: combinations / enterpriseArgon2,
      }
    };
  }, [config]);

  return (
    <div className="bg-gray-950 border-t border-gray-800 p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.642 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.358-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
          </svg>
          Hardware Cracking Simulator
        </h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Time to brute-force <strong className="text-gray-300">"{config.password}"</strong> ({config.password.length} chars).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        {/* Basic GPU */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-3">
          <h4 className="text-xs font-bold text-gray-400 mb-2 border-b border-gray-800 pb-1">Consumer GPU (1x)</h4>
          <ul className="text-xs space-y-2">
            <li className="flex justify-between">
              <span className="text-gray-500">MD5:</span>
              <span className="text-red-400 font-mono">{formatTime(estimates.basic.md5)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Bcrypt:</span>
              <span className="text-yellow-400 font-mono">{formatTime(estimates.basic.bcrypt)}</span>
            </li>
            <li className="flex justify-between border-t border-gray-800 pt-2 mt-2">
              <span className="text-gray-300 font-semibold">Argon2:</span>
              <span className="text-emerald-400 font-mono font-bold">{formatTime(estimates.basic.argon2)}</span>
            </li>
          </ul>
        </div>

        {/* Enterprise Array */}
        <div className="bg-gray-900 border border-gray-800 rounded-md p-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full pointer-events-none"></div>
          <h4 className="text-xs font-bold text-red-400/80 mb-2 border-b border-gray-800 pb-1">Enterprise Array</h4>
          <ul className="text-xs space-y-2 relative z-10">
            <li className="flex justify-between">
              <span className="text-gray-500">MD5:</span>
              <span className="text-red-500 font-mono">{formatTime(estimates.enterprise.md5)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">Bcrypt:</span>
              <span className="text-yellow-500 font-mono">{formatTime(estimates.enterprise.bcrypt)}</span>
            </li>
            <li className="flex justify-between border-t border-gray-800 pt-2 mt-2">
              <span className="text-gray-300 font-semibold">Argon2:</span>
              <span className="text-emerald-500 font-mono font-bold">{formatTime(estimates.enterprise.argon2)}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-900/10 border border-blue-900/30 rounded-md p-4 mt-2">
        <h5 className="text-xs font-bold text-blue-400 mb-1">Why Argon2id stops ASICs & GPUs</h5>
        <p className="text-[11px] text-blue-200/70 leading-relaxed">
          Standard hashes like MD5 only rely on math (Compute Bound). A massive enterprise array can scale brute-forcing 10,000x by just adding more cores. 
          <br /><br />
          <strong>Argon2id is Memory Bound.</strong> It forces the attacker to continuously read/write large blocks of RAM. While an attacker can buy 10,000x more cores, they <i>cannot</i> easily buy 10,000x faster memory bandwidth. When cores wait on memory, their scaling advantage is crippled.
        </p>
      </div>
    </div>
  );
};