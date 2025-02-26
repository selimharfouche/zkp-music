#!/bin/bash

# Navigate to project root
cd "$(dirname "$0")/.."
ROOT_DIR=$(pwd)

echo "Project root: $ROOT_DIR"

# Check if the build directory exists
if [ ! -d "circuits/build" ]; then
  echo "Build directory doesn't exist at $ROOT_DIR/circuits/build!"
  echo "Running compile script first..."
  ./scripts/compile.sh
else
  echo "Build directory exists at $ROOT_DIR/circuits/build"
  echo "Checking for necessary files..."
  
  # Check if all necessary files exist
  if [ ! -d "circuits/build/melody_proof_js" ] || \
     [ ! -f "circuits/build/melody_proof_final.zkey" ] || \
     [ ! -f "circuits/build/verification_key.json" ]; then
    echo "Some compiled files are missing. Running compile script again..."
    ./scripts/compile.sh
  else
    echo "All necessary compiled files found."
  fi
fi

# Run the test
echo "Running ZKP test..."
node circuits/test/test_zkp.js
