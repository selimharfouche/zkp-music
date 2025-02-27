// website/src/components/MelodyRegistration.tsx
'use client';

import React, { useState, useCallback } from 'react';
import Piano from './Piano';
import { notesToMIDI, calculateMelodyHash, generateSalt, generateProof } from '../utils/zkpUtils';
import { registerMelody } from '../utils/web3Utils';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState(0);
  
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setError(null);
    setStatusMessage(null);
    setProgressPercent(0);
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
      
      const melodyHash = await calculateMelodyHash(midiNotes, salt);
      console.log("✅ Melody Hash:", melodyHash);
      
      // STEP 4: Generate proof (70%)
      setStatusMessage('Generating zero-knowledge proof...');
      setProgressPercent(70);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const proof = await generateProof(midiNotes, salt, melodyHash);
      console.log("Proof generated successfully");
      
      // STEP 5: Submit to blockchain (90%)
      setStatusMessage('Submitting to blockchain...');
      setProgressPercent(90);
      
      const success = await registerMelody(proof, melodyHash);
      
      // STEP 6: Completion (100%)
      setProgressPercent(100);
      setStatusMessage('✅ Melody registered successfully on the blockchain!');
      console.log("Melody registered successfully with hash:", melodyHash);
      
      if (onRegistrationSuccess) {
        onRegistrationSuccess(melodyHash);
      }
      
      // Reset form after short delay
      setTimeout(() => {
        setNotes([]);
        setMelodyName('');
        setProgressPercent(0);
      }, 3000);
      
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
    <div className="bg-black p-6 rounded-lg shadow-md text-white">
      <h2 className="text-2xl font-bold mb-4 text-white">Register a New Melody</h2>
      
      <div className="mb-4">
        <label htmlFor="melodyName" className="block text-sm font-medium text-white mb-1">
          Melody Name
        </label>
        <input
          type="text"
          id="melodyName"
          value={melodyName}
          onChange={(e) => setMelodyName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-700 rounded-md bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a name for your melody"
          disabled={isProcessing}
        />
      </div>
      
      <Piano onNotesChange={handleNotesChange} maxNotes={8} />
      
      {error && (
        <div className="p-3 mb-4 bg-red-100 border border-red-300 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      {/* Progress Bar */}
      {isProcessing && progressPercent > 0 && (
        <div className="mt-4 mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
            <div className="text-blue-800 font-medium">{statusMessage}</div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500 flex items-center justify-end"
              style={{ width: `${progressPercent}%` }}
            >
              <span className="px-2 text-xs text-white">{progressPercent}%</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Message (only when not processing) */}
      {!isProcessing && statusMessage && progressPercent === 100 && (
        <div className="p-3 mb-4 bg-green-100 border border-green-300 rounded-md text-green-800">
          {statusMessage}
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={registerMelodyFlow}
          disabled={false} 
          className={`
            w-full px-6 py-3 rounded-md text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2
            bg-gradient-to-r from-blue-600 to-green-500 hover:from-blue-700 hover:to-green-600
            transition-all duration-300 shadow-md
          `}
        >
          {isProcessing 
            ? 'Processing...' 
            : 'Register Melody'}
        </button>
        
        {/* Debug info to see what's causing the button to be disabled */}
        <div className="mt-2 p-2 bg-black border border-gray-800 rounded text-xs text-white">
          <div>Notes: {notes.length}/8 {notes.length === 8 ? "✅" : "❌"}</div>
          <div>Wallet connected: {isWalletConnected ? "✅" : "❌"}</div>
          <div>Melody name: {melodyName.trim() ? "✅" : "❌"}</div>
          <div>Processing: {isProcessing ? "Yes ❌" : "No ✅"}</div>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-white bg-black border border-gray-800 p-4 rounded-md">
        <p className="font-medium mb-2">How it works:</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Create an 8-note melody using the piano keyboard</li>
          <li>Enter a name for your melody</li>
          <li>Click "Register Melody" to start the process</li>
          <li>Your melody will be hashed and a zero-knowledge proof will be generated</li>
          <li>The proof will be registered on the blockchain, establishing your ownership</li>
          <li>The actual notes of your melody remain private and are never stored on-chain</li>
        </ol>
      </div>
    </div>
  );
};

export default MelodyRegistration;