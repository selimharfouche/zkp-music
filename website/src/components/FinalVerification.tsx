// website/src/components/FinalVerification.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import Piano from './Piano';
import { REGISTRY_ABI, CONTRACT_ADDRESSES } from '../utils/abis';
import { notesToMIDI, calculateMelodyHash } from '../utils/zkpUtils';

interface FinalVerificationProps {
  isWalletConnected: boolean;
}

const FinalVerification: React.FC<FinalVerificationProps> = ({ isWalletConnected }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // Verification mode
  const [verificationMode, setVerificationMode] = useState<'melody' | 'hash'>('melody');
  
  // Input states
  const [notes, setNotes] = useState<string[]>([]);
  const [salt, setSalt] = useState<string>('');
  const [directHash, setDirectHash] = useState<string>('');
  
  // Result states
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const [ownerAddress, setOwnerAddress] = useState<string>('');
  const [registrationTime, setRegistrationTime] = useState<string>('');
  const [isRegistered, setIsRegistered] = useState(false);
  
  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  // References
  const resultContainerRef = useRef<HTMLDivElement>(null);
  
  // Theme-based color classes
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        mainBg: 'bg-[#1c1c1e]',
        cardBg: 'bg-[#2c2c2e]',
        inputBg: 'bg-[#3a3a3c]',
        border: 'border-[#48484a]',
        text: 'text-white',
        mutedText: 'text-[#86868b]',
        primary: 'bg-[#0a84ff]',
        primaryHover: 'hover:bg-[#0070d8]',
        accent: 'bg-[#3a3a3c]',
        buttonText: 'text-white',
        logBg: 'bg-[#0a0a0a]',
        resultPanelBg: 'bg-black',
        resultCardBg: 'bg-[#111]'
      };
    } else {
      return {
        mainBg: 'bg-[#f2f2f7]',
        cardBg: 'bg-white',
        inputBg: 'bg-[#f2f2f7]',
        border: 'border-[#d1d1d6]',
        text: 'text-black',
        mutedText: 'text-[#6c6c70]',
        primary: 'bg-[#007aff]',
        primaryHover: 'hover:bg-[#0062cc]',
        accent: 'bg-[#e5e5ea]',
        buttonText: 'text-white',
        logBg: 'bg-[#f2f2f7]',
        resultPanelBg: 'bg-white',
        resultCardBg: 'bg-[#f8f8f8]'
      };
    }
  };
  
  // Get theme colors
  const colors = getThemeClasses();
  
  // Helper function to add logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${message}`;
    console.log(entry);
    setLogs(prev => [entry, ...prev.slice(0, 19)]);
  };
  
  // Handle piano note changes
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setErrorMessage('');
  };
  
  // Reset all states
  const resetStates = () => {
    setCalculatedHash('');
    setOwnerAddress('');
    setRegistrationTime('');
    setIsRegistered(false);
    setShowResults(false);
    setErrorMessage('');
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    addLog(`Switched to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  };
  
  // Compute hash from melody and salt
  const computeHash = async (): Promise<string | null> => {
    // Validation
    if (notes.length !== 8) {
      setErrorMessage('Please select exactly 8 notes for your melody');
      return null;
    }
    
    if (!salt.trim()) {
      setErrorMessage('Please enter a salt value');
      return null;
    }
    
    // Validate salt is numeric
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
  
  // Verify hash ownership on chain
  const verifyOnChain = async (hash: string) => {
    if (!hash) {
      setErrorMessage('No hash provided for verification');
      return;
    }
    
    addLog(`Verifying ownership for hash: ${hash}`);
    
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
      
      // Query melody owner
      addLog('Querying contract for owner...');
      const owner = await registryContract.melodyOwners(hash);
      addLog(`Owner address: ${owner}`);
      
      // Check if registered (owner is not zero address)
      const registered = owner !== ethers.constants.AddressZero;
      setIsRegistered(registered);
      setOwnerAddress(owner);
      
      if (registered) {
        // Get registration time
        addLog('Fetching registration timestamp...');
        const timestamp = await registryContract.registrationTimes(hash);
        const date = new Date(timestamp.toNumber() * 1000);
        setRegistrationTime(date.toLocaleString());
        addLog(`Registration time: ${date.toLocaleString()}`);
      } else {
        setRegistrationTime('');
        addLog('Melody is not registered');
      }
      
      // Show results
      setShowResults(true);
      
      // Ensure the results container is visible
      if (resultContainerRef.current) {
        resultContainerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      
    } catch (error: any) {
      const errorMsg = `Verification error: ${error.message || 'Unknown error'}`;
      setErrorMessage(errorMsg);
      addLog(errorMsg);
    }
  };
  
  // Main verification function
  const handleVerify = async () => {
    setIsProcessing(true);
    setErrorMessage('');
    resetStates();
    
    try {
      let hashToVerify: string | null = null;
      
      // Determine verification method
      if (verificationMode === 'hash') {
        // Use direct hash
        if (!directHash.trim()) {
          setErrorMessage('Please enter a hash to verify');
          setIsProcessing(false);
          return;
        }
        addLog('Using provided hash for verification');
        hashToVerify = directHash.trim();
        setCalculatedHash(hashToVerify);
      } else {
        // Compute hash from notes and salt
        addLog('Computing hash from melody and salt first');
        hashToVerify = await computeHash();
      }
      
      if (hashToVerify) {
        await verifyOnChain(hashToVerify);
      }
    } catch (error: any) {
      setErrorMessage(`Verification failed: ${error.message || 'Unknown error'}`);
      addLog(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Format address for display
  const formatAddress = (address: string): string => {
    if (!address || address === ethers.constants.AddressZero) return 'None';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Check if verification is possible
  const canVerify = () => {
    if (!isWalletConnected) return false;
    if (isProcessing) return false;
    
    if (verificationMode === 'melody') {
      return notes.length === 8 && salt.trim() !== '';
    } else {
      return directHash.trim() !== '';
    }
  };
  
  return (
    <div className={`${colors.mainBg} ${colors.text} p-6 rounded-lg shadow-lg mb-20 relative transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Verify Melody Ownership</h2>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          className={`${colors.accent} p-2 rounded-full transition-colors cursor-pointer`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Toggle Switch between verification methods */}
      <div className="relative flex justify-center mb-8">
        <div className="relative w-full max-w-md">
          {/* Toggle Background */}
          <div className={`${colors.cardBg} h-14 rounded-xl p-1`}>
            <div 
              className={`absolute h-12 rounded-lg transition-all duration-300 ease-in-out ${
                verificationMode === 'melody' ? 'w-1/2 left-1' : 'w-1/2 left-[calc(50%)]'
              } ${colors.accent}`}
            />
            
            {/* Toggle Buttons */}
            <div className="relative flex h-full">
              <button
                onClick={() => setVerificationMode('melody')}
                className={`flex-1 h-full rounded-lg flex items-center justify-center z-10 font-medium text-sm transition-colors cursor-pointer ${
                  verificationMode === 'melody' ? colors.text : colors.mutedText
                }`}
              >
                <span className="mr-2">🎹</span>
                Verify with Melody
              </button>
              
              <button
                onClick={() => setVerificationMode('hash')}
                className={`flex-1 h-full rounded-lg flex items-center justify-center z-10 font-medium text-sm transition-colors cursor-pointer ${
                  verificationMode === 'hash' ? colors.text : colors.mutedText
                }`}
              >
                <span className="mr-2">#️⃣</span>
                Verify with Hash
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Verification Forms */}
      <div className={`${colors.cardBg} p-5 rounded-xl mb-6 transition-all duration-300`}>
        {/* Melody Verification Form */}
        {verificationMode === 'melody' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Select Your Melody</h3>
              <Piano onNotesChange={handleNotesChange} maxNotes={8} />
              <p className={`mt-2 text-sm ${colors.mutedText}`}>
                Selected notes: {notes.length > 0 ? notes.join(', ') : 'None'} ({notes.length}/8)
              </p>
            </div>
            
            <div>
              <label htmlFor="saltInput" className="block text-sm font-medium mb-2">
                Salt Value (used during registration)
              </label>
              <input
                type="text"
                id="saltInput"
                value={salt}
                onChange={(e) => setSalt(e.target.value)}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.text} focus:outline-none focus:ring-2 focus:ring-[#0a84ff]`}
                placeholder="Enter the salt value you used when registering"
                disabled={isProcessing}
              />
            </div>
          </div>
        )}
        
        {/* Hash Verification Form */}
        {verificationMode === 'hash' && (
          <div>
            <h3 className="text-lg font-medium mb-3">Enter Melody Hash</h3>
            <p className={`${colors.mutedText} mb-4 text-sm`}>
              Enter the hash value of the melody you want to verify ownership for.
            </p>
            
            <input
              type="text"
              value={directHash}
              onChange={(e) => setDirectHash(e.target.value)}
              className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.border} rounded-lg ${colors.text} font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0a84ff]`}
              placeholder="Paste the melody hash here"
              disabled={isProcessing}
            />
          </div>
        )}
      </div>
      
      {/* Error message */}
      {errorMessage && (
        <div className={`${colors.cardBg} border-l-4 border-red-500 p-4 rounded-lg mb-6`}>
          <p className={colors.text}>{errorMessage}</p>
        </div>
      )}
      
      {/* Verification button */}
      <button
        onClick={handleVerify}
        disabled={!canVerify()}
        className={`w-full py-3 px-4 rounded-lg font-bold ${colors.buttonText} mb-6 transition-all duration-200 cursor-pointer ${
          !canVerify()
            ? 'bg-gray-600 cursor-not-allowed opacity-70'
            : `${colors.primary} ${colors.primaryHover} shadow-lg`
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
            {verificationMode === 'melody' ? 'Computing Hash & Verifying...' : 'Verifying...'}
          </span>
        ) : (
          'Verify Ownership'
        )}
      </button>
      
      {/* Status bar */}
      <div className={`mb-6 flex items-center justify-between ${colors.cardBg} p-2 rounded-lg text-sm`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${isWalletConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={colors.mutedText}>
            {isWalletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
          </span>
        </div>
        
        <button 
          onClick={() => setLogs([])}
          className="text-xs text-[#0a84ff] hover:underline cursor-pointer"
        >
          Clear Logs
        </button>
      </div>
      
      {/* Process Logs (collapsible) */}
      <div className={`${colors.logBg} rounded-lg border ${colors.border} overflow-hidden`}>
        <details>
          <summary className={`flex items-center justify-between p-3 cursor-pointer ${colors.logBg} hover:bg-opacity-80`}>
            <h3 className="font-medium">Process Log</h3>
            <span className={`text-xs ${colors.mutedText}`}>{logs.length} entries</span>
          </summary>
          
          <div className="max-h-40 overflow-y-auto p-2">
            {logs.length > 0 ? (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <p key={i} className={`text-xs font-mono ${colors.mutedText} border-b ${colors.border} py-1`}>
                    {log}
                  </p>
                ))}
              </div>
            ) : (
              <p className={`text-xs ${colors.mutedText} p-2`}>No logs yet</p>
            )}
          </div>
        </details>
      </div>
      
      {/* Fixed-position verification result panel */}
      {showResults && calculatedHash && (
        <div className="fixed inset-x-0 bottom-0 z-50" ref={resultContainerRef}>
          <div className={`max-w-4xl mx-auto p-6 ${colors.resultPanelBg} border-t-4 border-blue-500 shadow-2xl`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xl font-bold ${colors.text}`}>Verification Result</h3>
              <button 
                onClick={() => setShowResults(false)}
                className={`${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} ${colors.text} px-3 py-1 rounded cursor-pointer`}
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className={`${colors.resultCardBg} p-4 rounded-lg mb-4`}>
                  <div className="mb-2">
                    <span className={colors.mutedText}>Status:</span>
                    <span className={`ml-2 font-bold ${isRegistered ? 'text-green-500' : 'text-yellow-500'}`}>
                      {isRegistered ? 'REGISTERED ✓' : 'NOT REGISTERED ✗'}
                    </span>
                  </div>
                  
                  {isRegistered && (
                    <>
                      <div className="mb-2">
                        <span className={colors.mutedText}>Owner:</span>
                        <span className={`ml-2 ${colors.text}`}>{formatAddress(ownerAddress)}</span>
                        <a
                          href={`https://sepolia.etherscan.io/address/${ownerAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-400 hover:underline text-sm cursor-pointer"
                        >
                          View on Etherscan
                        </a>
                      </div>
                      
                      {registrationTime && (
                        <div>
                          <span className={colors.mutedText}>Registered:</span>
                          <span className={`ml-2 ${colors.text}`}>{registrationTime}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <div className={`${colors.resultCardBg} p-4 rounded-lg`}>
                  <div className="mb-2">
                    <span className={colors.mutedText}>Hash:</span>
                  </div>
                  <div className="font-mono text-sm text-green-400 break-all">
                    {calculatedHash}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(calculatedHash);
                      addLog('Hash copied to clipboard');
                    }}
                    className={`mt-2 ${theme === 'dark' ? 'bg-[#333] hover:bg-[#444]' : 'bg-[#e5e5ea] hover:bg-[#d1d1d6]'} ${colors.text} px-3 py-1 rounded text-sm cursor-pointer`}
                  >
                    Copy Hash
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalVerification;