import React, { useState } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';
import { TRACKS } from './constants';
import { Disc3, ListMusic, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showTracklist, setShowTracklist] = useState(false);

  return (
    <div className="crt min-h-screen bg-black text-[#0ff] flex flex-col md:flex-row overflow-hidden font-mono relative selection:bg-[#ff00ff] selection:text-white">
      
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-40" 
           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}>
      </div>

      {/* Raw Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
            backgroundImage: `
                linear-gradient(transparent 95%, rgba(0, 255, 255, 0.2) 95%),
                linear-gradient(90deg, transparent 95%, rgba(255, 0, 255, 0.2) 95%)
            `,
            backgroundSize: '40px 40px',
            transform: 'perspective(1000px) rotateX(10deg) scale(1.1)',
        }}
      ></div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 p-4 min-h-[600px] border-r-2 border-[#0ff]/20">
        
        {/* Glitch Title */}
        <div className="mb-12 text-center relative group">
            <h1 
                className="text-6xl md:text-8xl font-black text-white glitch-text brand-font tracking-tighter"
                data-text="NEON_SNAKE"
                style={{ textShadow: '4px 4px 0 #ff00ff' }}
            >
                NEON_SNAKE
            </h1>
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#ff00ff] tracking-[0.5em] mt-4 bg-black/50 p-2 border border-[#0ff]">
                <span>SYSTEM_OVERRIDE</span>
                <span className="w-3 h-3 bg-[#0ff] animate-ping"></span>
                <span>V.0.9.1.BETA</span>
            </div>
        </div>

        {/* The Game */}
        <div className="w-full max-w-2xl relative z-20">
            <SnakeGame />
        </div>
      </main>

      {/* Sidebar / Bottom Bar for Music */}
      <aside className={`
        fixed bottom-0 left-0 right-0 md:relative md:w-[400px] md:h-screen 
        bg-black md:bg-black/90 border-t-4 md:border-t-0 md:border-l-4 border-[#0ff] 
        transition-all duration-100 ease-linear z-30
        flex flex-col shadow-[-10px_0_30px_rgba(0,255,255,0.1)]
      `}>
        {/* Header */}
        <div className="hidden md:flex items-center gap-4 p-6 border-b-2 border-[#333] bg-[#111]">
            <div className="p-2 border border-[#ff00ff] shadow-[2px_2px_0_#0ff]">
                <Terminal className="text-[#ff00ff]" size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white brand-font tracking-widest">AUDIO_DECK</h2>
                <p className="text-xs text-[#0ff] bg-[#000] inline-block px-1 mt-1">STATUS: ONLINE</p>
            </div>
        </div>

        {/* Mobile Toggle */}
        <button 
            className="md:hidden absolute -top-12 right-4 bg-black p-3 text-[#0ff] border-2 border-[#0ff] shadow-[4px_4px_0_#ff00ff] active:translate-y-1 active:shadow-none transition-all"
            onClick={() => setShowTracklist(!showTracklist)}
        >
            <ListMusic size={20} />
        </button>

        {/* Track List */}
        <div className={`
            flex-1 overflow-y-auto p-0 space-y-0
            ${showTracklist ? 'block h-80 border-b-4 border-[#0ff]' : 'hidden md:block h-0'}
            transition-all duration-300
        `}>
            {TRACKS.map((track, idx) => (
                <div 
                    key={track.id}
                    onClick={() => setCurrentTrackIndex(idx)}
                    className={`
                        p-4 cursor-pointer flex items-center gap-4 group transition-all
                        border-b border-[#333] hover:bg-[#0ff] hover:text-black
                        ${currentTrackIndex === idx ? 'bg-[#0ff]/10 text-[#0ff] border-l-4 border-l-[#ff00ff]' : 'text-gray-500'}
                    `}
                >
                    <div className="font-mono text-xs opacity-50">
                        {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold uppercase tracking-wider truncate group-hover:translate-x-2 transition-transform">
                            {track.title}
                        </div>
                        <div className="text-xs font-mono group-hover:text-black/70">
                            //{track.artist}
                        </div>
                    </div>
                    <div className="text-xs font-bold font-mono">
                        [{track.duration}]
                    </div>
                </div>
            ))}
        </div>

        {/* Player Controls */}
        <div className="p-6 bg-black border-t-4 border-[#ff00ff]">
            <MusicPlayer 
                currentTrackIndex={currentTrackIndex} 
                setCurrentTrackIndex={setCurrentTrackIndex} 
            />
        </div>
      </aside>
    </div>
  );
};

export default App;