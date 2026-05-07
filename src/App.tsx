/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import SavantPreloader from './components/SavantPreloader';

export default function App() {
  const [showSite, setShowSite] = useState(false);

  const handlePreloadComplete = () => {
    setShowSite(true);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#030405]">
      <SavantPreloader onComplete={handlePreloadComplete} />

      <AnimatePresence>
        {showSite && (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(12px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="pointer-events-none relative z-10 flex h-full w-full flex-col items-start justify-center p-8 md:p-20"
          >
            <header className="fixed left-0 top-0 z-20 flex w-full items-center justify-between p-8">
              <div className="flex items-center gap-4">
                <img
                  src="/assets/logo-urge/savant-logo-favicon.svg"
                  alt="savant glyph"
                  className="h-10 w-10 opacity-90"
                />
                <span className="cinematic-text hidden text-[10px] tracking-[0.5em] text-white/50 md:block">
                  savant
                </span>
              </div>

              <nav className="cinematic-text pointer-events-auto flex gap-8 text-[10px] tracking-[0.3em] text-white/60">
                <a href="#" className="transition-colors hover:text-white">Intelligence</a>
                <a href="#" className="transition-colors hover:text-white">Systems</a>
                <a href="#" className="transition-colors hover:text-white">Network</a>
              </nav>
            </header>

            <section className="max-w-3xl">
              <motion.img
                src="/assets/logo-urge/savant-logo-wordmark-lockup.svg"
                alt="savant"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 1.2 }}
                className="mb-8 w-[min(680px,80vw)] opacity-95"
              />

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.65, duration: 1.3 }}
                className="max-w-xl text-sm leading-relaxed tracking-[0.24em] text-white/42 md:text-base"
              >
                HUMAN-IN-THE-LOOP INTELLIGENCE SYSTEMS WITH SKIN IN THE GAME.
              </motion.p>
            </section>

            <footer className="cinematic-text fixed bottom-0 left-0 flex w-full items-end justify-between p-8 text-[8px] text-white/20">
              <div>© 2026 SAVANT</div>
              <div>URGE STATUS: ITERATING</div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
