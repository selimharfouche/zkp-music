// website/src/components/MelodyVerification.tsx
'use client';

import React, { useState } from 'react';
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

  const verifyOwnership = async () => {
    if (!melodyHash.trim()) {
      setError('Please enter a melody hash to verify');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const registryContract = new ethers.Contract(
        CONTRACT_ADDRESSES.REGISTRY,
        REGISTRY_ABI,
        provider
      );

      // Fetch the owner of the melody
      const owner = await registryContract.melodyOwners(melodyHash);
      
      if (owner === ethers.constants.AddressZero) {
        setVerificationResult({
          isVerified: false,
          owner: 'None - This melody is not registered'
        });
        return;
      }

      // Fetch the registration time
      const timestamp = await registryContract.registrationTimes(melodyHash);
      const registrationTime = new Date(timestamp.toNumber() * 1000);

      setVerificationResult({
        isVerified: true,
        owner,
        registrationTime
      });
    } catch (err: any) {
      console.error('Error verifying melody:', err);
      setError(`Failed to verify melody: ${err.message || 'Unknown error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const formatAddress = (address: string): string => {
    return `${address.substring(0, 10)}...${address.substring(address.length - 8)}`;
  };

  return (
    <div className="bg-black p-6 rounded-lg shadow-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">Verify Melody Ownership</h2>
      <p className="text-gray-300 mb-4">
        Enter a melody hash to check if it's registered and who owns it.
      </p>

      <div className="mb-4">
        <label htmlFor="melodyHash" className="block text-sm font-medium text-white mb-1">
          Melody Hash
        </label>
        <input
          type="text"
          id="melodyHash"
          value={melodyHash}
          onChange={(e) => setMelodyHash(e.target.value)}
          className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Enter the melody hash to verify"
          disabled={isVerifying}
        />
      </div>

      <button
        onClick={verifyOwnership}
        disabled={isVerifying || !isWalletConnected}
        className={`
          px-4 py-2 rounded-md text-white font-bold
          ${isVerifying || !isWalletConnected
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'}
          transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        {isVerifying ? 'Verifying...' : 'Verify Ownership'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md text-red-800">
          {error}
        </div>
      )}

      {verificationResult && (
        <div className={`mt-4 p-4 rounded-md border ${verificationResult.isVerified ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`}>
          <h3 className="font-bold text-lg mb-2">Verification Result</h3>
          
          <div className="space-y-2">
            <div>
              <span className="font-medium">Status:</span>{' '}
              {verificationResult.isVerified ? (
                <span className="text-green-700 font-bold">Registered ✓</span>
              ) : (
                <span className="text-yellow-700 font-bold">Not Registered ✗</span>
              )}
            </div>
            
            {verificationResult.isVerified && (
              <>
                <div>
                  <span className="font-medium">Owner:</span>{' '}
                  <span className="font-mono">{formatAddress(verificationResult.owner)}</span>
                  <a
                    href={`https://sepolia.etherscan.io/address/${verificationResult.owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline text-sm"
                  >
                    View
                  </a>
                </div>
                
                {verificationResult.registrationTime && (
                  <div>
                    <span className="font-medium">Registered on:</span>{' '}
                    <span>{verificationResult.registrationTime.toLocaleString()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MelodyVerification;