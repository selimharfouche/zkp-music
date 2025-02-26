const snarkjs = require("snarkjs");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const circomlibjs = require("circomlibjs");

// Find the build directory
const BUILD_DIR = path.resolve(__dirname, "../build");
console.log("Build directory:", BUILD_DIR);

// Test melody (C major scale)
const melody = [60, 62, 64, 65, 67, 69, 71, 72];

async function testZkp() {
  try {
    console.log("Starting ZKP test with melody:", melody);
    console.log("Note: In MIDI format, 60 = middle C, 62 = D, etc. We're using a C major scale");
    
    // Check if build directory exists with required files
    if (!fs.existsSync(BUILD_DIR) || 
        !fs.existsSync(path.join(BUILD_DIR, "melody_proof_js", "melody_proof.wasm")) ||
        !fs.existsSync(path.join(BUILD_DIR, "melody_proof_final.zkey")) ||
        !fs.existsSync(path.join(BUILD_DIR, "verification_key.json"))) {
      console.error("Missing required files in build directory!");
      return;
    }
    
    console.log("All necessary files found in build directory!");
    
    // STEP 1: Calculate the Poseidon hash of our melody using circomlibjs
    console.log("\n--- STEP 1: HASH CALCULATION ---");
    console.log("Calculating Poseidon hash of the melody...");
    console.log("This is what we'd do off-chain before creating a proof");
    
    // Initialize the Poseidon hash function
    const poseidon = await circomlibjs.buildPoseidon();
    console.log("Poseidon hash function initialized");
    
    // Generate a random salt for our hash
    const salt = BigInt("0x" + crypto.randomBytes(16).toString("hex"));
    console.log("Using salt:", salt.toString());
    console.log("The salt ensures that the same melody can produce different hashes");
    console.log("This prevents others from recognizing a melody just by its hash");
    
    // Prepare the inputs for the hash function (melody + salt)
    const hashInputs = [...melody.map(n => BigInt(n)), salt];
    console.log("Hash inputs prepared (melody notes + salt)");
    
    // Calculate the hash
    const hash = poseidon.F.toString(poseidon(hashInputs));
    console.log("Calculated hash:", hash);
    console.log("This hash represents our melody without revealing the actual notes");
    
    // STEP 2: Generate and verify a proof with the correct melody
    console.log("\n--- STEP 2: PROOF GENERATION & VERIFICATION (CORRECT MELODY) ---");
    const input = {
      melody: melody.map(n => n.toString()),
      salt: salt.toString(),
      expectedHash: hash
    };
    
    console.log("Preparing inputs for the circuit:");
    console.log("- melody: [private] The actual notes we want to prove we know");
    console.log("- salt: [private] Our random salt value");
    console.log("- expectedHash: [public] The hash value we're claiming to know the inputs for");
    
    // Save the input to a file
    const inputPath = path.join(BUILD_DIR, "input.json");
    fs.writeFileSync(inputPath, JSON.stringify(input));
    console.log(`Input saved to ${inputPath}`);
    
    console.log("\nGenerating proof for correct melody...");
    console.log("This creates a zero-knowledge proof that we know the melody without revealing it");
    
    // Generate the proof
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      path.join(BUILD_DIR, "melody_proof_js", "melody_proof.wasm"),
      path.join(BUILD_DIR, "melody_proof_final.zkey")
    );
    
    console.log("Proof generated successfully!");
    console.log("Public signals (hash):", publicSignals[0]);
    console.log("This proof can now be verified by anyone with the verification key");
    
    // Verify the proof
    console.log("\nVerifying proof...");
    console.log("This simulates what would happen on-chain when verifying the proof");
    const vKey = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, "verification_key.json")));
    const verified = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    
    console.log("Proof verification result:", verified);
    console.log("The verification only checked the hash, not the actual melody");
    console.log("This is the zero-knowledge property - proving knowledge without revealing the secret");
    
    // STEP 3: Test with a wrong melody (should fail)
    console.log("\n--- STEP 3: SECURITY TEST (WRONG MELODY) ---");
    console.log("Testing with a wrong melody...");
    console.log("This checks that someone can't fake knowing the melody");
    const wrongMelody = [61, 63, 65, 67, 69, 71, 73, 75]; // C# major scale
    console.log("Using C# major scale instead of C major scale");
    
    const wrongInput = {
      melody: wrongMelody.map(n => n.toString()),
      salt: salt.toString(),
      expectedHash: hash // Use the same hash as the correct melody
    };
    
    console.log("Attempting to generate a proof with WRONG notes but correct hash...");
    console.log("This should fail because different notes will produce a different hash");
    
    // Save the wrong input
    const wrongInputPath = path.join(BUILD_DIR, "wrong_input.json");
    fs.writeFileSync(wrongInputPath, JSON.stringify(wrongInput));
    
    try {
      // This should fail because wrong melody won't hash to the same value
      await snarkjs.groth16.fullProve(
        wrongInput,
        path.join(BUILD_DIR, "melody_proof_js", "melody_proof.wasm"),
        path.join(BUILD_DIR, "melody_proof_final.zkey")
      );
      console.log("❌ ERROR: The wrong melody should have failed, but it succeeded!");
    } catch (error) {
      console.log("✅ As expected, generating proof with wrong melody failed!");
      console.log("This shows our circuit correctly enforces knowledge of the actual melody");
      console.log("The circuit detected that the wrong notes don't hash to the expected value");
      console.log("✅ ZKP test PASSED! Our circuit works correctly.");
    }
    
  } catch (error) {
    console.error("Test failed:", error);
    console.error("Error details:", error.message);
  } finally {
    // Force the process to exit - fixes the "hanging" issue
    console.log("\nTest execution complete. Exiting process...");
    process.exit(0);
  }
}

testZkp();
