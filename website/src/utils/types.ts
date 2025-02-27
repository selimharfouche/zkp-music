// website/src/utils/types.ts

// Structure for ZKP proof components
export interface Proof {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
}

// Interface for MelodyVerifier contract
export interface MelodyVerifier {
  verifyProof(
    a: [string, string],
    b: [[string, string], [string, string]],
    c: [string, string],
    input: [string]
  ): Promise<boolean>;
}

// Interface for MelodyRegistry contract
export interface MelodyRegistry {
  registerMelody(
    a: [string, string],
    b: [[string, string], [string, string]],
    c: [string, string],
    input: [string]
  ): Promise<any>;
  
  melodyOwners(melodyHash: string): Promise<string>;
  registrationTimes(melodyHash: string): Promise<number>;
  userMelodies(address: string, index: number): Promise<string>;
}
