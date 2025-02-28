// website/src/components/SimplifiedVerification.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Piano from './Piano';
import { REGISTRY_ABI, CONTRACT_ADDRESSES } from '../utils/abis';
import { notesToMIDI, calculateMelodyHash } from '../utils/zkpUtils';

interface SimplifiedVerificationProps {
  isWalletConnected: boolean;
}

const SimplifiedVerification: React.FC<SimplifiedVerificationProps> = ({ isWalletConnected }) => {
  // Input states
  const [notes, setNotes] = useState<string[]>([]);
  const [salt, setSalt] = useState<string>('');
  const [directHash, setDirectHash] = useState<string>('');
  
  // Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Result states - separated for reliability
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [registrationTime, setRegistrationTime] = useState<Date | null>(null);
  
  // Error handling
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Debug output
  const [logs, setLogs] = useState<string[]>([]);
  
  // Clear all results
  const clearResults = () => {
    setCalculatedHash('');
    setVerificationComplete(false);
    setIsRegistered(false);
    setOwnerAddress('');
    setRegistrationTime(null);
    setErrorMessage('');
  };
  
  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry);
    setLogs(prevLogs => [logEntry, ...prevLogs.slice(0, 19)]);
  };
  
  // Handle note changes from piano
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    clearResults();
  };
  
  // Handle salt input changes
  const handleSaltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalt(e.target.value);
    clearResults();
  };
  
  // Handle direct hash input changes
  const handleDirectHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectHash(e.target.value);
    clearResults();
  };
  
  // Function to compute hash from melody and salt
  const computeHash = async (): Promise<string | null> => {
    if (notes.length !== 8) {
      setErrorMessage('Please select exactly 8 notes for your melody');
      return null;
    }
    
    if (!salt.trim()) {
      setErrorMessage('Please enter a salt value');
      return null;
    }
    
    // Validate salt is a valid number
    try {
      BigInt(salt);
    } catch (err) {
      setErrorMessage('Salt must be a valid numeric value');
      return null;
    }
    
    addLog('Computing hash from notes and salt...');
    
    try {
      // Convert notes to MIDI
      const midiNotes = notesToMIDI(notes);
      addLog(`Notes converted to MIDI: [${midiNotes.join(', ')}]`);
      
      // Calculate hash
      const hash = await calculateMelodyHash(midiNotes, BigInt(salt));
      addLog(`Hash calculated: ${hash}`);
      
      // Update state with calculated hash
      setCalculatedHash(hash);
      return hash;
    } catch (error: any) {
      const errorMsg = `Hash calculation error: ${error.message || 'Unknown error'}`;
      setErrorMessage(errorMsg);
      addLog(errorMsg);
      return null;
    }
  };
  
  // Function to verify ownership on the blockchain
  const verifyOnChain = async (hashToVerify: string) => {
    if (!isWalletConnected) {
      setErrorMessage('Please connect your wallet first');
      return;
    }
    
    if (!hashToVerify) {
      setErrorMessage('No hash to verify');
      return;
    }
    
    addLog(`Verifying ownership for hash: ${hashToVerify}`);
    
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask.');
      }
      
      addLog('Connecting to Ethereum provider...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      addLog('Creating contract instance...');
      const registryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.REGISTRY,
        REGISTRY_ABI,
        provider
      );
      
      // Query owner of the melody
      addLog('Querying contract for owner...');
      const owner = await registryContract.melodyOwners(hashToVerify);
      addLog(`Owner query result: ${owner}`);
      
      // Check if melody is registered (owner is not zero address)
      const isMelodyRegistered = owner !== ethers.constants.AddressZero;
      
      // Update state with verification results
      setIsRegistered(isMelodyRegistered);
      setOwnerAddress(owner);
      setVerificationComplete(true);
      
      if (isMelodyRegistered) {
        // Get registration timestamp
        addLog('Fetching registration timestamp...');
        const timestamp = await registryContract.registrationTimes(hashToVerify);
        const registrationDate = new Date(timestamp.toNumber() * 1000);
        setRegistrationTime(registrationDate);
        addLog(`Registration time: ${registrationDate.toLocaleString()}`);
      } else {
        addLog('Melody is not registered (zero address returned)');
      }
      
    } catch (error: any) {
      const errorMsg = `Verification error: ${error.message || 'Unknown error'}`;
      setErrorMessage(errorMsg);
      addLog(errorMsg);
    }
  };
  
  // Main verification function that handles both paths
  const verifyMelody = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    
    try {
      // Determine which verification path to take
      if (directHash) {
        // Direct hash verification
        addLog('Using provided hash for verification');
        setCalculatedHash(directHash);
        await verifyOnChain(directHash);
      } else {
        // Melody + salt verification
        addLog('Computing hash from melody and salt first');
        const hash = await computeHash();
        if (hash) {
          await verifyOnChain(hash);
        }
      }
    } catch (error: any) {
      setErrorMessage(`Verification failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address || address === ethers.constants.AddressZero) return 'None';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };
  
  return (
    <div className="bg-[#1c1c1e] text-white p-6 rounded-lg shadow-lg mb-4">
      <h2 className="text-2xl font-bold mb-4">Verify Melody Ownership</h2>
      
      <div className="bg-[#2c2c2e] p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Option 1: Verify with Notes and Salt</h3>
        
        <div className="mb-4">
          <Piano onNotesChange={handleNotesChange} maxNotes={8} />
          <p className="mt-2 text-sm text-[#86868b]">
            Selected notes: {notes.length > 0 ? notes.join(', ') : 'None'} ({notes.length}/8)
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="saltInput" className="block text-sm font-medium mb-1">
            Salt Value (used during registration)
          </label>
          <input
            type="text"
            id="saltInput"
            value={salt}
            onChange={handleSaltChange}
            className="w-full px-3 py-2 bg-[#3a3a3c] border border-[#48484a] rounded text-white"
            placeholder="Enter salt value"
            disabled={isProcessing}
          />
        </div>
      </div>
      
      <div className="bg-[#2c2c2e] p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Option 2: Verify with Hash</h3>
        
        <div className="mb-4">
          <label htmlFor="hashInput" className="block text-sm font-medium mb-1">
            Melody Hash
          </label>
          <input
            type="text"
            id="hashInput"
            value={directHash}
            onChange={handleDirectHashChange}
            className="w-full px-3 py-2 bg-[#3a3a3c] border border-[#48484a] rounded text-white font-mono text-sm"
            placeholder="Enter melody hash directly"
            disabled={isProcessing}
          />
        </div>
      </div>
      
      {/* Show hash result if calculated */}
      {calculatedHash && (
        <div className="bg-black p-4 rounded-lg mb-6 border-2 border-blue-500">
          <h3 className="text-white font-bold mb-2">Calculated Hash:</h3>
          <p className="text-green-400 font-mono break-all text-sm">{calculatedHash}</p>
        </div>
      )}
      
      {/* Error message */}
      {errorMessage && (
        <div className="bg-[#3a3a3c] border-l-4 border-red-500 p-4 rounded-lg mb-6">
          <p className="text-white">{errorMessage}</p>
        </div>
      )}
      
      {/* Verification button */}
      <button
        onClick={verifyMelody}
        disabled={isProcessing || !isWalletConnected || (notes.length === 0 && !directHash)}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white mb-6 ${
          isProcessing 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
            Processing...
          </span>
        ) : (
          'Verify Ownership'
        )}
      </button>
      
      {/* Verification result */}
      {verificationComplete && (
        <div className={`p-4 rounded-lg mb-6 border-2 ${
          isRegistered ? 'bg-[#0c2e13] border-green-500' : 'bg-[#332200] border-yellow-500'
        }`}>
          <h3 className="text-xl font-bold mb-2">Verification Result</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={isRegistered ? 'text-green-400' : 'text-yellow-400'}>
                {isRegistered ? 'REGISTERED ✓' : 'NOT REGISTERED ✗'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">Hash:</span>
              <span className="text-[#86868b] text-sm">{calculatedHash.substring(0, 10)}...{calculatedHash.substring(calculatedHash.length - 10)}</span>
            </div>
            
            {isRegistered && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Owner:</span>
                  <div className="flex items-center">
                    <span className="text-[#86868b]">{formatAddress(ownerAddress)}</span>
                    {ownerAddress !== ethers.constants.AddressZero && (
                      <a
                        href={`https://sepolia.etherscan.io/address/${ownerAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-400 hover:underline text-sm"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
                
                {registrationTime && (
                  <div className="flex justify-between">
                    <span className="font-medium">Registered on:</span>
                    <span className="text-[#86868b]">{registrationTime.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Debug logs section */}
      <div className="mt-6 bg-[#0a0a0a] rounded-lg border border-[#3a3a3c]">
        <div className="flex justify-between items-center p-3 border-b border-[#3a3a3c]">
          <h3 className="font-medium">Process Log</h3>
          <button 
            onClick={() => setLogs([])}
            className="text-xs text-[#86868b] hover:text-white"
          >
            Clear
          </button>
        </div>
        
        <div className="max-h-48 overflow-y-auto p-2">
          {logs.length > 0 ? (
            <div className="space-y-1">
              {logs.map((log, i) => (
                <p key={i} className="text-xs font-mono text-[#86868b] border-b border-[#222] py-1">
                  {log}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#86868b] p-2">No logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplifiedVerification;