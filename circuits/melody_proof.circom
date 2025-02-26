pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

// Circuit to prove knowledge of a melody without revealing it
template MelodyProof(n) {
    // Private inputs (things we keep secret)
    signal input melody[n]; // The secret melody as an array of note values
    signal input salt;      // A random salt for privacy

    // Public inputs (things everyone can see)
    signal input expectedHash; // The expected hash of the melody and salt

    // Compute hash of the melody and salt
    component hasher = Poseidon(n + 1);
    
    // Feed the melody notes and salt into the hasher
    for (var i = 0; i < n; i++) {
        hasher.inputs[i] <== melody[i];
    }
    hasher.inputs[n] <== salt;
    
    // Verify the hash matches the expected hash
    expectedHash === hasher.out;
}

// We'll use 8 notes for our melody
component main {public [expectedHash]} = MelodyProof(8);
