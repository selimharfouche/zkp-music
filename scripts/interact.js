// Script to interact with our deployed contracts
const { ethers } = require("hardhat");
const fs = require("fs");
const snarkjs = require("snarkjs");
const circomlibjs = require("circomlibjs");

// These would be the addresses from your deployment
// Replace with your actual deployed contract addresses
const VERIFIER_ADDRESS = "YOUR_VERIFIER_CONTRACT_ADDRESS";
const REGISTRY_ADDRESS = "YOUR_REGISTRY_CONTRACT_ADDRESS";

async function main() {
  // Get the signer
  const [signer] = await ethers.getSigners();
  console.log(`Interacting with contracts using account: ${signer.address}`);
  
  // Connect to the deployed contracts
  const verifier = await ethers.getContractAt("MelodyVerifier", VERIFIER_ADDRESS, signer);
  const registry = await ethers.getContractAt("MelodyRegistry", REGISTRY_ADDRESS, signer);
  
  // Example: Generate a hash and proof for a melody
  console.log("Generating hash and proof for a test melody...");
  
  // Example melody (C major scale)
  const melody = [60, 62, 64, 65, 67, 69, 71, 72];
  const salt = BigInt("0x" + require('crypto').randomBytes(16).toString("hex"));
  
  // Initialize the Poseidon hash function
  const poseidon = await circomlibjs.buildPoseidon();
  
  // Calculate the hash
  const hashInputs = [...melody.map(n => BigInt(n)), salt];
  const hash = poseidon.F.toString(poseidon(hashInputs));
  console.log(`Generated melody hash: ${hash}`);
  
  // Now we would generate a ZK proof
  // In a real implementation, this would call snarkjs with our circuit
  console.log("Generating ZK proof for the melody...");
  
  // For demonstration purposes, let's simulate a proof
  // In a real application, you would use snarkjs to generate the actual proof
  const simulatedProof = {
    a: [1, 2],
    b: [[3, 4], [5, 6]],
    c: [7, 8]
  };
  
  // Register the melody
  console.log("Registering the melody on-chain...");
  
  try {
    // This is a simulated call - in reality we would use the actual proof
    // const tx = await registry.registerMelody(
    //   simulatedProof.a, 
    //   simulatedProof.b, 
    //   simulatedProof.c, 
    //   [hash]
    // );
    // await tx.wait();
    
    console.log(`In a real implementation, we would now register the melody with hash: ${hash}`);
    console.log("This would require a properly generated ZK proof from our circuit");
    
    // Instead, let's just check if our contracts are accessible
    const melodyCount = await registry.getMelodyCount(signer.address);
    console.log(`Current melody count for ${signer.address}: ${melodyCount.toString()}`);
    
    console.log("\nNext steps would be:");
    console.log("1. Generate proper ZK proofs using our circuit");
    console.log("2. Register melodies with these proofs");
    console.log("3. Create a web interface to interact with these contracts");
  } catch (error) {
    console.error("Error interacting with contracts:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
