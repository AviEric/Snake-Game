import React from 'react';
import SnakeGame from './components/SnakeGame';

const App: React.FC = () => {
  return (
    <div className="crt fixed inset-0 bg-[#050505] text-[#0ff] overflow-hidden font-mono selection:bg-[#ff00ff] selection:text-white flex items-center justify-center">
      
      {/* Static Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none z-50" 
           style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")'}}>
      </div>

      {/* PRIMARY EXECUTION CONTEXT */}
      <main className="w-full h-full relative z-10 overflow-hidden bg-black">
          <SnakeGame />
      </main>
    </div>
  );
};

export default App;