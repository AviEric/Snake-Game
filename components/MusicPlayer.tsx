import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Activity, Cpu } from 'lucide-react';
import { TRACKS } from '../constants';

interface MusicPlayerProps {
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ currentTrackIndex, setCurrentTrackIndex }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
            console.error("Autoplay prevented:", e);
            setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const playNext = () => {
    setCurrentTrackIndex((currentTrackIndex + 1) % TRACKS.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const playPrev = () => {
    setCurrentTrackIndex((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    if (audioRef.current && audioRef.current.duration) {
        audioRef.current.currentTime = (newVal / 100) * audioRef.current.duration;
        setProgress(newVal);
    }
  };

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Info Display */}
      <div className="border-2 border-[#333] bg-[#050505] mb-4 relative overflow-hidden h-24 p-2 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
        {/* Background Grid inside display */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{backgroundImage: 'linear-gradient(#0ff 1px, transparent 1px), linear-gradient(90deg, #0ff 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <span className="bg-[#ff00ff] text-black text-[10px] px-1 font-bold">PLAYING_NOW</span>
                <Cpu size={16} className="text-[#333]" />
            </div>
            
            <div className="overflow-hidden whitespace-nowrap">
                <h3 className="text-2xl font-bold text-white uppercase truncate tracking-tight">{currentTrack.title}</h3>
                <p className="text-[#0ff] font-mono text-xs uppercase tracking-widest">// {currentTrack.artist}</p>
            </div>
        </div>
      </div>

      {/* Progress Bar - Raw Style */}
      <div className="mb-6 relative group">
         <div className="flex justify-between text-[10px] text-gray-500 font-mono mb-1">
            <span>00:00</span>
            <span>{currentTrack.duration}</span>
         </div>
         <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-6 appearance-none bg-[#111] border border-[#333] focus:outline-none focus:border-[#0ff] transition-colors"
          />
          {/* Custom fill imitation using styles is hard with range, relying on global CSS thumb styling */}
      </div>

      {/* Controls Container */}
      <div className="grid grid-cols-5 gap-2">
           {/* Prev */}
           <button onClick={playPrev} className="cyber-btn h-12 flex items-center justify-center hover:bg-[#0ff] hover:text-black">
               <SkipBack size={20} />
           </button>

           {/* Play/Pause - Larger */}
           <button onClick={togglePlay} className="col-span-2 cyber-btn h-12 flex items-center justify-center bg-[#0ff]/10 border-[#0ff] text-white">
               {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
           </button>

           {/* Next */}
           <button onClick={playNext} className="cyber-btn h-12 flex items-center justify-center hover:bg-[#0ff] hover:text-black">
               <SkipForward size={20} />
           </button>

           {/* Volume Toggle */}
           <button onClick={() => setIsMuted(!isMuted)} className="cyber-btn h-12 flex items-center justify-center text-gray-400 hover:text-white">
               {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
           </button>
      </div>
      
      {/* Volume Slider */}
      <div className="mt-4 flex items-center gap-2">
         <span className="text-[10px] text-[#0ff] font-bold">VOL</span>
         <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
            className="w-full h-2 bg-[#111] border border-[#333]"
         />
      </div>

      {/* Visualizer Mock */}
      <div className="mt-6 flex items-end justify-between h-12 gap-[2px] opacity-80 border-b border-[#333] pb-1">
            {[...Array(25)].map((_, i) => (
                <div 
                    key={i} 
                    className="w-full bg-[#ff00ff]"
                    style={{ 
                        height: isPlaying ? `${Math.random() * 100}%` : '5%',
                        opacity: isPlaying ? 1 : 0.3,
                        transition: 'height 0.05s ease'
                    }}
                />
            ))}
        </div>
    </div>
  );
};

export default MusicPlayer;