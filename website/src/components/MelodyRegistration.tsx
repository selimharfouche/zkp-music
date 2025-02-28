// website/src/components/MelodyRegistration.tsx
'use client';

import React, { useState, useCallback } from 'react';
import Piano from './Piano';
import OwnershipProofAlert from './OwnershipProofAlert';
import { notesToMIDI, calculateMelodyHash, generateSalt, generateProof } from '../utils/zkpUtils';
import { registerMelody } from '../utils/web3Utils';
import { saveMelodyOwnership } from '../utils/storageUtils';

interface MelodyRegistrationProps {
  isWalletConnected: boolean;
  onRegistrationSuccess?: (melodyHash: string) => void;
}

const MelodyRegistration: React.FC<MelodyRegistrationProps> = ({
  isWalletConnected,
  onRegistrationSuccess
}) => {
  const [notes, setNotes] = useState<string[]>([]);
  const [melodyName, setMelodyName] = useState('');
  const [currentSalt, setCurrentSalt] = useState<bigint | null>(null);
  const [melodyHash, setMelodyHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [showOwnershipAlert, setShowOwnershipAlert] = useState(false);
  const [ownershipData, setOwnershipData] = useState<any>(null);
  
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setError(null);
    setStatusMessage(null);
    setProgressPercent(0);
    setMelodyHash(null);
    setCurrentSalt(null);
  };
  
  const registerMelodyFlow = useCallback(async () => {
    // Validation checks
    if (!isWalletConnected) {
      setError('Please connect your wallet first.');
      return;
    }
    
    if (notes.length !== 8) {
      setError('Please select exactly 8 notes for your melody.');
      return;
    }
    
    if (!melodyName.trim()) {
      setError('Please enter a name for your melody.');
      return;
    }
    
    // Start processing
    setIsProcessing(true);
    setError(null);
    setStatusMessage('Starting melody registration...');
    setProgressPercent(5);
    
    try {
      // STEP 1: Generate a random salt (10%)
      setStatusMessage('Generating random salt...');
      setProgressPercent(10);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for visibility
      
      const salt = generateSalt();
      setCurrentSalt(salt);
      console.log("Generated salt:", salt.toString());
      
      // STEP 2: Convert notes to MIDI (20%)
      setStatusMessage('Converting notes to MIDI values...');
      setProgressPercent(20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const midiNotes = notesToMIDI(notes);
      console.log("MIDI notes:", midiNotes);
      
      // STEP 3: Calculate hash (40%)
      setStatusMessage('Computing secure hash of your melody...');
      setProgressPercent(40);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const hash = await calculateMelodyHash(midiNotes, salt);
      setMelodyHash(hash);
      console.log("✅ Melody Hash:", hash);
      
      // STEP 4: Generate proof (70%)
      setStatusMessage('Generating zero-knowledge proof...');
      setProgressPercent(70);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const proof = await generateProof(midiNotes, salt, hash);
      console.log("Proof generated successfully");
      
      // STEP 5: Submit to blockchain (90%)
      setStatusMessage('Submitting to blockchain...');
      setProgressPercent(90);
      
      try {
        const txResult = await registerMelody(proof, hash);
        console.log("Transaction result:", txResult);
        
        // STEP 6: Completion (100%)
        setProgressPercent(100);
        setStatusMessage('✅ Melody registered successfully on the blockchain!');
        console.log("Melody registered successfully with hash:", hash);
        
        if (onRegistrationSuccess) {
          onRegistrationSuccess(hash);
        }
        
        // Get transaction hash
        let txHash = '';
        if (typeof txResult === 'object' && txResult.hash) {
          txHash = txResult.hash;
          console.log("Transaction hash saved:", txHash);
        }
        
        // Save ownership data locally
        const ownershipInfo = {
          name: melodyName,
          notes: notes,
          salt: salt.toString(),
          hash: hash,
          timestamp: Date.now(),
          owner: window.ethereum?.selectedAddress || 'unknown',
          txHash: txHash
        };
        
        saveMelodyOwnership(ownershipInfo);
        
        setOwnershipData({
          ...ownershipInfo,
          timestamp: new Date(ownershipInfo.timestamp)
        });
        
        // Show the ownership alert
        setShowOwnershipAlert(true);
      } catch (txError) {
        console.error("Transaction error:", txError);
        throw new Error(`Blockchain transaction failed: ${txError.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error in melody registration flow:', err);
      setError(err.message || 'Failed to register melody');
      setStatusMessage(null);
      setProgressPercent(0);
    } finally {
      setIsProcessing(false);
    }
  }, [notes, melodyName, isWalletConnected, onRegistrationSuccess]);
  
  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">Register a New Melody</h2>
      
      <div className="mb-4">
        <label htmlFor="melodyName" className="block text-sm font-medium text-white mb-2">
          Melody Name
        </label>
        <input
          type="text"
          id="melodyName"
          value={melodyName}
          onChange={(e) => setMelodyName(e.target.value)}
          className="w-full px-4 py-2 border border-[#48484a] rounded-lg bg-[#3a3a3c] text-white focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
          placeholder="Enter a name for your melody"
          disabled={isProcessing}
        />
      </div>
      
      <Piano onNotesChange={handleNotesChange} maxNotes={8} />
      
      {error && (
        <div className="p-4 mb-4 bg-[#3a3a3c] border-l-4 border-red-500 rounded-md text-white">
          {error}
        </div>
      )}
      
      {/* Progress Indicator */}
      {(isProcessing) && statusMessage && (
        <div className="mt-4 mb-4 p-4 bg-[#3a3a3c] border border-[#48484a] rounded-lg">
          <div className="flex items-center">
            <div className="mr-3">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            </div>
            <div className="text-white font-medium">{statusMessage}</div>
          </div>
          
          {progressPercent > 0 && (
            <div className="mt-3">
              <div className="w-full bg-[#48484a] rounded-full h-3">
                <div 
                  className="bg-[#0a84ff] h-3 rounded-full transition-all duration-500 flex items-center justify-end"
                  style={{ width: `${progressPercent}%` }}
                >
                  <span className="px-2 text-xs text-white">{progressPercent}%</span>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-[#86868b]">
                <span>Start</span>
                <span>Salt</span>
                <span>Hash</span>
                <span>Proof</span>
                <span>Register</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Success Message (only when not processing) */}
      {!isProcessing && statusMessage && progressPercent === 100 && (
        <div className="p-4 mb-4 bg-[#3a3a3c] border-l-4 border-green-500 rounded-md text-white">
          {statusMessage}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={registerMelodyFlow}
          disabled={isProcessing} 
          className="w-full px-6 py-3 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a84ff] bg-[#0a84ff] hover:bg-[#0070d8] transition-all duration-300 shadow-md"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
              Processing...
            </span>
          ) : 'Register Melody'}
        </button>
        
        {/* Debug info to see what's causing the button to be disabled */}
        <div className="mt-2 p-3 bg-[#3a3a3c] rounded-lg text-xs text-[#86868b]">
          <div>Notes: {notes.length}/8 {notes.length === 8 ? "✅" : "❌"}</div>
          <div>Wallet connected: {isWalletConnected ? "✅" : "❌"}</div>
          <div>Melody name: {melodyName.trim() ? "✅" : "❌"}</div>
          <div>Processing: {isProcessing ? "Yes ❌" : "No ✅"}</div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-[#86868b] bg-[#3a3a3c] p-4 rounded-lg">
        <p className="font-medium mb-2 text-white">How it works:</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Create an 8-note melody using the piano keyboard</li>
          <li>Enter a name for your melody</li>
          <li>Click "Register Melody" to start the process</li>
          <li>Your melody will be hashed and a zero-knowledge proof will be generated</li>
          <li>The proof will be registered on the blockchain, establishing your ownership</li>
          <li>The actual notes of your melody remain private and are never stored on-chain</li>
        </ol>
      </div>
      
      {/* Ownership Proof Alert */}
      {showOwnershipAlert && ownershipData && (
        <OwnershipProofAlert 
          show={showOwnershipAlert}
          onClose={() => setShowOwnershipAlert(false)}
          melodyData={ownershipData}
        />
      )}
    </div>
  );
};

export default MelodyRegistration;