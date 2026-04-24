/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Trophy, Gamepad2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  color: string;
}

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Direction = 'UP';
const INITIAL_SPEED = 150;

// --- Mock Data ---

const DUMMY_TRACKS: Track[] = [
  { id: '1', title: 'Neon Pulse', artist: 'AI Synthwave', duration: '3:24', color: 'bg-cyan-500' },
  { id: '2', title: 'Cyber Drift', artist: 'Neural Beats', duration: '4:12', color: 'bg-purple-500' },
  { id: '3', title: 'Electric Dreams', artist: 'Byte Harmonic', duration: '2:58', color: 'bg-rose-500' },
];

// --- Components ---

export default function App() {
  // Music State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTrack = DUMMY_TRACKS[currentTrackIndex];

  // Game State
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // --- Music Logic ---

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % DUMMY_TRACKS.length);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + DUMMY_TRACKS.length) % DUMMY_TRACKS.length);
  };

  // --- Game Logic ---

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    setFood(newFood);
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    setIsGameOver(false);
    setScore(0);
    setIsGameRunning(true);
    generateFood(INITIAL_SNAKE);
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || !isGameRunning) return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setIsGameOver(true);
        setIsGameRunning(false);
        return prevSnake;
      }

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsGameRunning(false);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, isGameOver, isGameRunning, generateFood]);

  useEffect(() => {
    if (isGameRunning && !isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, INITIAL_SPEED);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isGameRunning, isGameOver, moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameOver) return;
      
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': if (directionRef.current !== 'DOWN') directionRef.current = 'UP'; break;
        case 'ArrowDown': case 's': case 'S': if (directionRef.current !== 'UP') directionRef.current = 'DOWN'; break;
        case 'ArrowLeft': case 'a': case 'A': if (directionRef.current !== 'RIGHT') directionRef.current = 'LEFT'; break;
        case 'ArrowRight': case 'd': case 'D': if (directionRef.current !== 'LEFT') directionRef.current = 'RIGHT'; break;
        case ' ':
          if (isGameOver) resetGame();
          else setIsGameRunning(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGameOver]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  return (
    <div className="min-h-screen bg-black text-[#00FFFF] font-mono crt-overlay scanline flex flex-col items-center justify-between p-8 relative overflow-hidden">
      
      {/* Background Anomalies */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header: System Branding & Stats */}
      <header className="w-full flex justify-between items-center z-10 border-b border-[#00FFFF]/20 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#00FFFF] rounded-none flex items-center justify-center shadow-[0_0_20px_#00FFFF]">
            <Music className="w-8 h-8 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase font-sans">
              SynthSnake <span className="text-[#FF00FF] italic glitch-text">OS_v2.0</span>
            </h1>
            <p className="text-[10px] text-[#00FFFF]/50 uppercase tracking-[0.3em]">Neural Interface Layer // Stable</p>
          </div>
        </div>

        <div className="flex gap-16 items-center">
          <div className="text-right">
            <p className="text-[10px] text-[#00FFFF]/40 uppercase tracking-widest">Buffer_Score</p>
            <p className="text-4xl font-bold text-[#FF00FF] drop-shadow-[0_0_10px_#FF00FF]">
              {score.toString().padStart(6, '0')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#00FFFF]/40 uppercase tracking-widest">Max_Streak</p>
            <p className="text-4xl font-bold text-[#00FFFF] drop-shadow-[0_0_10px_#00FFFF]">
              {highScore.toString().padStart(6, '0')}
            </p>
          </div>
        </div>
      </header>

      {/* Main Grid: Tri-Pane Layout */}
      <main className="flex-1 w-full grid grid-cols-[280px_1fr_280px] gap-8 mt-6 z-10">
        
        {/* Left Sidebar: Neural Playlist */}
        <aside className="bg-[#00FFFF]/5 border border-[#00FFFF]/10 p-5 flex flex-col gap-4">
          <h2 className="text-[11px] font-bold text-[#00FFFF]/60 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-1 bg-[#00FFFF] animate-pulse" /> Stream_Input.src
          </h2>
          <div className="flex flex-col gap-2">
            {DUMMY_TRACKS.map((track, i) => (
              <button 
                key={track.id}
                onClick={() => {
                  setCurrentTrackIndex(i);
                  setIsPlaying(true);
                }}
                className={`p-3 border transition-all text-left group ${
                  currentTrackIndex === i 
                    ? 'bg-[#00FFFF]/10 border-[#00FFFF]/50' 
                    : 'bg-black border-transparent hover:border-[#00FFFF]/30 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${currentTrackIndex === i ? 'bg-[#FF00FF] animate-ping' : 'bg-[#00FFFF]/20'}`} />
                  <div>
                    <p className={`text-xs font-bold leading-none ${currentTrackIndex === i ? 'text-[#00FFFF]' : 'text-white'}`}>
                      {track.title}.wav
                    </p>
                    <p className="text-[9px] text-[#00FFFF]/40 font-mono mt-1 uppercase">NODE: {track.artist} // {track.duration}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: Neural Grid (Game) */}
        <section className="flex items-center justify-center">
          <div className="relative p-1 bg-gradient-to-br from-[#00FFFF]/30 to-[#FF00FF]/30 border border-white/5 shadow-[0_0_40px_rgba(0,255,255,0.1)]">
            <div 
              className="w-[440px] h-[440px] bg-black relative overflow-hidden grid"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)` }}
            >
              {/* Matrix Grid Lines */}
              <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] pointer-events-none opacity-5">
                {Array.from({ length: 400 }).map((_, i) => (
                  <div key={i} className="border-[0.5px] border-[#00FFFF]" />
                ))}
              </div>

              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isHead = snake[0].x === x && snake[0].y === y;
                const isFood = food.x === x && food.y === y;

                return (
                  <div key={i} className="relative w-full h-full">
                    {isSnake && (
                      <div 
                        className={`absolute inset-0.5 shadow-[0_0_10px_currentColor] transition-colors duration-100 ${
                          isHead ? 'bg-[#FF00FF] text-[#FF00FF]' : 'bg-[#00FFFF] text-[#00FFFF]'
                        }`}
                      />
                    )}
                    {isFood && (
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="absolute inset-1 bg-white shadow-[0_0_15px_#white]"
                      />
                    )}
                  </div>
                );
              })}

              {/* HUD Overlays */}
              <div className="absolute top-3 left-3 text-[9px] font-mono text-[#00FFFF]/30 uppercase tracking-tighter">
                Sys_Integrity: 98.4% // Buffer_Ok
              </div>
              <div className="absolute bottom-3 right-3 text-[9px] font-mono text-[#FF00FF]/60 uppercase tracking-tighter animate-pulse">
                Multiplier: 2.5X
              </div>

              {/* Menu Overlays */}
              <AnimatePresence>
                {!isGameRunning && !isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]"
                  >
                    <button 
                      onClick={() => setIsGameRunning(true)}
                      className="group relative px-10 py-4 bg-transparent border-2 border-[#00FFFF] font-bold text-[#00FFFF] hover:bg-[#00FFFF] hover:text-black transition-all font-sans"
                    >
                      <span className="relative z-10">INITIALIZE_CORE</span>
                    </button>
                    <p className="mt-6 text-[10px] text-[#00FFFF]/40 uppercase tracking-[0.2em] glitch-text">PRESS SPACE TO EXECUTE</p>
                  </motion.div>
                )}

                {isGameOver && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-30"
                  >
                    <h2 className="text-5xl font-black text-[#FF00FF] mb-4 italic tracking-tighter glitch-text">FATAL_ERROR</h2>
                    <p className="text-[#00FFFF]/60 mb-8 uppercase tracking-widest text-sm font-sans">RECOVERED_SCORE: {score}</p>
                    <button 
                      onClick={resetGame}
                      className="px-8 py-2 bg-[#00FFFF] text-black font-bold uppercase tracking-widest hover:bg-[#FF00FF] transition-colors"
                    >
                      REBOOT_SYSTEM
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Controls & Visualizer */}
        <aside className="flex flex-col gap-6">
          <div className="bg-[#00FFFF]/5 border border-[#00FFFF]/10 p-5">
            <h2 className="text-[11px] font-bold text-[#00FFFF]/60 uppercase tracking-widest mb-6">Nav_Controls</h2>
            <div className="grid grid-cols-3 gap-2">
              <div />
              <div className="aspect-square flex items-center justify-center border border-[#00FFFF]/30 bg-black text-[#00FFFF] text-xs font-bold">W</div>
              <div />
              <div className="aspect-square flex items-center justify-center border border-[#00FFFF]/30 bg-black text-[#00FFFF] text-xs font-bold">A</div>
              <div className="aspect-square flex items-center justify-center border border-[#00FFFF]/30 bg-black text-[#00FFFF] text-xs font-bold">S</div>
              <div className="aspect-square flex items-center justify-center border border-[#00FFFF]/30 bg-black text-[#00FFFF] text-xs font-bold">D</div>
            </div>
            <p className="text-[9px] text-center mt-5 text-[#00FFFF]/40 italic uppercase tracking-tighter">WASD OR ARROWS TO INTERFACE</p>
          </div>
          
          <div className="flex-1 bg-[#00FFFF]/5 border border-[#00FFFF]/10 p-5 relative overflow-hidden group">
            <h2 className="text-[11px] font-bold text-[#00FFFF]/60 uppercase tracking-widest">Freq_Spectrum</h2>
            <div className="flex items-end justify-between h-32 mt-6 gap-1 px-2">
              {[0,1,2,3,4,5,6,7,8].map(i => (
                <motion.div 
                  key={i}
                  animate={isPlaying ? { height: [20, 100, 40, 80, 20] } : { height: 10 }}
                  transition={{ repeat: Infinity, duration: 0.4 + i * 0.1, ease: "easeInOut" }}
                  className={`w-full ${i === 4 ? 'bg-[#FF00FF]' : 'bg-[#00FFFF]/40'}`}
                />
              ))}
            </div>
            <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-10 transition-opacity bg-[radial-gradient(circle_at_center,_#ff00ff_0%,_transparent_70%)]" />
          </div>
        </aside>
      </main>

      {/* Footer: Primary Player Controls */}
      <footer className="w-full mt-6 bg-[#00FFFF]/5 border-t border-[#00FFFF]/20 p-6 rounded-none flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center gap-5 w-1/4">
          <div className="w-14 h-14 bg-[#FF00FF] rounded-none overflow-hidden flex items-center justify-center border border-[#FF00FF] shadow-[0_0_15px_#FF00FF]">
            <div className={`w-10 h-10 border-2 border-black/30 flex items-center justify-center ${isPlaying ? 'animate-spin' : ''}`}>
              <div className="w-2 h-2 bg-black" />
            </div>
          </div>
          <div>
            <p className="font-bold text-lg leading-none uppercase font-sans tracking-tighter glitch-text">{currentTrack.title}</p>
            <p className="text-[10px] text-[#00FFFF]/60 uppercase tracking-widest mt-1">Source: {currentTrack.artist}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-1/2">
          <div className="flex items-center gap-12">
            <button onClick={prevTrack} className="text-[#00FFFF]/40 hover:text-[#00FFFF] transition-colors"><SkipBack className="w-6 h-6" /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-16 h-16 bg-[#00FFFF] text-black rounded-none flex items-center justify-center shadow-[0_0_20px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current translate-x-1" />}
            </button>
            <button onClick={nextTrack} className="text-[#00FFFF]/40 hover:text-[#00FFFF] transition-colors"><SkipForward className="w-6 h-6" /></button>
          </div>
          <div className="w-full flex items-center gap-4">
            <span className="text-[10px] font-mono text-[#00FFFF]/40">00:42</span>
            <div className="flex-1 h-1 bg-[#00FFFF]/10 rounded-none overflow-hidden relative">
              <motion.div 
                animate={isPlaying ? { width: ["0%", "100%"] } : {}}
                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]"
              />
            </div>
            <span className="text-[10px] font-mono text-[#00FFFF]/40">{currentTrack.duration}</span>
          </div>
        </div>

        <div className="w-1/4 flex justify-end items-center gap-6">
          <Volume2 className="w-5 h-5 text-[#00FFFF]/40" />
          <div className="w-32 h-1 bg-[#00FFFF]/10 border border-[#00FFFF]/10">
            <div className="h-full w-[70%] bg-[#00FFFF]/60" />
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-[#FF00FF] animate-pulse" />
            <div className="w-2 h-2 bg-[#00FFFF]/20" />
          </div>
        </div>
      </footer>

      {/* Cryptic Footer Tag */}
      <div className="mt-4 text-[8px] uppercase tracking-[0.5em] text-[#00FFFF]/20 flex items-center gap-4">
        <span>TRANSMISSION_STABLE</span>
        <div className="w-1 h-1 bg-[#00FFFF]/20 rounded-full" />
        <span>NODE_77_B</span>
        <div className="w-1 h-1 bg-[#00FFFF]/20 rounded-full" />
        <span>CYPHER_ACTIVE</span>
      </div>
    </div>
  );
}
