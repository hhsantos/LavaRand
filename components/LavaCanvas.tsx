import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { LampBlob, EntropySourceHandle } from '../types';

interface LavaCanvasProps {
  onEntropyUpdate?: (entropyLevel: number) => void;
}

const LavaCanvas = forwardRef<EntropySourceHandle, LavaCanvasProps>(({ onEntropyUpdate }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | null>(null);
  const blobsRef = useRef<LampBlob[]>([]);
  
  // Color palette inspired by the photo provided (Neon reds, oranges, blues, purples)
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#a855f7', '#ec4899'];

  const initBlobs = (width: number, height: number) => {
    const blobCount = 20; // Enough to create chaos
    const newBlobs: LampBlob[] = [];
    for (let i = 0; i < blobCount; i++) {
      newBlobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.5, // Slow horizontal drift
        vy: (Math.random() - 0.5) * 2 + (Math.random() > 0.5 ? -1 : 1), // Vertical movement
        radius: 40 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    blobsRef.current = newBlobs;
  };

  const update = (width: number, height: number) => {
    blobsRef.current.forEach(blob => {
      blob.x += blob.vx;
      blob.y += blob.vy;

      // Bounce off walls
      if (blob.x < -blob.radius) blob.x = width + blob.radius;
      if (blob.x > width + blob.radius) blob.x = -blob.radius;
      
      // Vertical wrapping/bouncing logic to simulate lava lamp flow
      if (blob.y < -blob.radius) {
         blob.y = height + blob.radius;
         blob.vy = Math.abs(blob.vy) * -1; // change direction slightly
      }
      if (blob.y > height + blob.radius) {
         blob.y = -blob.radius;
         blob.vy = Math.abs(blob.vy);
      }
    });
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear with a dark background
    ctx.fillStyle = '#18181b'; // Zinc-900
    ctx.fillRect(0, 0, width, height);

    // Use lighter composite operation to make overlapping colors blend/glow
    ctx.globalCompositeOperation = 'screen';

    blobsRef.current.forEach(blob => {
      const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
      // Fading out edges for "glow" effect
      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
    
    // Simulate camera noise/grain (Digital Sensor Noise)
    // This adds significant entropy at the pixel level that the naked eye might miss
    const imageData = ctx.getImageData(0, 0, width, height);
    // We don't actually modify the canvas for performance, but in a real scenario,
    // we would rely on the slight millisecond variations of the render loop.
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    update(canvas.width, canvas.height);
    draw(ctx, canvas.width, canvas.height);

    requestRef.current = requestAnimationFrame(animate);
  };

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      // Capture the raw pixel data at this exact millisecond
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width;
        canvas.height = height;
        if (blobsRef.current.length === 0) {
            initBlobs(width, height);
        }
      }
    });

    resizeObserver.observe(canvas.parentElement!);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-zinc-900 overflow-hidden rounded-xl">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs text-zinc-300 border border-white/10 pointer-events-none">
        Live Entropy Source: Lava Simulation
      </div>
    </div>
  );
});

export default LavaCanvas;