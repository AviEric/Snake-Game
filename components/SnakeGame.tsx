import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw } from 'lucide-react';
import { GameStatus, Direction, Position } from '../types';
import { GRID_SIZE, CELL_SIZE, INITIAL_SNAKE_SPEED, SPEED_INCREMENT } from '../constants';

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const getRandomPosition = (): Position => {
  return {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SNAKE_SPEED);

  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Direction>(Direction.UP);

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

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(getRandomPosition());
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    setScore(0);
    setSpeed(INITIAL_SNAKE_SPEED);
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

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
      ) {
        setStatus(GameStatus.GAME_OVER);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setFood(getRandomPosition());
        setSpeed((s) => Math.max(50, s - SPEED_INCREMENT));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': if (directionRef.current !== Direction.DOWN) { setDirection(Direction.UP); directionRef.current = Direction.UP; } break;
        case 'ArrowDown': case 's': if (directionRef.current !== Direction.UP) { setDirection(Direction.DOWN); directionRef.current = Direction.DOWN; } break;
        case 'ArrowLeft': case 'a': if (directionRef.current !== Direction.RIGHT) { setDirection(Direction.LEFT); directionRef.current = Direction.LEFT; } break;
        case 'ArrowRight': case 'd': if (directionRef.current !== Direction.LEFT) { setDirection(Direction.RIGHT); directionRef.current = Direction.RIGHT; } break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      gameLoopRef.current = window.setInterval(moveSnake, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [status, moveSnake, speed]);

  const scoreStr = score.toString().padStart(4, '0');
  const highScoreStr = highScore.toString().padStart(4, '0');

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* HUD - Raw Text */}
      <div className="flex justify-between items-end w-full max-w-[500px] mb-6 font-mono relative">
        <div className="border-l-4 border-[#0ff] pl-2">
            <div className="text-xs text-[#0ff] font-bold">SCORE_BUFFER</div>
            <div className="text-5xl font-black text-white glitch-text" data-text={scoreStr}>{scoreStr}</div>
        </div>
        <div className="border-r-4 border-[#ff00ff] pr-2 text-right">
            <div className="text-xs text-[#ff00ff] font-bold">MAX_MEMORY</div>
            <div className="text-5xl font-black text-white glitch-text" data-text={highScoreStr}>{highScoreStr}</div>
        </div>
      </div>

      {/* Game Board */}
      <div className="relative p-1 bg-[#111] border-2 border-[#333] shadow-[10px_10px_0_#0ff]">
        {/* Decorative corner markers */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#ff00ff] z-20"></div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#ff00ff] z-20"></div>

        <div 
            className="relative bg-black overflow-hidden"
            style={{ 
                width: GRID_SIZE * CELL_SIZE, 
                height: GRID_SIZE * CELL_SIZE,
            }}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)`,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
            }}
          ></div>

          {/* Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
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
                className="absolute"
                style={{
                  left: segment.x * CELL_SIZE,
                  top: segment.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  zIndex: isHead ? 10 : 1,
                  // Raw colors, no transparency in body for "glitch" feel
                  backgroundColor: isHead ? '#0ff' : (index % 2 === 0 ? '#00aaaa' : '#008888'),
                  // Triangle head
                  ...(isHead ? {
                      clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                      transform: `rotate(${rotation}deg) scale(0.9)`,
                      filter: 'drop-shadow(0 0 4px #0ff)',
                      mixBlendMode: 'normal'
                  } : {
                      transform: 'scale(0.95)', // Blocky segments
                  })
                }}
              />
            );
          })}

          {/* Glitching Food */}
          <div
            className="absolute"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          >
             <div className="w-full h-full bg-[#ff00ff] animate-pulse" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}></div>
          </div>

          {/* Overlays */}
          {status === GameStatus.IDLE && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-30">
              <h2 className="text-4xl text-[#0ff] font-black tracking-tighter mb-8 glitch-text" data-text="READY?">READY?</h2>
              <button onClick={resetGame} className="cyber-btn px-8 py-4 font-bold text-xl flex items-center gap-2 group">
                <Play className="w-6 h-6 group-hover:fill-[#000]" />
                INITIALIZE
              </button>
            </div>
          )}

          {status === GameStatus.GAME_OVER && (
            <div className="absolute inset-0 bg-[#ff00ff]/20 flex flex-col items-center justify-center z-30 backdrop-blur-sm">
              <div className="bg-black border-2 border-[#ff00ff] p-8 text-center shadow-[8px_8px_0_#000]">
                  <h2 className="text-5xl text-[#ff00ff] font-black mb-2 glitch-text" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                  <div className="text-xl text-white font-mono mb-8 border-t border-b border-[#333] py-2">SCORE: {score}</div>
                  <button onClick={resetGame} className="cyber-btn px-8 py-3 w-full font-bold flex justify-center items-center gap-2">
                    <RotateCcw className="w-5 h-5" />
                    SYSTEM_RESET
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;