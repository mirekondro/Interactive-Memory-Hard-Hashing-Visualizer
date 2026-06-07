# Interactive Memory-Hard Hashing Visualizer

![Memory-Hard Hashing Visualizer UI](https://img.shields.io/badge/Security-Argon2id-0d9488?style=flat-square&logo=security)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)

An educational, high-performance web application designed to visually explain how **memory-hard hashing algorithms** (specifically modeling Argon2id) protect user passwords against brute-force attacks from massive ASIC and GPU arrays.

Have you ever wondered what "Time Cost," "Memory Cost," or "Parallelism" actually do under the hood when you configure your authentication backend? This visualizer takes the abstract math and renders it as an interactive, physical canvas.

## 🎯 The Purpose

Legacy hashing algorithms like **MD5** or **SHA-256** are compute-bound. An attacker with a massive budget can simply buy 10,000 GPUs and crack passwords 10,000 times faster. 

Modern algorithms like **Argon2id** (the winner of the Password Hashing Competition) are **memory-bound**. They force the hardware to continuously read and write large blocks of RAM. While an attacker can easily buy 10,000 parallel processing cores, they *cannot* easily buy 10,000 times more memory bandwidth. When GPU cores are forced to wait in line to read RAM, their scaling advantage is completely crippled.

This tool aims to educate software engineers on these constraints by letting them "play the attacker and the defender."

## ✨ Interactive Features

* **High-Performance Canvas Matrix:** Watch a pulsing, real-time laser arc physically trace the algorithm's execution as it hops back and forth referencing historical memory blocks (simulating Argon2id's chaotic, data-dependent memory accesses).
* **Algorithmic Mode Toggle:** Instantly switch the mathematical behavior of the engine between:
  * `Argon2i`: Predictable, geometric memory access (prevents side-channel timing attacks).
  * `Argon2d`: Chaotic, purely random memory access (maximizes GPU/ASIC resistance).
  * `Argon2id`: A hybrid of both (the modern industry standard).
* **Industry Standard Presets:** Not sure what parameters to pick? One-click load configurations recommended by OWASP and RFC 9106, complete with validation alerts if your settings drop below safe thresholds.
* **Attacker Hardware Cracking Simulator:** Mathematically estimates the time required to brute-force your current password configuration, comparing the time to crack MD5 vs. Argon2id on both Consumer GPUs and State-Sponsored Enterprise Arrays.
* **Server Load Simulator:** See the backend consequences of your security choices. Increase "Concurrent Logins" to see when your chosen memory/time costs will trigger Out-Of-Memory (OOM) crashes or CPU thread starvation on a standard 8-Core/16GB production server.
* **Code Exporter:** A dynamic tabbed interface that instantly translates your UI slider choices into production-ready, idiomatic code snippets for **Node.js, Python, Go, Rust,** and **Java**.

## 🚀 Getting Started

This application is built with React, TypeScript, and Vite, utilizing an HTML5 Canvas for high-performance visual rendering.

### Prerequisites
* Node.js (v18+ recommended)
* npm

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/mirekondro/Interactive-Memory-Hard-Hashing-Visualizer.git
   cd Interactive-Memory-Hard-Hashing-Visualizer
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open your browser and navigate to \`http://localhost:5173\` (or the port specified in your terminal).

## 🛠 Tech Stack

* **Core:** React 19, TypeScript
* **Build Tool:** Vite (with Oxc transform)
* **Styling:** Tailwind CSS (Dark Mode aesthetic)
* **Rendering:** HTML5 Canvas API

## 📝 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.