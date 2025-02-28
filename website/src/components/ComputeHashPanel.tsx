// website/src/components/ComputeHashPanel.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Piano from './Piano';
import { notesToMIDI, calculateMelodyHash } from '../utils/zkpUtils';

const ComputeHashPanel = () => {
  const [notes, setNotes] = useState<string[]>([]);
  const [salt, setSalt] = useState<string>('123456789');  // Default value to make testing easier
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isComputing, setIsComputing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleNotesChange = (newNotes: string[]) => {
    setNotes(newNotes);
    setComputedHash(null);
    setError(null);
  };
  
  const handleSaltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalt(e.target.value);
    setComputedHash(null);
    setError(null);
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
    
    try {
      // Convert notes to MIDI
      console.log("Converting notes to MIDI...");
      const midiNotes = notesToMIDI(notes);
      console.log("MIDI notes:", midiNotes);
      
      // Calculate hash
      console.log("Calculating hash with salt:", salt);
      const hash = await calculateMelodyHash(midiNotes, BigInt(salt));
      console.log("Hash calculated successfully:", hash);
      
      // Update state with the hash
      setComputedHash(hash);
      
    } catch (error: any) {
      console.error('Error computing hash:', error);
      setError(error.message || 'Failed to compute hash');
    } finally {
      setIsComputing(false);
    }
  };
  
  // Debug info about state changes
  useEffect(() => {
    if (computedHash) {
      console.log("Hash state has been updated:", computedHash);
    }
  }, [computedHash]);
  
  return (
    <div className="bg-[#2c2c2e] p-6 rounded-lg shadow-lg text-white mb-20">
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
      
      {/* Current state info for debugging */}
      <div className="mt-3 text-xs text-[#86868b]">
        <p>Notes selected: {notes.length}/8</p>
        <p>Salt entered: {salt ? "Yes" : "No"}</p>
        <p>Hash value exists: {computedHash ? "Yes" : "No"}</p>
      </div>
      
      {/* Hash Result Section - IMPORTANT: Highly visible styling */}
      {computedHash && (
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-black border-t-8 border-blue-500 z-50">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-2 text-white">Hash Result:</h3>
            
            <div className="bg-[#2c2c2e] p-4 rounded-lg mb-4 overflow-x-auto">
              <p className="font-mono text-lg text-white break-all">{computedHash}</p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(computedHash);
                  alert("Hash copied!");
                }}
                className="px-4 py-2 bg-[#0a84ff] text-white rounded-lg"
              >
                Copy Hash
              </button>
              
              <button
                onClick={() => setComputedHash(null)}
                className="px-4 py-2 bg-[#ff453a] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Secondary Hash Display - always visible after the main content */}
      {computedHash && (
        <div className="mt-10 p-6 bg-[#1c1c1e] border-4 border-yellow-500 rounded-lg">
          <h3 className="text-xl font-bold mb-2 text-white">Computed Hash (In-Page Display):</h3>
          <div className="bg-black p-4 rounded-lg overflow-x-auto">
            <p className="font-mono text-green-400 break-all">{computedHash}</p>
          </div>
          <p className="mt-2 text-white">
            If you can see this text but not the hash above, please scroll down to see the fixed position result at the bottom of your screen.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComputeHashPanel;