/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import SavantPreloader from './components/SavantPreloader';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [showSite, setShowSite] = useState(false);

  const handlePreloadComplete = () => {
    // When the transition animation in the preloader finishes
    setShowSite(true);
  };

  return (
    <main className="relative w-full h-screen bg-[#050505] font-sans selection:bg-[#ffaa00]/30">
      <div className="noise-overlay" />
      
      {/* 3D Experience (contains both preloader and persistent logo) */}
      <SavantPreloader onComplete={handlePreloadComplete} />

      {/* Main Site Content Overlay */}
      <AnimatePresence>
        {showSite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="relative z-10 w-full h-full p-8 md:p-20 flex flex-col justify-center items-start pointer-events-none"
          >
            {/* Minimal Header with Logo space placeholder */}
            <header className="fixed top-0 left-0 w-full p-8 flex justify-between items-center z-20">
              <div className="w-12 h-12" id="logo-anchor">
                {/* The 3D logo is positioned relative to this in world space */}
              </div>
              <nav className="flex gap-12 cinematic-text text-[10px] tracking-[0.4em] text-white/50 pointer-events-auto">
                <motion.a 
                  href="#" 
                  className="relative group py-2"
                  whileHover={{ color: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Intelligence</span>
                  <motion.span 
                    className="absolute bottom-0 left-0 h-[1px] bg-[#ffaa00] w-0 group-hover:w-full transition-all duration-500 ease-out" 
                    layoutId="nav-underline"
                  />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="relative group py-2"
                  whileHover={{ color: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Systems</span>
                  <motion.span 
                    className="absolute bottom-0 left-0 h-[1px] bg-[#ffaa00] w-0 group-hover:w-full transition-all duration-500 ease-out" 
                    layoutId="nav-underline-systems"
                  />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="relative group py-2"
                  whileHover={{ color: "#ffffff" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Network</span>
                  <motion.span 
                    className="absolute bottom-0 left-0 h-[1px] bg-[#ffaa00] w-0 group-hover:w-full transition-all duration-500 ease-out" 
                    layoutId="nav-underline-network"
                  />
                </motion.a>
              </nav>
            </header>

            <section className="max-w-2xl">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.5 }}
                className="cinematic-text text-6xl md:text-8xl font-light tracking-tighter mb-4"
              >
                SAVANT
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.5 }}
                className="text-white/40 text-sm md:text-base leading-relaxed tracking-widest max-w-md"
              >
                FORGING THE FUTURE OF ARTIFICIAL INTELLIGENCE THROUGH CINEMATIC DESIGN AND QUANTUM RIGOR.
              </motion.p>
            </section>

            <footer className="fixed bottom-0 left-0 w-full p-8 flex justify-between items-end cinematic-text text-[8px] text-white/20">
              <div>© 2026 SAVANT INDUSTRIES</div>
              <div>REACTOR STATUS: OPTIMAL</div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
