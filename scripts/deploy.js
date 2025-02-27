// Script to deploy our contracts to Sepolia
const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contracts with the account: ${deployer.address}`);
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);

  // Deploy the Verifier contract
  console.log("Deploying MelodyVerifier...");
  const MelodyVerifier = await ethers.getContractFactory("MelodyVerifier");
  const verifier = await MelodyVerifier.deploy();
  await verifier.deployed();
  console.log(`MelodyVerifier deployed to: ${verifier.address}`);

  // Deploy the Registry contract using the Verifier address
  console.log("Deploying MelodyRegistry...");
  const MelodyRegistry = await ethers.getContractFactory("MelodyRegistry");
  const registry = await MelodyRegistry.deploy(verifier.address);
  await registry.deployed();
  console.log(`MelodyRegistry deployed to: ${registry.address}`);

  console.log("Deployment complete!");
  
  // Save the contract addresses for future reference
  console.log("\nContract Addresses:");
  console.log("--------------------");
  console.log(`MelodyVerifier: ${verifier.address}`);
  console.log(`MelodyRegistry: ${registry.address}`);
  console.log("\nSave these addresses for interacting with the contracts!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
