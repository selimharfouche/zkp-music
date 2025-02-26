#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

echo "Project root: $ROOT_DIR"

# Create build directory
mkdir -p circuits/build
echo "Created build directory at $ROOT_DIR/circuits/build"

# Compile the circuit
echo "Compiling circuit..."
echo "This converts our human-readable circuit into formats a computer can process..."
circom circuits/melody_proof.circom --r1cs --wasm --sym -o circuits/build

# Navigate to build directory
cd circuits/build
echo "Now in: $(pwd)"

# Start a new powers of tau ceremony
echo "Starting powers of tau ceremony..."
echo "This creates the cryptographic parameters needed for our zero-knowledge proofs"
echo "It's like creating a one-way mathematical lock that no one can reverse-engineer"
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Contribute to the ceremony (you'll need to type random text here)
echo "Please enter random text for contribution when prompted..."
echo "Your random input adds unpredictability to the system, increasing security"
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v

# Phase 2
echo "Preparing phase 2..."
echo "Moving from generic parameters to circuit-specific parameters..."
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

# Generate a zKey
echo "Setting up circuit..."
echo "Creating the specific proving and verification keys for our melody proof system"
snarkjs groth16 setup melody_proof.r1cs pot12_final.ptau melody_proof_0000.zkey

# Contribute to phase 2 (you'll need to type random text again)
echo "Please enter random text for contribution when prompted..."
echo "Adding additional randomness to make the circuit-specific parameters secure"
snarkjs zkey contribute melody_proof_0000.zkey melody_proof_final.zkey --name="1st Contributor" -v

# Export the verification key
echo "Exporting verification key..."
echo "This key will allow anyone to verify proofs without knowing the actual melody"
snarkjs zkey export verificationkey melody_proof_final.zkey verification_key.json

echo "Circuit compilation and setup completed successfully!"
ls -la  # Show files in build directory
