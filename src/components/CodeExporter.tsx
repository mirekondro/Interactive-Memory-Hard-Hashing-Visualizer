import React, { useState } from 'react';
import type { SimulationConfig } from '../types';
import { ArgonMode } from '../types';

interface CodeExporterProps {
  config: SimulationConfig;
}

type Language = 'Node.js' | 'Python' | 'Go' | 'Rust' | 'Java';

export const CodeExporter: React.FC<CodeExporterProps> = ({ config }) => {
  const [activeTab, setActiveTab] = useState<Language>('Node.js');
  const [copied, setCopied] = useState(false);

  const getModeDetails = () => {
    switch (config.mode) {
      case ArgonMode.ARGON2I: return { node: 'argon2i', py: 'I', go: 'Key', rust: 'Argon2i' };
      case ArgonMode.ARGON2D: return { node: 'argon2d', py: 'D', go: 'Key', rust: 'Argon2d' };
      case ArgonMode.ARGON2ID: default: return { node: 'argon2id', py: 'ID', go: 'IDKey', rust: 'Argon2id' };
    }
  };

  const mode = getModeDetails();
  const memKiB = config.memoryCost * 1024; // Convert MB (Columns) to KiB

  const snippets: Record<Language, string> = {
    'Node.js': `import argon2 from 'argon2';

// npm install argon2
const hashPassword = async (plainTextPassword) => {
  try {
    const hash = await argon2.hash(plainTextPassword, {
      type: argon2.${mode.node},
      memoryCost: ${memKiB}, // ${config.memoryCost} MiB
      timeCost: ${config.timeCost},
      parallelism: ${config.parallelism}
    });
    console.log(hash);
    return hash;
  } catch (err) {
    console.error("Hashing failed", err);
  }
};`,

    'Python': `from argon2 import PasswordHasher, Type

# pip install argon2-cffi
ph = PasswordHasher(
    time_cost=${config.timeCost},
    memory_cost=${memKiB}, # ${config.memoryCost} MiB
    parallelism=${config.parallelism},
    type=Type.${mode.py}
)

hash = ph.hash("your_password")
print(hash)`,

    'Go': `package main

import (
	"fmt"
	"golang.org/x/crypto/argon2"
)

func main() {
	password := []byte("your_password")
	salt := []byte("random_salt") // In practice, generate cryptographically secure random salt
	
	// time, memory (KiB), threads, keyLen
	hash := argon2.${mode.go}(password, salt, ${config.timeCost}, ${memKiB}, ${config.parallelism}, 32)
	
	fmt.Printf("%x\\n", hash)
}`,

    'Rust': `use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, SaltString},
    Argon2, Params, Algorithm, Version
};

// cargo add argon2
fn main() {
    let params = Params::new(
        ${memKiB}, // m_cost in KiB (${config.memoryCost} MiB)
        ${config.timeCost}, // t_cost
        ${config.parallelism}, // p_cost
        Some(Params::DEFAULT_OUTPUT_LEN),
    ).unwrap();

    let argon2 = Argon2::new(Algorithm::${mode.rust}, Version::V0x13, params);
    let salt = SaltString::generate(&mut OsRng);
    
    let password_hash = argon2.hash_password(b"your_password", &salt).unwrap();
    println!("{}", password_hash);
}`,

    'Java': `import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;

public class HashExample {
    public static void main(String[] args) {
        // Note: Spring Security defaults to Argon2id under the hood.
        // Parameters: saltLength, hashLength, parallelism, memory (KiB), iterations
        Argon2PasswordEncoder encoder = new Argon2PasswordEncoder(
            16, 
            32, 
            ${config.parallelism}, 
            ${memKiB}, // ${config.memoryCost} MiB
            ${config.timeCost}
        );
        
        String hash = encoder.encode("your_password");
        System.out.println(hash);
    }
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-6 flex-shrink-0">
      <div className="max-w-[1200px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-200">Production Implementation</h3>
            <p className="text-xs text-gray-500 mt-1">
              Idiomatic code snippets dynamically updated with your current security parameters.
            </p>
          </div>
          
          <div className="flex bg-gray-950 p-1 rounded-lg border border-gray-800 overflow-x-auto scrollbar-thin">
            {(Object.keys(snippets) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setActiveTab(lang)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  activeTab === lang 
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-inner' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 border border-transparent'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <div className="absolute right-4 top-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-lg ${
                copied 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
              }`}
            >
              {copied ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                  </svg>
                  Copy Code
                </>
              )}
            </button>
          </div>
          
          <pre className="bg-[#0d1117] border border-gray-800 p-5 rounded-xl overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700">
            <code className="text-[13px] font-mono leading-relaxed text-gray-300">
              {snippets[activeTab]}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};