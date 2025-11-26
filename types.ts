export interface EntropyLog {
  id: string;
  timestamp: string;
  seedPreview: string; // A snippet of the raw pixel data hash
  key: string; // The final generated key
  type: 'HEX' | 'UUID' | 'INT';
}

export interface LampBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export type GenerationType = 'HEX' | 'UUID' | 'INT';

export interface EntropySourceHandle {
  getSnapshot: () => Uint8ClampedArray | null;
}