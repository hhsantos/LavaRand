import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { EntropySourceHandle } from '../types';

const WebcamCanvas = forwardRef<EntropySourceHandle, {}>((props, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const startWebcam = async () => {
    if (isRequesting) return;
    setIsRequesting(true);
    setError(null);

    let stream: MediaStream | null = null;
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser API not supported");
      }

      // Use specific constraints optimized for the ZZ3 camera
      // Try MJPEG format first (better compatibility), fallback to default
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            width: { ideal: 640, min: 320 },
            height: { ideal: 480, min: 240 },
            frameRate: { ideal: 30, min: 10 },
            facingMode: 'user'
          },
          audio: false
        });
      } catch (e) {
        // Fallback to simplest constraints
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
      }
      
      // Check if component unmounted while we were waiting
      if (!videoRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      // Log stream information
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      console.log('Camera stream obtained:', {
        label: videoTrack.label,
        settings: settings,
        capabilities: videoTrack.getCapabilities()
      });
      
      videoRef.current.srcObject = stream;
      
      // Wait for metadata to load before playing
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error('Video element lost'));
          return;
        }
        
        const video = videoRef.current;
        
        const onLoadedMetadata = () => {
          console.log('Video metadata loaded:', {
            width: video.videoWidth,
            height: video.videoHeight,
            readyState: video.readyState
          });
          resolve();
        };
        
        const onError = (e: Event) => {
          console.error('Video error:', e);
          reject(new Error('Video failed to load'));
        };
        
        video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        video.addEventListener('error', onError, { once: true });
        
        // Timeout after 10 seconds
        setTimeout(() => {
          video.removeEventListener('loadedmetadata', onLoadedMetadata);
          video.removeEventListener('error', onError);
          reject(new Error('Video load timeout'));
        }, 10000);
      });
      
      // Now play the video
      await videoRef.current.play();
      
      console.log('Video playing, dimensions:', {
        videoWidth: videoRef.current.videoWidth,
        videoHeight: videoRef.current.videoHeight
      });
      
      setStreamActive(true);

    } catch (err: any) {
      console.error("Webcam init error:", err);
      
      // Cleanup any partial stream
      if (stream) {
        (stream as MediaStream).getTracks().forEach(track => track.stop());
      }

      let msg = "Could not access camera.";
      const errorMsg = (err.message || "").toLowerCase();
      const errorName = err.name || "";

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorMsg.includes('permission denied')) {
        msg = "Permission Denied. Please allow camera access in your browser address bar AND your System Preferences (Privacy & Security).";
      } else if (errorName === 'NotFoundError') {
        msg = "No camera device found.";
      } else if (errorName === 'NotReadableError') {
        msg = "Camera is in use by another app.";
      } else {
        msg = errorMsg || "Unknown camera error.";
      }
      
      setError(msg);
      setStreamActive(false);
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    startWebcam();

    return () => {
      // Robust cleanup
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setStreamActive(false);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getSnapshot: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !streamActive) return null;

      // Match dimensions
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // Draw frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Return raw pixel data
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    }
  }));

  return (
    <div className="relative w-full h-full bg-zinc-900 overflow-hidden rounded-xl flex items-center justify-center">
      {error ? (
        <div className="text-center p-6 bg-zinc-900 w-full h-full flex flex-col items-center justify-center animate-fadeIn z-20">
          <div className="text-red-500 font-bold mb-2">Camera Access Failed</div>
          <div className="text-zinc-400 text-xs mb-4 max-w-xs leading-relaxed">{error}</div>
          <button 
            onClick={startWebcam}
            disabled={isRequesting}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-white transition-colors border border-zinc-700 disabled:opacity-50"
          >
            {isRequesting ? 'Requesting...' : 'Grant Permission & Retry'}
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full object-cover"
            style={{ 
              backgroundColor: '#18181b',
              transform: 'scaleX(-1)',
              zIndex: 1
            }}
            autoPlay
            playsInline 
            muted
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              console.log('Video loaded in DOM:', {
                videoWidth: video.videoWidth,
                videoHeight: video.videoHeight,
                readyState: video.readyState,
                paused: video.paused,
                currentTime: video.currentTime
              });
              
              // Test if video is actually rendering by checking pixel data
              setTimeout(() => {
                const testCanvas = document.createElement('canvas');
                testCanvas.width = video.videoWidth;
                testCanvas.height = video.videoHeight;
                const testCtx = testCanvas.getContext('2d');
                if (testCtx) {
                  testCtx.drawImage(video, 0, 0);
                  const imageData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height);
                  const pixels = imageData.data;
                  let totalBrightness = 0;
                  for (let i = 0; i < pixels.length; i += 4) {
                    totalBrightness += (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
                  }
                  const avgBrightness = totalBrightness / (pixels.length / 4);
                  console.log('Video frame analysis:', {
                    avgBrightness,
                    totalPixels: pixels.length / 4,
                    firstPixels: Array.from(pixels.slice(0, 12))
                  });
                  
                  if (avgBrightness < 1) {
                    console.warn('⚠️ Video is completely black! Camera might not be sending data.');
                  }
                }
              }, 500);
            }}
            onPlay={() => console.log('Video started playing')}
            onError={(e) => console.error('Video element error:', e)}
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
          
          <div className={`absolute bottom-4 left-4 backdrop-blur-md px-3 py-1 rounded-full text-xs border flex items-center gap-2 pointer-events-none z-10 transition-colors ${streamActive ? 'bg-red-900/80 text-red-200 border-red-500/30' : 'bg-zinc-800/80 text-zinc-400 border-zinc-700'}`}>
            <span className={`w-2 h-2 rounded-full ${streamActive ? 'bg-red-500 animate-pulse' : 'bg-zinc-500'}`}></span>
            {streamActive ? 'Live Entropy Source: Webcam' : 'Initializing Camera...'}
          </div>
        </>
      )}
    </div>
  );
});

export default WebcamCanvas;