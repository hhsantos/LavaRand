import React, { useState, useRef } from 'react';
import LavaCanvas from './components/LavaCanvas';
import WebcamCanvas from './components/WebcamCanvas';
import InfoSection from './components/InfoSection';
import { generateHashFromPixels, generateUUID, generateRandomInt } from './utils/crypto';
import { EntropyLog, GenerationType, EntropySourceHandle } from './types';

type SourceMode = 'LAVA' | 'WEBCAM';

export default function App() {
  const sourceRef = useRef<EntropySourceHandle>(null);
  const [logs, setLogs] = useState<EntropyLog[]>([]);
  const [lastHash, setLastHash] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>('LAVA');

  const generate = async (type: GenerationType) => {
    if (!sourceRef.current) return;
    setIsProcessing(true);

    // 1. Capture Entropy from the "Wall" (either Lava or Webcam)
    const pixelData = sourceRef.current.getSnapshot();
    
    if (pixelData) {
      // 2. Process Entropy (Hash it)
      const seedHash = await generateHashFromPixels(pixelData);
      setLastHash(seedHash);

      // 3. Generate Output based on Type
      let output = '';
      if (type === 'HEX') {
        output = seedHash; // The raw SHA-256 hash is a perfect 256-bit key
      } else if (type === 'UUID') {
        output = generateUUID(seedHash);
      } else if (type === 'INT') {
        output = generateRandomInt(seedHash, 0, 1000000).toString();
      }

      // 4. Log it
      const newLog: EntropyLog = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        seedPreview: seedHash.substring(0, 10) + '...',
        key: output,
        type: type
      };

      setLogs(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
    }
    
    setTimeout(() => setIsProcessing(false), 300); // Small delay for UI effect
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-purple-600 animate-pulse"></div>
            <h1 className="text-xl font-bold tracking-tight">LavaRand <span className="text-zinc-500 font-normal text-sm ml-2">Secure Entropy Generator</span></h1>
          </div>
          <a href="https://www.cloudflare.com/learning/ssl/lava-lamp-encryption/" target="_blank" rel="noreferrer" className="text-xs text-zinc-500 hover:text-white transition-colors">
            Inspired by Cloudflare
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Visualizer & Controls */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Source Switcher */}
          <div className="bg-zinc-900/50 p-1 rounded-lg flex border border-zinc-800">
            <button
              onClick={() => setSourceMode('LAVA')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                sourceMode === 'LAVA' 
                ? 'bg-zinc-700 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Lava Simulation
            </button>
            <button
              onClick={() => setSourceMode('WEBCAM')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                sourceMode === 'WEBCAM' 
                ? 'bg-zinc-700 text-white shadow-sm' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              Webcam Entropy
            </button>
          </div>

          {/* The Entropy Wall */}
          <div className="relative group">
            <div className={`absolute -inset-1 bg-gradient-to-r rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 ${sourceMode === 'LAVA' ? 'from-orange-600 to-purple-600' : 'from-red-600 to-blue-600'}`}></div>
            <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-700">
               {sourceMode === 'LAVA' ? (
                 <LavaCanvas ref={sourceRef} />
               ) : (
                 <WebcamCanvas ref={sourceRef} />
               )}
               
               {isProcessing && (
                 <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] flex items-center justify-center animate-flash pointer-events-none z-10">
                   <span className="text-white font-mono font-bold text-lg bg-black/70 px-4 py-2 rounded">CAPTURING ENTROPY...</span>
                 </div>
               )}
            </div>
            <p className="mt-2 text-xs text-zinc-500 text-center">
              {sourceMode === 'LAVA' 
                ? 'Visualizing Real-Time Digital Fluid Dynamics. Chaos is hashed to generate keys.'
                : 'Capturing Atmospheric Noise and visual data from your environment. Images are never stored.'}
            </p>
          </div>

          {/* Controls */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Generate Secure Output</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => generate('HEX')}
                disabled={isProcessing}
                className="flex flex-col items-center justify-center py-4 px-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg border border-zinc-700 transition-all hover:border-orange-500/50 group"
              >
                <span className="text-orange-400 font-bold text-lg group-hover:scale-110 transition-transform">256-bit Key</span>
                <span className="text-xs text-zinc-500 mt-1">Hex Format</span>
              </button>
              <button 
                 onClick={() => generate('UUID')}
                 disabled={isProcessing}
                 className="flex flex-col items-center justify-center py-4 px-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg border border-zinc-700 transition-all hover:border-purple-500/50 group"
              >
                <span className="text-purple-400 font-bold text-lg group-hover:scale-110 transition-transform">UUID v4</span>
                <span className="text-xs text-zinc-500 mt-1">Identifier</span>
              </button>
              <button 
                 onClick={() => generate('INT')}
                 disabled={isProcessing}
                 className="flex flex-col items-center justify-center py-4 px-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg border border-zinc-700 transition-all hover:border-blue-500/50 group"
              >
                <span className="text-blue-400 font-bold text-lg group-hover:scale-110 transition-transform">Integer</span>
                <span className="text-xs text-zinc-500 mt-1">0 - 1,000,000</span>
              </button>
            </div>
          </div>

          {/* Last Hash Debug */}
          {lastHash && (
             <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg overflow-hidden">
                <p className="text-xs text-zinc-500 mb-1">Latest Entropy Snapshot (SHA-256 of Source):</p>
                <code className="text-[10px] text-green-500 break-all font-mono">{lastHash}</code>
             </div>
          )}
        </div>

        {/* RIGHT COLUMN: Info & Logs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Logs */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-0 overflow-hidden flex flex-col max-h-[400px]">
             <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex justify-between items-center">
                <h3 className="font-semibold text-zinc-200">Generated Keys</h3>
                <span className="text-xs text-zinc-500">{logs.length} items</span>
             </div>
             <div className="overflow-y-auto p-2 flex-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
               {logs.length === 0 ? (
                 <div className="text-center py-12 text-zinc-600 text-sm">
                   No keys generated yet.<br/>Interact with the simulation.
                 </div>
               ) : (
                 <div className="flex flex-col gap-2">
                   {logs.map((log) => (
                     <div key={log.id} className="p-3 rounded bg-black/40 border border-zinc-800 flex flex-col gap-1 animate-fadeIn">
                        <div className="flex justify-between items-center">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                log.type === 'HEX' ? 'bg-orange-900/30 text-orange-400' : 
                                log.type === 'UUID' ? 'bg-purple-900/30 text-purple-400' : 
                                'bg-blue-900/30 text-blue-400'
                            }`}>{log.type}</span>
                            <span className="text-[10px] text-zinc-600 font-mono">{log.timestamp}</span>
                        </div>
                        <code className="font-mono text-sm text-zinc-300 break-all select-all hover:text-white transition-colors cursor-text">
                          {log.key}
                        </code>
                        <div className="text-[10px] text-zinc-600 truncate mt-1">
                           Seed: {log.seedPreview}
                        </div>
                     </div>
                   ))}
                 </div>
               )}
             </div>
          </div>

          {/* Educational Content */}
          <InfoSection />

        </div>
      </main>
    </div>
  );
}