import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Zap, Activity } from 'lucide-react';
import { GameStatus, Direction, Position } from '../types';
import { GRID_SIZE, INITIAL_SNAKE_SPEED, SPEED_INCREMENT } from '../constants';
import { sfx } from '../utils/sfx';

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const getRandomPosition = (): Position => {
  return {
    x: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2,
    y: Math.floor(Math.random() * (GRID_SIZE - 4)) + 2,
  };
};

interface SplashEffect {
  id: number;
  x: number;
  y: number;
}

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SNAKE_SPEED);
  const [splashes, setSplashes] = useState<SplashEffect[]>([]);

  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Direction>(Direction.UP);
  const touchStartRef = useRef<{ x: number, y: number } | null>(null);
  const splashIdCounter = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('neon_snake_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('neon_snake_highscore', score.toString());
    }
  }, [score, highScore]);

  const triggerSplash = (pos: Position) => {
    const id = splashIdCounter.current++;
    setSplashes(prev => [...prev, { id, x: pos.x, y: pos.y }]);
    setTimeout(() => {
      setSplashes(prev => prev.filter(s => s.id !== id));
    }, 600);
  };

  const resetGame = () => {
    sfx.start();
    setSnake(INITIAL_SNAKE);
    setFood(getRandomPosition());
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    setScore(0);
    setSpeed(INITIAL_SNAKE_SPEED);
    setSplashes([]);
    setStatus(GameStatus.PLAYING);
  };

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = { ...head };

      switch (directionRef.current) {
        case Direction.UP: newHead.y -= 1; break;
        case Direction.DOWN: newHead.y += 1; break;
        case Direction.LEFT: newHead.x -= 1; break;
        case Direction.RIGHT: newHead.x += 1; break;
      }

      sfx.move();

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setStatus(GameStatus.GAME_OVER);
        sfx.error();
        if ('vibrate' in navigator) navigator.vibrate([150, 50, 150]);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        triggerSplash({ ...food });
        setScore((s) => s + 10);
        setFood(getRandomPosition());
        setSpeed((s) => Math.max(90, s - SPEED_INCREMENT));
        sfx.eat();
        if ('vibrate' in navigator) navigator.vibrate(40);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food]);

  const handleInput = useCallback((newDir: Direction) => {
    if (status !== GameStatus.PLAYING) return;
    if (newDir === Direction.UP && directionRef.current !== Direction.DOWN) {
      setDirection(Direction.UP);
      directionRef.current = Direction.UP;
    } else if (newDir === Direction.DOWN && directionRef.current !== Direction.UP) {
      setDirection(Direction.DOWN);
      directionRef.current = Direction.DOWN;
    } else if (newDir === Direction.LEFT && directionRef.current !== Direction.RIGHT) {
      setDirection(Direction.LEFT);
      directionRef.current = Direction.LEFT;
    } else if (newDir === Direction.RIGHT && directionRef.current !== Direction.LEFT) {
      setDirection(Direction.RIGHT);
      directionRef.current = Direction.RIGHT;
    }
  }, [status]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    
    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
        if (Math.abs(dx) > Math.abs(dy)) {
          handleInput(dx > 0 ? Direction.RIGHT : Direction.LEFT);
        } else {
          handleInput(dy > 0 ? Direction.DOWN : Direction.UP);
        }
    }
    touchStartRef.current = null;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': handleInput(Direction.UP); break;
        case 'ArrowDown': case 's': handleInput(Direction.DOWN); break;
        case 'ArrowLeft': case 'a': handleInput(Direction.LEFT); break;
        case 'ArrowRight': case 'd': handleInput(Direction.RIGHT); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      gameLoopRef.current = window.setInterval(moveSnake, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [status, moveSnake, speed]);

  const scoreStr = score.toString().padStart(5, '0');

  const stones = useRef([...Array(15)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 15 + Math.random() * 30,
      rotate: Math.random() * 360
  })));

  const grassTufts = useRef([...Array(40)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: 0.6 + Math.random() * 1.2,
      rotate: Math.random() * 20 - 10
  })));

  return (
    <div className="flex flex-col h-full w-full bg-black select-none overflow-hidden relative font-mono">
      
      {/* TELEMETRY HUD */}
      <header className="relative w-full p-4 sm:p-6 z-30 flex justify-between items-center bg-black border-b border-[#1a1a1a] shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          <div className="bg-black/40 border-l-4 border-[#0ff] p-3 backdrop-blur-md shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
              <div className="text-[10px] text-[#ff00ff] font-bold tracking-[2px] sm:tracking-[4px] uppercase opacity-80 mb-1 animate-pulse whitespace-nowrap">
                AVI ERIC ABHISHEK GAMES
              </div>
              <span className="text-[9px] text-[#0ff] font-bold tracking-[2px] uppercase opacity-60 flex items-center gap-2">
                 <Activity size={12} className="animate-pulse" /> BUFFER_SCORE
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white glitch-text tracking-tighter" data-text={scoreStr}>{scoreStr}</div>
          </div>

          <div className="bg-black/40 border-r-4 border-[#ff00ff] p-3 text-right backdrop-blur-md shadow-[4px_4px_0_rgba(0,0,0,0.6)]">
              <span className="text-[9px] text-[#ff00ff] font-bold tracking-[2px] uppercase opacity-60 flex items-center gap-2 justify-end">
                SYSTEM_MAX <Zap size={12} />
              </span>
              <div className="text-3xl sm:text-5xl font-black text-white glitch-text tracking-tighter" data-text={highScore.toString().padStart(5, '0')}>
                  {highScore.toString().padStart(5, '0')}
              </div>
          </div>
      </header>

      {/* TACTILE EXECUTION VIEWPORT */}
      <section 
        className="flex-1 relative bg-[#0a140a] overflow-hidden touch-none cursor-crosshair"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
          {/* BIOME LAYER */}
          <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 opacity-[0.05]" 
                  style={{
                    backgroundImage: `linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)`,
                    backgroundSize: `${100 / GRID_SIZE}% ${100 / GRID_SIZE}%`
                  }}></div>
              
              {stones.current.map((stone, i) => (
                  <div 
                    key={i} 
                    className="absolute bg-[#111] opacity-60"
                    style={{
                        left: `${stone.x}%`,
                        top: `${stone.y}%`,
                        width: `${stone.size}px`,
                        height: `${stone.size * 0.85}px`,
                        transform: `rotate(${stone.rotate}deg)`,
                        clipPath: 'polygon(15% 0%, 85% 15%, 100% 60%, 85% 95%, 15% 100%, 0% 50%)',
                        border: '2px solid #222'
                    }}
                  />
              ))}

              {grassTufts.current.map((tuft, i) => (
                  <div 
                    key={i} 
                    className="absolute opacity-40 flex gap-[3px] items-end"
                    style={{
                        left: `${tuft.x}%`,
                        top: `${tuft.y}%`,
                        transform: `scale(${tuft.scale}) rotate(${tuft.rotate}deg)`,
                    }}
                  >
                      <div className="w-1.5 h-4 bg-[#0ff]/60 rounded-full"></div>
                      <div className="w-1.5 h-7 bg-[#0ff] rounded-full"></div>
                      <div className="w-1.5 h-3 bg-[#0ff]/40 rounded-full"></div>
                  </div>
              ))}
          </div>

          {/* ACTOR CONTEXT */}
          <div className="w-full h-full relative z-20">
              {splashes.map((s) => (
                <div 
                  key={s.id} 
                  className="absolute pointer-events-none flex items-center justify-center"
                  style={{
                    left: `${(s.x / GRID_SIZE) * 100}%`,
                    top: `${(s.y / GRID_SIZE) * 100}%`,
                    width: `${100 / GRID_SIZE}%`,
                    height: `${100 / GRID_SIZE}%`,
                    zIndex: 25
                  }}
                >
                  <div className="relative w-full h-full animate-[ping_0.6s_ease-out_forwards] flex items-center justify-center">
                    <div className="absolute w-[200%] h-[200%] bg-[#ffff00] rounded-full blur-[10px] opacity-30"></div>
                  </div>
                </div>
              ))}

              {/* SNAKE ENTITY */}
              {snake.map((segment, index) => {
                  const isHead = index === 0;
                  const isTail = index === snake.length - 1;
                  
                  let rotation = 0;
                  if (isHead) {
                    switch (direction) {
                        case Direction.UP: rotation = 0; break;
                        case Direction.RIGHT: rotation = 90; break;
                        case Direction.DOWN: rotation = 180; break;
                        case Direction.LEFT: rotation = 270; break;
                    }
                  }
                  
                  return (
                      <div
                          key={`${segment.x}-${segment.y}-${index}`}
                          className="absolute transition-all duration-[200ms] ease-linear flex items-center justify-center"
                          style={{
                              left: `${(segment.x / GRID_SIZE) * 100}%`,
                              top: `${(segment.y / GRID_SIZE) * 100}%`,
                              width: `${100 / GRID_SIZE}%`,
                              height: `${100 / GRID_SIZE}%`,
                              zIndex: isHead ? 30 : (20 - index),
                          }}
                      >
                          <div 
                            className={`w-full h-full relative transition-transform duration-[150ms] ${isHead ? 'bg-[#0ff]' : (index % 2 === 0 ? 'bg-[#00cccc]' : 'bg-[#009999]')} shadow-[0_0_20px_rgba(0,255,255,0.5)]`}
                            style={{
                              borderRadius: isHead ? '45% 45% 15% 15%' : (isTail ? '15% 15% 50% 50%' : '25%'),
                              transform: `rotate(${rotation}deg) scale(${isHead ? 1.35 : (1 - index * 0.015)})`,
                              border: '3px solid rgba(0,0,0,0.6)',
                              animation: `wobble ${1 + index * 0.05}s infinite ease-in-out`
                            }}
                          >
                            {isHead && (
                              <div className="relative w-full h-full overflow-visible">
                                <div className="absolute top-[8%] left-[12%] w-[38%] h-[50%] bg-white rounded-full flex items-center justify-center">
                                  <div className="w-[65%] h-[65%] bg-black rounded-full animate-pulse"></div>
                                </div>
                                <div className="absolute top-[8%] right-[12%] w-[38%] h-[50%] bg-white rounded-full flex items-center justify-center">
                                  <div className="w-[65%] h-[65%] bg-black rounded-full animate-pulse"></div>
                                </div>
                                
                                <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-4 h-6 animate-tongue-flick pointer-events-none">
                                    <div className="w-1 h-full bg-[#ff00ff] mx-auto rounded-full relative">
                                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#ff00ff] rounded-full"></div>
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff00ff] rounded-full"></div>
                                    </div>
                                </div>
                              </div>
                            )}
                          </div>
                      </div>
                  );
              })}

              {/* TARGET NUTRIENT */}
              <div
                  className="absolute z-15 flex items-center justify-center animate-[bounce_1.2s_infinite]"
                  style={{
                      left: `${(food.x / GRID_SIZE) * 100}%`,
                      top: `${(food.y / GRID_SIZE) * 100}%`,
                      width: `${100 / GRID_SIZE}%`,
                      height: `${100 / GRID_SIZE}%`,
                  }}
              >
                  <div className="w-[85%] h-[95%] bg-[#fff8e1] shadow-[0_0_30px_rgba(255,255,255,0.7)] border-4 border-black/10" 
                      style={{ 
                        borderRadius: '50% 50% 50% 50% / 70% 70% 30% 30%',
                        overflow: 'hidden'
                      }}>
                      <div className="absolute top-[15%] left-[25%] w-[30%] h-[30%] bg-white rounded-full opacity-70 blur-[2px]"></div>
                  </div>
              </div>
          </div>

          {/* OVERLAYS */}
          {status === GameStatus.IDLE && (
              <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 p-8 text-center backdrop-blur-xl">
                  <div className="mb-10 w-32 h-32 bg-[#0ff]/10 rounded-full flex items-center justify-center border-4 border-[#0ff] animate-pulse relative">
                      <Target size={64} className="text-[#0ff]" />
                  </div>
                  <h2 className="text-6xl sm:text-8xl text-[#0ff] font-black mb-4 tracking-tighter glitch-text italic" data-text="START_HUNT">START_HUNT</h2>
                  <button 
                    onClick={() => { sfx.ui(); resetGame(); }} 
                    className="cyber-btn px-20 py-8 text-3xl font-black bg-black border-4 border-[#0ff] text-[#0ff] hover:bg-[#0ff] hover:text-black transition-all"
                  >
                      INITIALIZE_BIOME
                  </button>
              </div>
          )}

          {status === GameStatus.GAME_OVER && (
              <div className="absolute inset-0 bg-[#ff00ff]/20 flex flex-col items-center justify-center z-50 backdrop-blur-xl p-8">
                  <div className="bg-black border-4 border-[#ff00ff] p-12 shadow-[30px_30px_0_#ff00ff] max-w-lg w-full text-center relative">
                      <h2 className="text-6xl sm:text-8xl text-[#ff00ff] font-black mb-8 glitch-text" data-text="SYSTEM_VOID">SYSTEM_VOID</h2>
                      <button 
                        onClick={() => { sfx.ui(); resetGame(); }} 
                        className="cyber-btn w-full py-8 text-3xl font-black bg-[#ff00ff] text-black border-none hover:bg-white transition-all"
                      >
                          RELOAD_INSTANCE
                      </button>
                  </div>
              </div>
          )}
      </section>

      {/* FOOTER DIAGNOSTICS */}
      <footer className="h-10 bg-[#050505] border-t border-[#1a1a1a] flex items-center justify-between px-8 z-30 opacity-70">
          <div className="flex gap-6 items-center">
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/50">Tactile_Link: Online</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-white/50">V_Core: 2.2.5_STABLE</span>
          </div>
          <span className="text-[10px] font-black text-[#0ff] animate-pulse">| | | | | | | | |</span>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wobble {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.05) translateY(-3px); }
        }
        @keyframes tongue-flick {
          0%, 80%, 100% { transform: translate(-50%, 100%) scaleY(0); opacity: 0; }
          85%, 95% { transform: translate(-50%, 0) scaleY(1); opacity: 1; }
        }
        .animate-tongue-flick {
          animation: tongue-flick 3s infinite ease-in-out;
        }
        .crt::before {
            pointer-events: none !important;
        }
      `}} />
    </div>
  );
};

export default SnakeGame;