// website/src/components/UserMelodies.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getUserMelodies } from '../utils/web3Utils';

interface MelodyData {
  hash: string;
  registrationTime?: Date;
  txHash?: string;
}

interface UserMelodiesProps {
  isWalletConnected: boolean;
  refreshTrigger?: number;
}

const UserMelodies: React.FC<UserMelodiesProps> = ({ 
  isWalletConnected,
  refreshTrigger = 0
}) => {
  const [melodies, setMelodies] = useState<MelodyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track client-side mounting to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true once the component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    // Only fetch melodies if we're mounted on the client side
    if (!mounted) return;
    
    const fetchMelodies = async () => {
      if (!isWalletConnected) {
        setMelodies([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get melodies from contract
        const melodyHashes = await getUserMelodies();
        
        // Also load saved ownership data which contains transaction hashes
        const savedMelodies = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('melody-zkp-ownership-data') || '[]') 
          : [];
        
        // Match contract melodies with saved data to get transaction hashes
        const formattedMelodies: MelodyData[] = melodyHashes.map(hash => {
          // Find matching saved melody to get txHash
          const savedMelody = savedMelodies.find((m: any) => m.hash === hash);
          
          return {
            hash,
            txHash: savedMelody?.txHash,
            // We could add registration time from the contract if needed
          };
        });
        
        setMelodies(formattedMelodies);
      } catch (err: any) {
        console.error('Error fetching user melodies:', err);
        setError(err.message || 'Failed to fetch melodies');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMelodies();
  }, [isWalletConnected, refreshTrigger, mounted]);

  // If not mounted yet, render a loading state to avoid hydration issues
  if (!mounted) {
    return (
      <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Registered Melodies</h2>
        <p className="text-[#86868b]">Loading...</p>
      </div>
    );
  }
  
  if (!isWalletConnected) {
    return (
      <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-4 text-white">Your Registered Melodies</h2>
        <p className="text-[#86868b]">Connect your wallet to view your registered melodies.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">Your Registered Melodies</h2>
      
      {error && (
        <div className="p-4 mb-4 bg-[#3a3a3c] border-l-4 border-red-500 rounded-md text-white">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-[#86868b]">Loading your melodies...</div>
        </div>
      ) : (
        <>
          {melodies.length === 0 ? (
            <p className="text-[#86868b]">You haven't registered any melodies yet.</p>
          ) : (
            <div className="space-y-4">
              {melodies.map((melody, index) => (
                <div key={index} className="p-4 border border-[#48484a] rounded-lg bg-[#3a3a3c]">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h3 className="font-medium text-white">Melody #{index + 1}</h3>
                      <p className="text-sm text-[#86868b] break-all mt-1">Hash: {melody.hash}</p>
                      {melody.registrationTime && (
                        <p className="text-sm text-[#86868b] mt-1">
                          Registered on: {melody.registrationTime.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 md:mt-0">
                      {melody.txHash ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${melody.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0a84ff] hover:underline text-sm font-medium"
                        >
                          View Transaction
                        </a>
                      ) : (
                        <span className="text-[#86868b] text-sm">
                          Transaction data not available
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserMelodies;