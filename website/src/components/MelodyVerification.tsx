// website/src/components/MelodyVerification.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { REGISTRY_ABI, CONTRACT_ADDRESSES } from '../utils/abis';

interface MelodyVerificationProps {
  isWalletConnected: boolean;
}

const MelodyVerification: React.FC<MelodyVerificationProps> = ({ isWalletConnected }) => {
  const [melodyHash, setMelodyHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isVerified: boolean;
    owner: string;
    registrationTime?: Date;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const [debugMessages, setDebugMessages] = useState<string[]>([]);

  // Function to add debug messages
  const addDebug = (message: string) => {
    console.log(`[DEBUG] ${message}`);
    if (debugMode) {
      setDebugMessages(prev => [...prev, `${new Date().toISOString().substr(11, 8)}: ${message}`]);
    }
  };

  // Clear debug messages when not in debug mode
  useEffect(() => {
    if (!debugMode) {
      setDebugMessages([]);
    }
  }, [debugMode]);

  const verifyOwnership = async () => {
    if (!melodyHash.trim()) {
      setError('Please enter a melody hash to verify');
      return;
    }

    setIsVerifying(true);
    setError(null);
    addDebug("Starting verification process");

    try {
      if (!window.ethereum) {
        addDebug("No Ethereum wallet found");
        throw new Error('No Ethereum wallet found');
      }

      addDebug("Connecting to provider");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      addDebug("Creating contract instance");
      const registryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.REGISTRY,
        REGISTRY_ABI,
        provider
      );

      // Fetch the owner of the melody
      addDebug(`Querying contract for hash: ${melodyHash}`);
      const owner = await registryContract.melodyOwners(melodyHash);
      addDebug(`Owner result: ${owner}`);
      
      if (owner === ethers.constants.AddressZero) {
        addDebug("Melody not registered (zero address returned)");
        setVerificationResult({
          isVerified: false,
          owner: 'None - This melody is not registered'
        });
        return;
      }

      // Fetch the registration time
      addDebug("Fetching registration timestamp");
      const timestamp = await registryContract.registrationTimes(melodyHash);
      const registrationTime = new Date(timestamp.toNumber() * 1000);
      addDebug(`Registration time: ${registrationTime.toLocaleString()}`);

      setVerificationResult({
        isVerified: true,
        owner,
        registrationTime
      });
      
      addDebug("Verification completed successfully");
    } catch (err: any) {
      console.error('Error verifying melody:', err);
      addDebug(`Error occurred: ${err.message || 'Unknown error'}`);
      setError(`Failed to verify melody: ${err.message || 'Unknown error'}`);
      setVerificationResult(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Verify Melody Ownership</h2>
        <button 
          onClick={() => setDebugMode(!debugMode)}
          className="text-[#86868b] text-sm hover:text-white"
        >
          {debugMode ? "Hide Debug" : "Debug Mode"}
        </button>
      </div>
      
      <p className="text-[#86868b] mb-4">
        Enter a melody hash to check if it's registered and who owns it.
      </p>

      <div className="mb-4">
        <label htmlFor="melodyHash" className="block text-sm font-medium text-white mb-2">
          Melody Hash
        </label>
        <input
          type="text"
          id="melodyHash"
          value={melodyHash}
          onChange={(e) => setMelodyHash(e.target.value)}
          className="w-full px-4 py-2 border border-[#48484a] rounded-lg bg-[#3a3a3c] text-white focus:outline-none focus:ring-2 focus:ring-[#0a84ff] text-sm"
          placeholder="Enter the melody hash to verify"
          disabled={isVerifying}
        />
      </div>

      <button
        onClick={verifyOwnership}
        disabled={isVerifying || !isWalletConnected}
        className={`
          px-4 py-2 rounded-lg text-white font-medium
          ${isVerifying || !isWalletConnected
            ? 'bg-[#86868b] cursor-not-allowed'
            : 'bg-[#0a84ff] hover:bg-[#0070d8]'}
          transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a84ff]
        `}
      >
        {isVerifying ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
            Verifying...
          </span>
        ) : 'Verify Ownership'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-[#3a3a3c] border-l-4 border-red-500 rounded-md text-white">
          {error}
        </div>
      )}

      {verificationResult && (
        <div className={`mt-4 p-4 rounded-lg border ${verificationResult.isVerified ? 'bg-[#2c2c2e] border-[#30d158]' : 'bg-[#2c2c2e] border-[#ffd60a]'}`}>
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
      
      {debugMode && (
        <div className="mt-4 p-4 bg-[#1c1c1e] border border-[#48484a] rounded-lg">
          <h3 className="font-bold mb-2 text-white">Debug Info</h3>
          <div className="text-[#86868b] text-sm font-mono">
            <p>Wallet connected: {isWalletConnected ? 'Yes' : 'No'}</p>
            <p>Verifying: {isVerifying ? 'Yes' : 'No'}</p>
            <p>Hash submitted: {melodyHash || 'None'}</p>
            <p>Registry contract address: {CONTRACT_ADDRESSES.REGISTRY}</p>
            <p>Has verification result: {verificationResult ? 'Yes' : 'No'}</p>
            <p>Error state: {error || 'None'}</p>
            
            <div className="mt-2 border-t border-[#48484a] pt-2">
              <p className="font-bold">Log:</p>
              {debugMessages.length > 0 ? (
                <ul className="list-none p-0 m-0 overflow-auto max-h-40">
                  {debugMessages.map((msg, i) => (
                    <li key={i} className="py-1">{msg}</li>
                  ))}
                </ul>
              ) : (
                <p>No debug messages yet</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MelodyVerification;