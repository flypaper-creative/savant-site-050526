import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene, OverlayMode } from './components/Scene';
import { Shield, Target, Crosshair, Activity, Radar, Lock, Wifi, Battery, Radio, Zap, Globe, Cpu, Hexagon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Procedural Audio Hook (Web Audio API)
 */
let sharedAudioCtx: AudioContext | null = null;

function useSciFiSound() {
  const init = () => {
    if (!sharedAudioCtx) {
        sharedAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume();
    }
  };

  const playBlip = (freq = 800, type: OscillatorType = 'sine', duration = 0.1, volume = 0.05) => {
    init();
    if (!sharedAudioCtx) return;
    const osc = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    const filter = sharedAudioCtx.createBiquadFilter();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, sharedAudioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq / 3, sharedAudioCtx.currentTime + duration);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 2, sharedAudioCtx.currentTime);
    
    gain.gain.setValueAtTime(volume, sharedAudioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + duration);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    
    osc.start();
    osc.stop(sharedAudioCtx.currentTime + duration);
  };

  const playWhoosh = (duration = 1.5, volume = 0.03) => {
    init();
    if (!sharedAudioCtx) return;
    const bufferSize = sharedAudioCtx.sampleRate * duration;
    const buffer = sharedAudioCtx.createBuffer(1, bufferSize, sharedAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = sharedAudioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = sharedAudioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(5, sharedAudioCtx.currentTime);
    filter.frequency.setValueAtTime(100, sharedAudioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, sharedAudioCtx.currentTime + duration / 2);
    filter.frequency.exponentialRampToValueAtTime(100, sharedAudioCtx.currentTime + duration);
    
    const gain = sharedAudioCtx.createGain();
    gain.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, sharedAudioCtx.currentTime + duration / 2);
    gain.gain.linearRampToValueAtTime(0, sharedAudioCtx.currentTime + duration);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    
    noise.start();
  };

  const playPulse = (freq = 60, duration = 0.5) => {
      init();
      if (!sharedAudioCtx) return;
      const osc = sharedAudioCtx.createOscillator();
      const gain = sharedAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, sharedAudioCtx.currentTime);
      gain.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, sharedAudioCtx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, sharedAudioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(sharedAudioCtx.destination);
      osc.start();
      osc.stop(sharedAudioCtx.currentTime + duration);
  };

  const playHum = () => {
    init();
    if (!sharedAudioCtx) return;
    
    const mainHum = sharedAudioCtx.createOscillator();
    const subHum = sharedAudioCtx.createOscillator();
    const gain = sharedAudioCtx.createGain();
    const filter = sharedAudioCtx.createBiquadFilter();
    
    mainHum.type = 'sine';
    mainHum.frequency.setValueAtTime(40, sharedAudioCtx.currentTime);
    
    subHum.type = 'triangle';
    subHum.frequency.setValueAtTime(25, sharedAudioCtx.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, sharedAudioCtx.currentTime);
    
    gain.gain.setValueAtTime(0.03, sharedAudioCtx.currentTime);
    
    mainHum.connect(filter);
    subHum.connect(filter);
    filter.connect(gain);
    gain.connect(sharedAudioCtx.destination);
    
    mainHum.start();
    subHum.start();
    
    return () => {
        try {
          mainHum.stop();
          subHum.stop();
          mainHum.disconnect();
          subHum.disconnect();
        } catch (e) {}
    };
  };

  return { playBlip, playHum, playWhoosh, playPulse };
}

function CockpitConsole({ 
    activeMode, 
    onModeChange, 
    onMovement,
    cinematicDone 
}: { 
    activeMode: OverlayMode, 
    onModeChange: (mode: OverlayMode) => void,
    onMovement: (dir: string, active: boolean) => void,
    cinematicDone: boolean
}) {
  const { playBlip } = useSciFiSound();
  const modes: { label: string, value: OverlayMode, abrv: string }[] = [
    { label: 'RAW', value: 'NONE', abrv: 'RAW' },
    { label: 'LATTICE', value: 'NEURAL_LATTICE', abrv: 'LAT' },
    { label: 'GHOST', value: 'GHOST_SIGNAL', abrv: 'GST' },
    { label: 'MIST', value: 'XENO_MIST', abrv: 'MST' },
    { label: 'VOID', value: 'VOID_RESONANCE', abrv: 'VOD' },
    { label: 'COLLAPSE', value: 'VECTOR_COLLAPSE', abrv: 'CLP' },
    { label: 'MAP', value: 'MAP_VIEW', abrv: 'MAP' },
  ];

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-1 z-50 pointer-events-none">
      {/* Left Data Wing */}
      <div className="flex flex-col gap-1 items-end mb-4">
        <div className="text-[5px] opacity-30 tracking-[0.2em]">S_MOD_SYSTEM</div>
        <div className="flex gap-1 pointer-events-auto">
          {modes.slice(0, 4).map((m, i) => (
            <button
              key={m.value}
              onMouseDown={() => {
                  onModeChange(m.value);
                  playBlip(1800 - i * 100, 'sine', 0.05, 0.02);
              }}
              className={cn(
                "w-10 h-6 border flex items-center justify-center transition-all duration-300",
                activeMode === m.value ? "bg-[#00f2ff] text-black border-[#00f2ff]" : "bg-black/60 text-white/40 border-white/10 hover:border-white/40"
              )}
            >
              <span className="text-[6px] font-black">{m.abrv}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Cockpit Center */}
      <div className="relative pointer-events-auto flex flex-col items-center">
        <div className="w-96 h-28 bg-black/80 border-t-2 border-x-2 border-white/10 relative overflow-hidden flex flex-col items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00f2ff]/20" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00f2ff]/20" />
            
            {/* Nav Cluster */}
            <div className="flex items-center gap-8">
               {/* Left D-Pad */}
               <div className="grid grid-cols-3 gap-1">
                  <div />
                  <ControlBtn label="▲" onMovement={onMovement} cmd="w" />
                  <div />
                  <ControlBtn label="◀" onMovement={onMovement} cmd="a" />
                  <ControlBtn label="▼" onMovement={onMovement} cmd="s" />
                  <ControlBtn label="▶" onMovement={onMovement} cmd="d" />
               </div>

               {/* Central Status */}
               <div className="flex flex-col items-center gap-2 w-32 border-x border-white/5">
                  <div className="text-[6px] opacity-40 font-bold uppercase tracking-widest">Core_status</div>
                  <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#00f2ff]/20 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                     ))}
                  </div>
                  <div className="text-[5px] text-[#ff007f] opacity-60">LINK: STABLE_4.0.2</div>
               </div>

               {/* Elevation Cluster */}
               <div className="flex flex-col gap-1">
                  <ControlBtn label="RISE" onMovement={onMovement} cmd="e" wide />
                  <ControlBtn label="FALL" onMovement={onMovement} cmd="q" wide />
               </div>
            </div>
        </div>

        {/* Console Labels */}
        <div className="w-full flex justify-between px-2 py-1 bg-white/5 border-x-2 border-b-2 border-white/10">
           <span className="text-[5px] opacity-30 tracking-[0.3em]">MANUAL_FLIGHT_OVERRIDE_V1.2</span>
           <div className="flex gap-2">
              <span className="text-[5px] text-[#00f2ff] opacity-40 tracking-widest">SYS_05</span>
              <span className="text-[5px] text-[#ff007f] opacity-40 tracking-widest">ERR_00</span>
           </div>
        </div>
      </div>

      {/* Right Data Wing */}
      <div className="flex flex-col gap-1 items-start mb-4">
        <div className="text-[5px] opacity-30 tracking-[0.2em]">AUX_VIS_MOD</div>
        <div className="flex gap-1 pointer-events-auto">
          {modes.slice(4).map((m, i) => (
            <button
              key={m.value}
              onMouseDown={() => {
                  onModeChange(m.value);
                  playBlip(1400 - i * 100, 'sine', 0.05, 0.02);
              }}
              className={cn(
                "w-10 h-6 border flex items-center justify-center transition-all duration-300",
                activeMode === m.value ? "bg-[#00f2ff] text-black border-[#00f2ff]" : "bg-black/60 text-white/40 border-white/10 hover:border-white/40"
              )}
            >
              <span className="text-[6px] font-black">{m.abrv}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ControlBtn({ label, onMovement, cmd, wide }: { label: string, onMovement: (dir: string, active: boolean) => void, cmd: string, wide?: boolean }) {
  return (
    <button
      onMouseDown={() => onMovement(cmd, true)}
      onMouseUp={() => onMovement(cmd, false)}
      onMouseLeave={() => onMovement(cmd, false)}
      className={cn(
        "h-6 border border-white/20 bg-black/40 text-white/60 text-[8px] flex items-center justify-center hover:bg-white/10 active:bg-[#00f2ff] active:text-black transition-colors",
        wide ? "w-12" : "w-6"
      )}
    >
      {label}
    </button>
  );
}

function LensControls({ 
    activeLens, 
    onLensChange,
    activeMode,
    onModeChange 
}: { 
    activeLens: string, 
    onLensChange: (lens: string) => void,
    activeMode: OverlayMode,
    onModeChange: (mode: OverlayMode) => void
}) {
  const { playBlip } = useSciFiSound();
  const lenses = [
    { id: 'STANDARD', label: 'STD_OPTIC', color: '#00f2ff' },
    { id: 'BIO_THERM', label: 'BIO_THERM', color: '#ff3300' },
    { id: 'ECHO_PULSE', label: 'ECHO_PULSE', color: '#00ffaa' },
    { id: 'VOID_DRIVE', label: 'VOID_DRIVE', color: '#aa00ff' },
  ];

  const modes: { label: string, value: OverlayMode, abrv: string }[] = [
    { label: 'RAW', value: 'NONE', abrv: 'RAW' },
    { label: 'LATTICE', value: 'NEURAL_LATTICE', abrv: 'LAT' },
    { label: 'GHOST', value: 'GHOST_SIGNAL', abrv: 'GST' },
    { label: 'MIST', value: 'XENO_MIST', abrv: 'MST' },
    { label: 'VOID', value: 'VOID_RESONANCE', abrv: 'VOD' },
    { label: 'COLLAPSE', value: 'VECTOR_COLLAPSE', abrv: 'CLP' },
    { label: 'MAP', value: 'MAP_VIEW', abrv: 'MAP' },
  ];

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 flex gap-8 z-50 pointer-events-none">
      <div className="flex flex-col gap-4">
        <div className="text-[5px] tracking-[0.4em] opacity-30 mb-2 rotate-90 origin-left translate-x-4 uppercase font-black">OPTICS</div>
        {lenses.map((l, i) => (
          <motion.button
            key={l.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => {
                onLensChange(l.id);
                playBlip(3000 - i * 500, 'sine', 0.1, 0.03);
            }}
            className={cn(
              "group relative w-10 h-10 border flex items-center justify-center pointer-events-auto transition-all duration-500",
              activeLens === l.id ? "border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "border-white/10 hover:border-white/40"
            )}
          >
            <div className="absolute -right-16 opacity-0 group-hover:opacity-100 transition-opacity text-[6px] tracking-widest whitespace-nowrap bg-black/60 px-2 py-1 border border-white/10">
              {l.label}
            </div>
            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: l.color }} />
            {activeLens === l.id && (
              <motion.div 
                 layoutId="lens-ring"
                 className="absolute -inset-2 border border-white/20 rounded-full"
                 initial={false}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-12">
        <div className="text-[5px] tracking-[0.4em] opacity-30 mb-2 rotate-90 origin-left translate-x-4 uppercase font-black">OVERLAYS</div>
        {modes.map((m, i) => (
          <motion.button
            key={m.value}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            onClick={() => {
                onModeChange(m.value);
                playBlip(1500 - i * 100, 'sine', 0.05, 0.02);
            }}
            className={cn(
                "group relative w-8 h-8 border flex items-center justify-center pointer-events-auto transition-all duration-300",
                activeMode === m.value ? "bg-[#00f2ff] text-black border-[#00f2ff]" : "bg-black/60 text-white/40 border-white/10 hover:border-white/40 shadow-inner"
            )}
          >
            <span className="text-[5px] font-black">{m.abrv}</span>
            <div className="absolute -right-16 opacity-0 group-hover:opacity-100 transition-opacity text-[6px] tracking-widest whitespace-nowrap bg-black/60 px-2 py-1 border border-white/10">
              {m.label}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function RealisticCockpitHUD({ progress, cinematicDone, onInitialize, activeMode, onModeChange }: { 
    progress: number, 
    cinematicDone: boolean, 
    onInitialize: () => void,
    activeMode: OverlayMode,
    onModeChange: (mode: OverlayMode) => void
}) {
  const [ledStates, setLedStates] = useState<boolean[]>(new Array(12).fill(false));
  const { playBlip } = useSciFiSound();

  const modes: OverlayMode[] = [
    'NONE',
    'NEURAL_LATTICE',
    'GHOST_SIGNAL',
    'XENO_MIST',
    'VOID_RESONANCE',
    'VECTOR_COLLAPSE',
    'MAP_VIEW',
    'XRAY_INSPECTOR'
  ];

  const handleNextMode = () => {
    const idx = modes.indexOf(activeMode);
    const nextIdx = (idx + 1) % modes.length;
    onModeChange(modes[nextIdx]);
    playBlip(1200, 'sine', 0.1, 0.02);
  };

  const handlePrevMode = () => {
    const idx = modes.indexOf(activeMode);
    const prevIdx = (idx - 1 + modes.length) % modes.length;
    onModeChange(modes[prevIdx]);
    playBlip(1000, 'sine', 0.1, 0.02);
  };

  // Randomized blinking LEDs and Shard State Updates
  useEffect(() => {
    const intervals = ledStates.map((_, i) => {
      return setInterval(() => {
        setLedStates(prev => {
          const next = [...prev];
          next[i] = !next[i];
          return next;
        });
        
        // Update Shard States in the runtime (UI Shards)
      }, 500 + Math.random() * 2000);
    });
    return () => intervals.forEach(clearInterval);
  }, [ledStates]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col font-mono uppercase">
      {/* Upper Brackets - Curved Panels */}
      <div className="flex justify-between px-8 py-6">
        {/* Top Left: Hull & Energy */}
        <div className="relative group">
          <svg width="320" height="160" viewBox="0 0 320 160" className="drop-shadow-[0_0_15px_rgba(0,242,255,0.2)]">
            <path d="M 0 0 L 280 0 C 305 0 320 15 320 40 L 320 120 C 320 145 305 160 280 160 L 0 160 Z" fill="rgba(8,8,8,0.9)" stroke="#00f2ff66" strokeWidth="2" />
            <path d="M 10 10 L 270 10 C 290 10 300 20 300 40 L 300 120 C 300 140 290 150 270 150 L 10 150 Z" fill="transparent" stroke="#00f2ff11" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 p-8 flex flex-col gap-4 pointer-events-auto">
            <div className="flex justify-between items-center border-b border-[#00f2ff]/30 pb-2">
               <div className="flex flex-col">
                  <span className="text-[12px] text-[#00f2ff] font-black tracking-tighter">HULL_INTEGRITY</span>
                  <span className="text-[6px] opacity-40">SVT_ARMOR_SYS_v4</span>
               </div>
               <Shield className="w-5 h-5 text-[#00f2ff]" />
            </div>
            <div className="flex gap-1.5 h-4">
               {[...Array(16)].map((_, i) => (
                 <div key={i} className={cn("flex-1 h-full skew-x-[-20deg] transition-all duration-500", i < 11 ? "bg-[#00f2ff]" : "bg-[#00f2ff]/10")} />
               ))}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-2">
               <div className="p-2 border-l-2 border-[#00f2ff]/20 bg-white/5">
                  <div className="text-[7px] opacity-50 font-bold">CORE_OUTPUT</div>
                  <div className="text-[14px] font-black tabular-nums text-[#00f2ff]">4.82 GW</div>
               </div>
               <div className="p-2 border-l-2 border-[#ff007f]/20 bg-white/5">
                  <div className="text-[7px] opacity-50 font-bold">OXYGEN_LEVEL</div>
                  <div className="text-[14px] font-black tabular-nums text-[#ff007f]">98.4%</div>
               </div>
            </div>
          </div>
        </div>

        {/* Top Right: Radar & Nav */}
        <div className="relative">
          <svg width="320" height="160" viewBox="0 0 320 160" className="drop-shadow-[0_0_15px_rgba(255,0,127,0.2)]">
            <path d="M 320 0 L 40 0 C 15 0 0 15 0 40 L 0 120 C 0 145 15 160 40 160 L 320 160 Z" fill="rgba(8,8,8,0.9)" stroke="#ff007f66" strokeWidth="2" />
            <path d="M 310 10 L 50 10 C 30 10 20 20 20 40 L 20 120 C 20 140 30 150 50 150 L 310 150 Z" fill="transparent" stroke="#ff007f11" strokeWidth="1" />
          </svg>
          <div className="absolute inset-0 p-8 flex flex-col gap-4 pointer-events-auto">
            <div className="flex justify-between items-center border-b border-[#ff007f]/30 pb-2">
               <Target className="w-5 h-5 text-[#ff007f]" />
               <div className="flex flex-col items-end">
                  <span className="text-[12px] text-[#ff007f] font-black tracking-tighter">TACTICAL_LOCK</span>
                  <span className="text-[6px] opacity-40 text-right">AUTO_TRACK_ACTIVE</span>
               </div>
            </div>
            <div className="flex justify-between items-start">
               <div className="flex flex-col gap-2">
                  <div className="text-[7px] opacity-50 font-bold">RADAR_SWEEP</div>
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <Radar className="w-6 h-6 text-[#00f2ff]" />
                        <motion.div 
                          className="absolute inset-0 border border-[#00f2ff] rounded-full"
                          animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        />
                     </div>
                     <span className="text-[12px] tabular-nums tracking-widest font-black">X_SCAN</span>
                  </div>
               </div>
               <div className="flex flex-col items-end gap-1">
                  <div className="text-[7px] opacity-50 font-bold">OBJ_DISTANCE</div>
                  <div className="text-[16px] font-black tabular-nums text-white">{(2500 - progress * 2400).toFixed(1)} KM</div>
               </div>
            </div>
            <div className="mt-auto flex gap-1 justify-end">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className={cn("w-2 h-4", ledStates[i] ? "bg-[#00f2ff]" : "bg-white/5")} />
               ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Bottom Control Interface */}
      <div className="w-full bg-gradient-to-t from-black via-[#080808] to-transparent pt-12 pb-8 px-12 relative flex flex-col items-center pointer-events-auto">
         {/* Main Cockpit Cluster */}
         <div className="flex items-end gap-6 max-w-7xl w-full justify-between">
            {/* Left Aux Panel */}
            <div className="w-64 h-40 bg-black/80 border border-[#00f2ff]/20 relative skew-x-[-10deg] flex flex-col p-4 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
               <div className="text-[8px] font-black tracking-widest text-[#00f2ff] flex items-center gap-2 mb-4">
                  <Activity className="w-3 h-3" /> AUX_DIAGNOSTICS
               </div>
               <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-1">
                       <div className="flex justify-between text-[6px] opacity-40">
                          <span>SYS_STREAM_{i}</span>
                          <span>STABLE</span>
                       </div>
                       <div className="h-1 bg-white/5 relative overflow-hidden">
                          <motion.div 
                             className="absolute inset-0 bg-[#00f2ff]/40"
                             animate={{ x: ['-100%', '100%'] }}
                             transition={{ repeat: Infinity, duration: 2 + i, ease: "linear" }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-auto flex justify-between">
                  <div className="w-12 h-6 border border-white/10 flex items-center justify-center text-[7px] opacity-40">PWR_01</div>
                  <div className="w-12 h-6 border border-white/10 flex items-center justify-center text-[7px] text-[#ff007f]">ERR_00</div>
               </div>
            </div>

            {/* Center Main Panel */}
            <div className="flex-1 max-w-2xl flex flex-col items-center gap-4">
               {/* Mode Display */}
               <div className="w-full h-12 bg-black/90 border border-white/10 flex items-center justify-between px-6 relative overflow-hidden">
                  <button onClick={handlePrevMode} className="p-2 border border-white/10 hover:bg-white/5 text-[#00f2ff]">
                    <span className="text-xs font-black">◀</span>
                  </button>
                  <div className="flex flex-col items-center">
                    <div className="text-[6px] opacity-30 tracking-[0.4em] mb-1">OPTIC_OVERLAY_MODE</div>
                    <AnimatePresence mode="wait">
                       <motion.div 
                          key={activeMode}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-[14px] font-black text-white tracking-[0.2em]"
                       >
                          {activeMode}
                       </motion.div>
                    </AnimatePresence>
                  </div>
                  <button onClick={handleNextMode} className="p-2 border border-white/10 hover:bg-white/5 text-[#00f2ff]">
                    <span className="text-xs font-black">▶</span>
                  </button>
                  
                  {/* Decorative Scanline */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00f2ff]/5 to-transparent h-[1px] top-0 animate-scan pointer-events-none" />
               </div>

               {/* Large Cockpit Console */}
               <div className="w-full h-48 bg-[#0a0a0a] border-t-2 border-x-2 border-white/10 p-6 flex gap-8 shadow-2xl relative shadow-cyan-900/10">
                  <div className="absolute top-0 left-0 w-2 h-full bg-[#00f2ff]/5" />
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#00f2ff]/5" />
                  
                  {/* Left Controls */}
                  <div className="flex flex-col gap-4">
                     <div className="grid grid-cols-2 gap-2">
                        {[...Array(4)].map((_, i) => (
                           <button 
                             key={i} 
                             onClick={() => playBlip(600 + i * 200, 'square', 0.1, 0.01)}
                             className="w-10 h-10 border border-white/10 hover:bg-[#00f2ff]/10 flex items-center justify-center group"
                           >
                              <div className={cn("w-1 h-1 rounded-full transition-colors", ledStates[i] ? "bg-[#ff007f]" : "bg-white/10")} />
                           </button>
                        ))}
                     </div>
                     <div className="text-[6px] opacity-20 tracking-widest">COMMS_LINK</div>
                  </div>

                  {/* Center Progress/Status */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                     {cinematicDone ? (
                       <button 
                         onClick={onInitialize}
                         className="px-12 py-3 bg-[#ff007f]/5 border border-[#ff007f]/40 text-[#ff007f] hover:bg-[#ff007f] hover:text-black transition-all font-black text-[10px] tracking-widest"
                       >
                         INITIATE_TAKEOFF
                       </button>
                     ) : (
                       <div className="w-full space-y-4">
                          <div className="text-center text-[10px] font-black tracking-[0.5em] opacity-40">APPROACH_SEQUENCE</div>
                          <div className="flex h-1 gap-1">
                             {[...Array(32)].map((_, i) => (
                               <div key={i} className={cn("flex-1 h-full", i/32 < progress ? "bg-[#00f2ff]" : "bg-white/5")} />
                             ))}
                          </div>
                          <div className="text-center tabular-nums text-[12px] opacity-80">{(progress * 100).toFixed(2)}%</div>
                       </div>
                     )}
                  </div>

                  {/* Right Controls */}
                  <div className="flex flex-col gap-2 items-end">
                     <div className="flex gap-2">
                        <Battery className="w-3 h-3 text-[#00f2ff]" />
                        <span className="text-[8px] font-black">98%</span>
                     </div>
                     <div className="flex flex-col items-end gap-1 mt-4">
                        <div className="w-20 h-1 bg-white/5">
                           <div className="h-full bg-[#00f2ff]" style={{ width: '60%' }} />
                        </div>
                        <div className="text-[5px] opacity-30 uppercase font-black">ENGINE_TEMP</div>
                     </div>
                     <div className="mt-auto">
                        <button className="px-4 py-2 border border-[#00f2ff]/20 text-[6px] text-[#00f2ff] hover:bg-[#00f2ff]/10">EMERGENCY_VENT</button>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Aux Panel */}
            <div className="w-64 h-40 bg-black/80 border border-[#00f2ff]/20 relative skew-x-[10deg] flex flex-col p-4 shadow-[0_0_40px_rgba(0,0,0,0.9)]">
               <div className="text-[8px] font-black tracking-widest text-[#ff007f] flex items-center gap-2 mb-4 justify-end">
                  NAV_DATABASE <Globe className="w-3 h-3" />
               </div>
               <div className="flex-1 flex flex-col items-end gap-2 text-right">
                  <div className="text-[12px] font-bold text-white/50 tracking-widest">SECTOR_7G</div>
                  <div className="text-[8px] opacity-30">COORDS: 48.01, -34.52</div>
                  <div className="mt-4 grid grid-cols-3 gap-1">
                     {[...Array(9)].map((_, i) => (
                        <div key={i} className={cn("w-4 h-4 border border-white/5", ledStates[i] ? "bg-[#ff007f]/20" : "bg-black")} />
                     ))}
                  </div>
               </div>
               <div className="text-[6px] opacity-20 mt-2">ENCRYPTION: QUANTUM_SYNC</div>
            </div>
         </div>

         {/* Decorative Floor Plate */}
         <div className="w-full h-4 bg-white/5 mt-4 border-t border-white/10 skew-x-[45deg]" />
      </div>
    </div>
  );
}

import { GlassflowProvider, useGlassflow, GlassflowHeartbeat } from './glassflow/GlassflowContext';

function SavantApp() {
  const { 
    progress, 
    setProgress, 
    cinematicDone, 
    setCinematicDone, 
    activeMode, 
    setActiveMode 
  } = useGlassflow();
  
  const [initialized, setInitialized] = useState(false);
  const { playBlip, playHum, playPulse } = useSciFiSound();
  
  useEffect(() => {
      if (cinematicDone) {
          playBlip(400, 'sine', 0.5, 0.1);
      }
  }, [cinematicDone, playBlip]);

  useEffect(() => {
    const stopHum = playHum();
    return () => {
        if (stopHum) stopHum();
    };
  }, [playHum]);

  useEffect(() => {
    if (!cinematicDone && progress > 0) {
      if (Math.floor(progress * 40) % 10 === 0 && progress < 0.95) {
        playPulse(50 + progress * 50, 0.8);
      }
    }
  }, [progress, cinematicDone, playPulse]);

  const handleComplete = useCallback(() => setCinematicDone(true), [setCinematicDone]);

  if (initialized) {
    return (
      <div className="w-full h-screen bg-black flex flex-col items-center justify-center font-mono text-[#00f2ff] p-12 overflow-hidden">
          <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.05)_0%,transparent_70%)]" />
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl w-full border border-white/5 bg-black/60 backdrop-blur-[40px] p-24 space-y-12 relative shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#00f2ff]/40" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-[#00f2ff]/40" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-[#00f2ff]/40" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#00f2ff]/40" />
              
              <div className="space-y-6">
                  <motion.div 
                    initial={{ letterSpacing: '0.5em', opacity: 0 }}
                    animate={{ letterSpacing: '1.2em', opacity: 1 }}
                    transition={{ delay: 0.5, duration: 2 }}
                    className="text-7xl font-thin tracking-[1.2em] text-white"
                  >
                    ONLINE
                  </motion.div>
                  <div className="flex items-center gap-6">
                      <div className="h-[2px] w-48 bg-[#00f2ff] shadow-[0_0_20px_#00f2ff]" />
                      <div className="text-[10px] font-black tracking-[0.4em] opacity-40">INTERFACE_STABLE</div>
                  </div>
              </div>
              
              <div className="space-y-8">
                <p className="text-[12px] tracking-[0.3em] opacity-50 leading-[2] uppercase max-w-2xl">
                  Neural bridge synchronization complete. Savant Core tactical interface is now fully operational. 
                  Quantum-encrypted data streams are flowing correctly. Local sub-sector environment parameters 
                  have been analyzed and mitigated. Use the provided optic modules to begin the objective.
                </p>

                <div className="grid grid-cols-2 gap-12 pt-8">
                   <div className="space-y-2">
                      <div className="text-[8px] font-black opacity-20">SYSTEM_ID</div>
                      <div className="text-[11px] font-bold text-white tracking-widest">SAVANT_7_PRIME</div>
                   </div>
                   <div className="space-y-2">
                      <div className="text-[8px] font-black opacity-20">ENCRYPTION</div>
                      <div className="text-[11px] font-bold text-[#ff4400] tracking-widest">AES_BIT_COLLAPSE</div>
                   </div>
                </div>
              </div>
              
              <div className="pt-12">
                <button 
                  onClick={() => {
                      playBlip(100, 'sine', 0.3);
                      setInitialized(false);
                      setCinematicDone(false);
                  }}
                  className="group relative px-20 py-6 border border-white/10 hover:border-[#00f2ff] hover:bg-[#00f2ff]/5 transition-all duration-700 uppercase tracking-[0.8em] text-[12px] font-black group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[#00f2ff]/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  <span className="relative z-10 text-white/40 group-hover:text-[#00f2ff] transition-colors">TERMINATE_SESSION</span>
                </button>
              </div>
          </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <Canvas 
        shadows 
        camera={{ fov: 35, near: 0.1, far: 50000 }}
        gl={{ antialias: true, stencil: false, depth: true }}
      >
        <GlassflowHeartbeat />
        <Scene 
          onTimelineProgress={setProgress} 
          onComplete={handleComplete}
          activeMode={activeMode}
        />
      </Canvas>

      <RealisticCockpitHUD 
        progress={progress} 
        cinematicDone={cinematicDone} 
        onInitialize={() => setInitialized(true)}
        activeMode={activeMode}
        onModeChange={setActiveMode}
      />
    </div>
  );
}

export default function App() {
  return (
    <GlassflowProvider>
      <SavantApp />
    </GlassflowProvider>
  );
}

