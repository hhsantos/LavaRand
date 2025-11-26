// Uses the Web Crypto API to generate a SHA-256 hash from the pixel data
export async function generateHashFromPixels(pixelData: Uint8ClampedArray): Promise<string> {
  // Create a buffer from the pixel data
  const dataBuffer = new Uint8Array(pixelData.buffer);
  
  // Add a timestamp nonce to ensure even static images produce different hashes over time
  const timestamp = new TextEncoder().encode(Date.now().toString());
  const combinedBuffer = new Uint8Array(dataBuffer.length + timestamp.length);
  combinedBuffer.set(dataBuffer);
  combinedBuffer.set(timestamp, dataBuffer.length);

  // Hash the data
  const hashBuffer = await crypto.subtle.digest('SHA-256', combinedBuffer);
  
  // Convert to Hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export function generateUUID(seedHash: string): string {
  // Use the high-entropy hash to formulate a UUID-like structure
  // standard UUID: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  const p1 = seedHash.substring(0, 8);
  const p2 = seedHash.substring(8, 12);
  const p3 = '4' + seedHash.substring(13, 16);
  const p4 = (parseInt(seedHash.charAt(16), 16) & 0x3 | 0x8).toString(16) + seedHash.substring(17, 20);
  const p5 = seedHash.substring(20, 32);
  
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export function generateRandomInt(seedHash: string, min: number, max: number): number {
  // Take the first 8 characters (32 bits) of the hash to create an integer seed
  const seedInt = parseInt(seedHash.substring(0, 8), 16);
  // Normalize to 0-1
  const randomFloat = seedInt / 0xFFFFFFFF;
  return Math.floor(randomFloat * (max - min + 1)) + min;
}