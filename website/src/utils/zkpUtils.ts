// website/src/utils/zkpUtils.ts
// Zero-knowledge proof utility functions for hashing and proof generation

// Dynamic imports of libraries
let snarkjs: any;
let circomlibjs: any;

// Dynamically import libraries on client side
const loadLibraries = async () => {
  if (typeof window !== 'undefined') {
    if (!snarkjs) {
      snarkjs = await import('snarkjs');
    }
    if (!circomlibjs) {
      circomlibjs = await import('circomlibjs');
    }
  }
};

/**
 * Calculates the Poseidon hash of a melody and salt
 */
export const calculateMelodyHash = async (melody: number[], salt: bigint): Promise<string> => {
  await loadLibraries();
  
  try {
    console.log("Loading Poseidon hasher...");
    // Build Poseidon hasher
    const poseidon = await circomlibjs.buildPoseidon();
    console.log("Poseidon hasher loaded");
    
    if (!poseidon) {
      throw new Error("Failed to initialize Poseidon hasher");
    }
    
    // Prepare inputs (melody + salt)
    const hashInputs = [...melody.map(n => BigInt(n)), salt];
    console.log("Hash inputs prepared:", hashInputs.map(n => n.toString()));
    
    // Calculate hash
    const hashResult = poseidon(hashInputs);
    console.log("Raw hash result obtained");
    
    if (!hashResult) {
      throw new Error("Hash calculation failed");
    }
    
    // Convert to string
    const hash = poseidon.F.toString(hashResult);
    console.log("Final hash:", hash);
    
    if (!hash || hash.length === 0) {
      throw new Error("Hash conversion to string failed");
    }
    
    return hash;
  } catch (error) {
    console.error("Error in calculateMelodyHash:", error);
    throw new Error(`Failed to calculate melody hash: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generates a random salt value
 */
export const generateSalt = (): bigint => {
  if (typeof window === 'undefined') {
    // Fallback for server-side rendering
    return BigInt("0x1234567890abcdef1234567890abcdef");
  }
  
  // Generate 16 random bytes
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  
  // Convert to hex string
  let hexString = '0x';
  for (let i = 0; i < array.length; i++) {
    hexString += array[i].toString(16).padStart(2, '0');
  }
  
  // Convert to BigInt
  return BigInt(hexString);
};

/**
 * Generates a ZKP for a melody and hash
 */
export const generateProof = async (
  melody: number[], 
  salt: bigint, 
  melodyHash: string
): Promise<any> => {
  await loadLibraries();
  
  // Create input for the proof
  const input = {
    melody: melody.map(n => n.toString()),
    salt: salt.toString(),
    expectedHash: melodyHash
  };
  
  try {
    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      '/circuits/melody_proof.wasm',
      '/circuits/melody_proof_final.zkey'
    );
    
    // Format the proof for the smart contract
    return {
      a: [proof.pi_a[0], proof.pi_a[1]],
      b: [[proof.pi_b[0][0], proof.pi_b[0][1]], [proof.pi_b[1][0], proof.pi_b[1][1]]],
      c: [proof.pi_c[0], proof.pi_c[1]]
    };
  } catch (error) {
    console.error('Error generating proof:', error);
    throw error;
  }
};

/**
 * Converts the melody notes to MIDI values
 */
export const notesToMIDI = (notes: string[]): number[] => {
  // Map of note names to MIDI values (assuming middle C is C4 = MIDI 60)
  const noteMap: Record<string, number> = {
    'C3': 48, 'C#3': 49, 'D3': 50, 'D#3': 51, 'E3': 52, 'F3': 53, 
    'F#3': 54, 'G3': 55, 'G#3': 56, 'A3': 57, 'A#3': 58, 'B3': 59,
    'C4': 60, 'C#4': 61, 'D4': 62, 'D#4': 63, 'E4': 64, 'F4': 65, 
    'F#4': 66, 'G4': 67, 'G#4': 68, 'A4': 69, 'A#4': 70, 'B4': 71,
    'C5': 72, 'C#5': 73, 'D5': 74, 'D#5': 75, 'E5': 76, 'F5': 77, 
    'F#5': 78, 'G5': 79, 'G#5': 80, 'A5': 81, 'A#5': 82, 'B5': 83
  };
  
  return notes.map(note => noteMap[note] || 0);
};