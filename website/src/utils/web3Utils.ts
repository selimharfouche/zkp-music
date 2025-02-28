// website/src/utils/web3Utils.ts
import { ethers } from 'ethers';
import { VERIFIER_ABI, REGISTRY_ABI, CONTRACT_ADDRESSES } from './abis';
import { MelodyVerifier, MelodyRegistry, Proof } from './types';

let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;
let verifierContract: MelodyVerifier | null = null;
let registryContract: MelodyRegistry | null = null;

/**
 * Connects to the user's Ethereum wallet (e.g., MetaMask)
 */
export const connectWallet = async (): Promise<string> => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet found. Please install MetaMask.');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    
    // Initialize ethers provider and signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    // Initialize contracts
    verifierContract = new ethers.Contract(
      CONTRACT_ADDRESSES.VERIFIER,
      VERIFIER_ABI,
      signer
    ) as unknown as MelodyVerifier;
    
    registryContract = new ethers.Contract(
      CONTRACT_ADDRESSES.REGISTRY,
      REGISTRY_ABI,
      signer
    ) as unknown as MelodyRegistry;
    
    // Check if we're on the correct network (Sepolia)
    const network = await provider.getNetwork();
    if (network.chainId !== 11155111) { // Sepolia chain ID
      try {
        // Try to switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }] // 0xaa36a7 is 11155111 in hex
        });
      } catch (switchError: any) {
        // Handle error - could be that Sepolia needs to be added
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        }
      }
    }
    
    return account;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

/**
 * Checks if the wallet is connected
 */
export const isWalletConnected = (): boolean => {
  return provider !== null && signer !== null;
};

/**
 * Gets the current connected account
 */
export const getCurrentAccount = async (): Promise<string | null> => {
  if (!provider) return null;
  
  try {
    const accounts = await provider.listAccounts();
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

/**
 * Registers a melody on the blockchain
 */
export const registerMelody = async (proof: Proof, melodyHash: string): Promise<ethers.ContractTransaction | boolean> => {
  if (typeof window === 'undefined') {
    console.error('Cannot register melody on server side');
    return false;
  }
  
  if (!registryContract || !signer) {
    console.error('Wallet not connected or contracts not initialized');
    try {
      // Try to initialize if window.ethereum exists
      if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
      } else {
        throw new Error('Wallet not connected or contracts not initialized');
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      throw new Error('Wallet not connected or contracts not initialized');
    }
  }
  
  // Double-check after initialization attempt
  if (!registryContract || !signer) {
    throw new Error('Wallet not connected or contracts not initialized');
  }
  
  try {
    console.log("Preparing to register melody with hash:", melodyHash);
    console.log("Using proof:", JSON.stringify(proof));
    
    // Format the public input (melodyHash) for the contract
    const input = [melodyHash];
    
    console.log("Calling registerMelody on contract...");
    // Register the melody with the proof
    const tx = await registryContract.registerMelody(
      proof.a,
      proof.b,
      proof.c,
      input
    );
    
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for transaction to be mined...");
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    console.log("Transaction mined:", receipt);
    
    // Return the transaction itself so the caller can access details like the hash
    return tx;
  } catch (error) {
    console.error('Error registering melody:', error);
    throw error;
  }
};

/**
 * Gets all melodies registered by the current user
 */
export const getUserMelodies = async (): Promise<string[]> => {
  if (typeof window === 'undefined') {
    return []; // Return empty array when on server-side
  }
  
  // Try to initialize if not already initialized
  if (!registryContract || !provider) {
    try {
      // Check if there are accounts already connected
      if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
      } else {
        return []; // Return empty array if no wallet is connected
      }
    } catch (error) {
      console.error('Could not initialize wallet:', error);
      return []; // Return empty array rather than throwing
    }
  }
  
  // Double-check after attempted initialization
  if (!registryContract || !provider) {
    return []; // Still not initialized, return empty array
  }
  
  try {
    const account = await getCurrentAccount();
    if (!account) return []; // No account connected, return empty array
    
    // We'll need to query each index until we get an error
    const melodies: string[] = [];
    let index = 0;
    
    while (true) {
      try {
        const melodyHash = await registryContract.userMelodies(account, index);
        melodies.push(melodyHash.toString());
        index++;
      } catch (error) {
        // We've reached the end of the array
        break;
      }
    }
    
    return melodies;
  } catch (error) {
    console.error('Error getting user melodies:', error);
    return []; // Return empty array on error rather than throwing
  }
};

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}