// website/src/components/ComputeHashPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Piano from './Piano';
import { notesToMIDI, calculateMelodyHash } from '../utils/zkpUtils';

const ComputeHashPanel = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const [salt, setSalt] = useState<string>('');
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setComputedHash(null);
    setError(null);
    setShowResult(false);
  };
  
  const handleSaltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalt(e.target.value);
    setComputedHash(null);
    setError(null);
    setShowResult(false);
  };
  
  const computeHash = async () => {
    if (notes.length !== 8) {
      setError('Please select exactly 8 notes');
      return;
    }
    
    if (!salt.trim()) {
      setError('Please enter a salt value');
      return;
    }
    
    // Check if salt is a valid number
    try {
      BigInt(salt);
    } catch (err) {
      setError('Salt must be a valid numeric value');
      return;
    }
    
    setIsComputing(true);
    setError(null);
    setComputedHash(null);
    setShowResult(false);
    
    try {
      // Add visible progress
      console.log("Converting notes to MIDI...");
      const midiNotes = notesToMIDI(notes);
      
      // Simulate some processing time for UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log("Calculating hash with salt:", salt);
      const hash = await calculateMelodyHash(midiNotes, BigInt(salt));
      console.log("Hash calculated successfully:", hash);
      
      // Set the computed hash and show the result
      setComputedHash(hash);
      setShowResult(true);
    } catch (error: any) {
      console.error('Error computing hash:', error);
      setError(error.message || 'Failed to compute hash');
    } finally {
      setIsComputing(false);
    }
  };
  
  // Debugging effect to log when hash changes
  useEffect(() => {
    if (computedHash) {
      console.log("Hash state updated:", computedHash);
    }
  }, [computedHash]);
  
  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Compute Melody Hash</h2>
      <p className="text-[#86868b] mb-4">
        Enter notes and a salt value to compute a hash without registering it.
        This is useful for verification and to check if a melody was already registered.
      </p>
      
      <Piano onNotesChange={handleNotesChange} maxNotes={8} />
      
      <div className="mt-4 mb-4">
        <label htmlFor="saltInput" className="block text-sm font-medium text-white mb-2">
          Salt Value (numeric)
        </label>
        <input
          type="text"
          id="saltInput"
          value={salt}
          onChange={handleSaltChange}
          className="w-full px-4 py-2 border border-[#48484a] rounded-lg bg-[#3a3a3c] text-white focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
          placeholder="Enter the salt value (e.g., 12345678)"
        />
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-[#3a3a3c] border-l-4 border-red-500 rounded-md text-white">
          {error}
        </div>
      )}
      
      <button
        onClick={computeHash}
        disabled={isComputing}
        className={`
          px-4 py-2 rounded-lg text-white font-medium mt-2
          ${isComputing
            ? 'bg-[#86868b] cursor-not-allowed'
            : 'bg-[#0a84ff] hover:bg-[#0070d8]'}
          transition-colors focus:outline-none focus:ring-2 focus:ring-[#0a84ff]
        `}
      >
        {isComputing ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
            Computing...
          </span>
        ) : 'Compute Hash'}
      </button>
      
      {/* Debug info */}
      <div className="mt-2 text-xs text-[#86868b]">
        <p>Notes selected: {notes.length}/8</p>
        <p>Salt entered: {salt ? "Yes" : "No"}</p>
        <p>Computation triggered: {isComputing ? "Yes" : "No"}</p>
      </div>
      
      {/* Make sure the hash result is clearly visible */}
      {showResult && computedHash && (
        <div className="mt-4 p-4 bg-[#1c1c1e] border-2 border-[#0a84ff] rounded-lg">
          <h3 className="font-bold mb-2 text-white">Computed Hash:</h3>
          <div className="bg-[#2c2c2e] p-3 rounded font-mono break-all text-sm text-white">
            {computedHash}
          </div>
          <p className="mt-2 text-[#86868b] text-sm">
            This hash uniquely identifies your melody + salt combination.
            You can use it to verify ownership in the system.
          </p>
          
          {/* Add a copy button for convenience */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(computedHash);
              alert('Hash copied to clipboard!');
            }}
            className="mt-2 px-3 py-1 bg-[#3a3a3c] hover:bg-[#48484a] text-white text-sm rounded"
          >
            Copy Hash
          </button>
        </div>
      )}
    </div>
  );
};

export default ComputeHashPanel;