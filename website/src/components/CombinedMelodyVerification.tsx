// website/src/components/CombinedMelodyVerification.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Piano from './Piano';
import { REGISTRY_ABI, CONTRACT_ADDRESSES } from '../utils/abis';
import { notesToMIDI, calculateMelodyHash } from '../utils/zkpUtils';

interface CombinedMelodyVerificationProps {
  isWalletConnected: boolean;
}

const CombinedMelodyVerification: React.FC<CombinedMelodyVerificationProps> = ({ isWalletConnected }) => {
  // Verification mode
  const [mode, setMode] = useState<'melody' | 'hash'>('melody');
  
  // Melody mode inputs
  const [notes, setNotes] = useState<string[]>([]);
  const [salt, setSalt] = useState<string>('');
  
  // Hash mode input
  const [directHash, setDirectHash] = useState<string>('');
  
  // Shared state
  const [melodyHash, setMelodyHash] = useState<string>('');
  const [isComputing, setIsComputing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isVerified: boolean;
    owner: string;
    registrationTime?: Date;
  } | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Add log entry
  const addLog = (message: string) => {
    console.log(`[Verification] ${message}`);
    setLogs(prev => [message, ...prev].slice(0, 10)); // Keep last 10 logs
  };
  
  // Reset states when switching modes
  useEffect(() => {
    setVerificationResult(null);
    setError(null);
    setMelodyHash('');
    
    if (mode === 'melody') {
      setDirectHash('');
    } else {
      // Reset melody inputs when switching to hash mode
      setNotes([]);
      setSalt('');
    }
    
    addLog(`Switched to ${mode} verification mode`);
  }, [mode]);
  
  // Handle piano notes changes
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setVerificationResult(null);
    setError(null);
    setMelodyHash('');
  };
  
  // Handle salt changes
  const handleSaltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalt(e.target.value);
    setVerificationResult(null);
    setError(null);
    setMelodyHash('');
  };
  
  // Handle direct hash input
  const handleDirectHashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDirectHash(e.target.value);
    setMelodyHash(e.target.value);
    setVerificationResult(null);
    setError(null);
  };
  
  // Compute hash from melody and salt
  const computeHashFromMelody = async (): Promise<string | null> => {
    if (notes.length !== 8) {
      setError('Please select exactly 8 notes for your melody');
      return null;
    }
    
    if (!salt.trim()) {
      setError('Please enter a salt value');
      return null;
    }
    
    // Validate salt
    try {
      BigInt(salt);
    } catch (err) {
      setError('Salt must be a valid numeric value');
      return null;
    }
    
    setIsComputing(true);
    addLog('Computing hash from melody and salt...');
    
    try {
      // Convert notes to MIDI
      const midiNotes = notesToMIDI(notes);
      addLog(`Converted notes to MIDI: [${midiNotes.join(', ')}]`);
      
      // Calculate hash
      const hash = await calculateMelodyHash(midiNotes, BigInt(salt));
      addLog(`Hash calculated: ${hash}`);
      
      setMelodyHash(hash);
      return hash;
    } catch (error: any) {
      console.error('Error computing hash:', error);
      setError(`Failed to compute hash: ${error.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsComputing(false);
    }
  };
  
  // Verify ownership of hash on the blockchain
  const verifyOwnership = async (hashToVerify: string) => {
    if (!hashToVerify.trim()) {
      setError('No hash available to verify');
      return;
    }
    
    setIsVerifying(true);
    addLog(`Starting verification for hash: ${hashToVerify}`);
    
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found. Please install MetaMask.');
      }
      
      addLog('Connecting to provider...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      addLog('Creating contract instance...');
      const registryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.REGISTRY,
        REGISTRY_ABI,
        provider
      );
      
      // Fetch the owner of the melody
      addLog('Querying contract for owner...');
      const owner = await registryContract.melodyOwners(hashToVerify);
      
      if (owner === ethers.constants.AddressZero) {
        addLog('Melody not registered (zero address returned)');
        setVerificationResult({
          isVerified: false,
          owner: 'None - This melody is not registered'
        });
        return;
      }
      
      // Fetch the registration time
      addLog('Fetching registration timestamp...');
      const timestamp = await registryContract.registrationTimes(hashToVerify);
      const registrationTime = new Date(timestamp.toNumber() * 1000);
      
      addLog(`Verification successful! Owner: ${owner}`);
      setVerificationResult({
        isVerified: true,
        owner,
        registrationTime
      });
    } catch (err: any) {
      console.error('Error verifying melody:', err);
      setError(`Failed to verify: ${err.message || 'Unknown error'}`);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Combined verify function that handles both modes
  const handleVerifyClick = async () => {
    setError(null);
    setVerificationResult(null);
    
    if (mode === 'melody') {
      // First compute the hash, then verify
      const computedHash = await computeHashFromMelody();
  if (computedHash) {
    // Make sure to update the melodyHash state before verification
    setMelodyHash(computedHash);
    // Add a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    await verifyOwnership(computedHash);
      }
    } else {
      // Directly verify the provided hash
      if (!directHash.trim()) {
        setError('Please enter a melody hash to verify');
        return;
      }
      await verifyOwnership(directHash);
    }
  };
  
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };
  
  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Verify Melody Ownership</h2>
      
      {/* Mode Selection Tabs */}
      <div className="flex mb-6 bg-[#1c1c1e] rounded-lg p-1 w-full md:w-auto">
        <button
          onClick={() => setMode('melody')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'melody'
              ? 'bg-[#0a84ff] text-white'
              : 'bg-transparent text-[#86868b] hover:text-white'
          }`}
        >
          Verify with Melody
        </button>
        <button
          onClick={() => setMode('hash')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === 'hash'
              ? 'bg-[#0a84ff] text-white'
              : 'bg-transparent text-[#86868b] hover:text-white'
          }`}
        >
          Verify with Hash
        </button>
      </div>
      
      {/* Melody Input Mode */}
      {mode === 'melody' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Enter Your Melody</h3>
            <p className="text-[#86868b] mb-4">
              Select the 8 notes of your melody using the piano, then enter the salt value you used when registering.
            </p>
            
            <Piano onNotesChange={handleNotesChange} maxNotes={8} />
          </div>
          
          <div>
            <label htmlFor="saltInput" className="block text-sm font-medium text-white mb-2">
              Salt Value (used during registration)
            </label>
            <input
              type="text"
              id="saltInput"
              value={salt}
              onChange={handleSaltChange}
              className="w-full px-4 py-2 border border-[#48484a] rounded-lg bg-[#3a3a3c] text-white focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
              placeholder="Enter the salt value"
              disabled={isComputing || isVerifying}
            />
          </div>
        </div>
      )}
      
      {/* Hash Input Mode */}
      {mode === 'hash' && (
        <div>
          <h3 className="text-lg font-medium mb-2">Enter Melody Hash</h3>
          <p className="text-[#86868b] mb-4">
            Enter the hash of the melody you want to verify ownership for.
          </p>
          
          <input
            type="text"
            value={directHash}
            onChange={handleDirectHashChange}
            className="w-full px-4 py-2 border border-[#48484a] rounded-lg bg-[#3a3a3c] text-white focus:outline-none focus:ring-2 focus:ring-[#0a84ff] text-sm font-mono"
            placeholder="Enter the melody hash"
            disabled={isVerifying}
          />
        </div>
      )}
      
      {/* Computed Hash Display (only in Melody mode) */}
      {mode === 'melody' && melodyHash && (
        <div className="mt-4 p-4 bg-[#1c1c1e] rounded-lg">
          <h3 className="font-medium text-white mb-1">Computed Hash:</h3>
          <p className="font-mono text-sm text-[#0a84ff] break-all">{melodyHash}</p>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-[#3a3a3c] border-l-4 border-red-500 rounded-md text-white">
          {error}
        </div>
      )}
      
      {/* Verify Button */}
      <div className="mt-6">
        <button
          onClick={handleVerifyClick}
          disabled={isComputing || isVerifying || !isWalletConnected}
          className={`
            px-6 py-3 rounded-lg text-white font-medium w-full
            ${!isWalletConnected
              ? 'bg-[#86868b] cursor-not-allowed'
              : isComputing || isVerifying
              ? 'bg-[#0a84ff] opacity-70 cursor-wait'
              : 'bg-[#0a84ff] hover:bg-[#0070d8]'}
            transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a84ff]
          `}
        >
          {!isWalletConnected ? (
            'Connect Wallet First'
          ) : isComputing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
              Computing Hash...
            </span>
          ) : isVerifying ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
              Verifying Ownership...
            </span>
          ) : (
            `Verify Ownership`
          )}
        </button>
      </div>
      
      {/* Verification Result */}
      {verificationResult && (
        <div className={`mt-6 p-4 rounded-lg border ${verificationResult.isVerified ? 'bg-[#2c2c2e] border-[#30d158]' : 'bg-[#2c2c2e] border-[#ffd60a]'}`}>
          <h3 className="font-bold text-lg mb-2 text-white">Verification Result</h3>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium text-white">Status:</span>{' '}
              {verificationResult.isVerified ? (
                <span className="text-[#30d158] font-bold">Registered ✓</span>
              ) : (
                <span className="text-[#ffd60a] font-bold">Not Registered ✗</span>
              )}
            </div>
            
            <div>
              <span className="font-medium text-white">Hash:</span>{' '}
              <span className="font-mono text-[#86868b] break-all">{melodyHash}</span>
            </div>
            
            {verificationResult.isVerified && (
              <>
                <div>
                  <span className="font-medium text-white">Owner:</span>{' '}
                  <span className="font-mono text-[#86868b]">{formatAddress(verificationResult.owner)}</span>
                  <a
                    href={`https://sepolia.etherscan.io/address/${verificationResult.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-[#0a84ff] hover:underline text-sm"
                  >
                    View
                  </a>
                </div>
                
                {verificationResult.registrationTime && (
                  <div>
                    <span className="font-medium text-white">Registered on:</span>{' '}
                    <span className="text-[#86868b]">{verificationResult.registrationTime.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Debug Logs (Only visible when logs exist) */}
      {logs.length > 0 && (
        <div className="mt-6 p-4 bg-[#1c1c1e] border border-[#48484a] rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-white">Process Log</h3>
            <button
              onClick={() => setLogs([])}
              className="text-[#86868b] text-xs hover:text-white"
            >
              Clear
            </button>
          </div>
          <div className="bg-black p-2 rounded-lg max-h-40 overflow-y-auto">
            <ul className="text-[#86868b] text-xs font-mono list-none p-0 m-0">
              {logs.map((log, i) => (
                <li key={i} className="py-1 border-b border-[#333] last:border-0">
                  {log}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CombinedMelodyVerification;