// website/src/components/WalletConnect.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { connectWallet, getCurrentAccount } from '../utils/web3Utils';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // This state is used to track if the component has mounted on the client
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true after the component mounts on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if the user is already connected
  useEffect(() => {
    if (!mounted) return;
    
    const checkConnection = async () => {
      try {
        const currentAccount = await getCurrentAccount();
        if (currentAccount) {
          setAccount(currentAccount);
          onConnect(currentAccount);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };
    
    if (typeof window !== 'undefined' && window.ethereum) {
      checkConnection();
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
        } else {
          setAccount(accounts[0]);
          onConnect(accounts[0]);
        }
      });
    }
  }, [mounted, onConnect]);
  
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    
    try {
      const address = await connectWallet();
      setAccount(address);
      onConnect(address);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setConnecting(false);
    }
  };
  
  const formatAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Render a consistent UI while the component is mounting
  if (!mounted) {
    return (
      <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg mb-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        <p className="text-[#86868b]">Initializing wallet connection...</p>
      </div>
    );
  }
  
  // Now, only after mounting, check if ethereum is available
  const hasEthereum = typeof window !== 'undefined' && window.ethereum;
  
  if (!hasEthereum) {
    return (
      <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg mb-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
        <div className="p-4 bg-[#3a3a3c] border border-[#48484a] rounded-md">
          <p className="text-white">No Ethereum wallet detected. Please install MetaMask to continue.</p>
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[#0a84ff] hover:underline"
          >
            Download MetaMask
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg mb-6 text-white">
      <h2 className="text-xl font-semibold mb-4">Wallet Connection</h2>
      
      {error && (
        <div className="p-4 mb-4 bg-[#3a3a3c] border-l-4 border-red-500 rounded-md text-white">
          {error}
        </div>
      )}
      
      {account ? (
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#3a3a3c] text-white rounded-md">
            Connected: {formatAddress(account)}
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${account}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0a84ff] hover:underline"
          >
            View on Etherscan
          </a>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={connecting}
          className={`
            px-4 py-2 bg-[#0a84ff] text-white rounded-md hover:bg-[#0070d8]
            focus:outline-none focus:ring-2 focus:ring-[#0a84ff] focus:ring-opacity-50
            ${connecting ? 'opacity-75 cursor-not-allowed' : ''}
          `}
        >
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
      
      <p className="mt-3 text-[#86868b]">
        Connect your wallet to register and verify melodies.
      </p>
    </div>
  );
};

export default WalletConnect;