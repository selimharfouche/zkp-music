// src/components/MelodyRegistration.tsx
'use client';

import React, { useState, useCallback } from 'react';
import Piano from './Piano';
import OwnershipProofAlert from './OwnershipProofAlert';
import { notesToMIDI, calculateMelodyHash, generateSalt, generateProof } from '../utils/zkpUtils';
import { registerMelody } from '../utils/web3Utils';
import { saveMelodyOwnership } from '../utils/storageUtils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface MelodyRegistrationProps {
  isWalletConnected: boolean;
  onRegistrationSuccess?: (melodyHash: string) => void;
}

const MelodyRegistration: React.FC<MelodyRegistrationProps> = ({
  isWalletConnected,
  onRegistrationSuccess
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const [notes, setNotes] = useState<string[]>([]);
  const [melodyName, setMelodyName] = useState('');
  const [currentSalt, setCurrentSalt] = useState<bigint | null>(null);
  const [melodyHash, setMelodyHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessages, setStatusMessages] = useState<string[]>([]);
  const [showOwnershipAlert, setShowOwnershipAlert] = useState(false);
  const [ownershipData, setOwnershipData] = useState<any>(null);
  
  // Theme-based styles
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#2c2c2e]',
        text: 'text-white',
        mutedText: 'text-[#86868b]',
        inputBg: 'bg-[#3a3a3c]',
        border: 'border-[#48484a]',
        alertBg: 'bg-[#3a3a3c]',
        statusBg: 'bg-[#1c1c1e]',
        buttonBg: 'bg-[#0a84ff]',
        buttonHover: 'hover:bg-[#0070d8]'
      };
    } else {
      return {
        bgCard: 'bg-white',
        text: 'text-black',
        mutedText: 'text-gray-500',
        inputBg: 'bg-gray-100',
        border: 'border-gray-200',
        alertBg: 'bg-gray-100',
        statusBg: 'bg-gray-50',
        buttonBg: 'bg-blue-500',
        buttonHover: 'hover:bg-blue-600'
      };
    }
  };
  
  const colors = getThemeClasses();
  
  const handleNotesChange = useCallback((newNotes: string[]) => {
    setNotes(newNotes);
    setError(null);
    setStatusMessages([]);
    setMelodyHash(null);
    setCurrentSalt(null);
  }, []);
  
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
    setStatusMessages([]); // Clear previous messages
    
    // Define all messages upfront to avoid state updates in the process flow
    let allMessages = [];
    
    try {
      // STEP 1: Generate a random salt
      allMessages.push(`🔑 ${t('status.salt')}`);
      setStatusMessages(allMessages); // Update messages once
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const salt = generateSalt();
      setCurrentSalt(salt);
      
      // STEP 2: Convert notes to MIDI
      allMessages.push(`🎹 ${t('status.midi')}`);
      setStatusMessages(allMessages); // Update messages once
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const midiNotes = notesToMIDI(notes);
      
      // STEP 3: Calculate hash
      allMessages.push(`🔐 ${t('status.hash')}`);
      setStatusMessages(allMessages); // Update messages once
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const hash = await calculateMelodyHash(midiNotes, salt);
      setMelodyHash(hash);
      allMessages.push(`✓ ${t('status.hash_success')}`);
      setStatusMessages(allMessages); // Update messages once
      
      // STEP 4: Generate proof
      allMessages.push(`🧮 ${t('status.proof')}`);
      setStatusMessages(allMessages); // Update messages once
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const proof = await generateProof(midiNotes, salt, hash);
      allMessages.push(`✓ ${t('status.proof_success')}`);
      setStatusMessages(allMessages); // Update messages once
      
      // STEP 5: Submit to blockchain
      allMessages.push(`⛓️ ${t('status.blockchain')}`);
      setStatusMessages(allMessages); // Update messages once
      
      try {
        const txResult = await registerMelody(proof, hash);
        
        // STEP 6: Completion
        allMessages.push(`🎉 ${t('status.success')}`);
        setStatusMessages(allMessages); // Update messages once
        
        if (onRegistrationSuccess) {
          onRegistrationSuccess(hash);
        }
        
        // Get transaction hash
        let txHash = '';
        if (typeof txResult === 'object' && txResult.hash) {
          txHash = txResult.hash;
          allMessages.push(`🔍 ${t('status.transaction')}: ${txHash.substring(0, 10)}...`);
          setStatusMessages(allMessages); // Final update
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
        setTimeout(() => {
          setShowOwnershipAlert(true);
        }, 1000);
      } catch (txError: any) {
        console.error("Transaction error:", txError);
        allMessages.push('❌ Transaction failed. Please try again.');
        setStatusMessages(allMessages); // Update with error
        throw new Error(`Blockchain transaction failed: ${txError.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      console.error('Error in melody registration flow:', err);
      setError(err.message || 'Failed to register melody');
    } finally {
      setIsProcessing(false);
    }
  }, [notes, melodyName, isWalletConnected, onRegistrationSuccess, t]);
  
  return (
    <div className={`${colors.bgCard} p-6 rounded-lg shadow-lg ${colors.text} transition-colors duration-300`}>
      <h2 className="text-2xl font-bold mb-4">{t('register.title')}</h2>
      
      <div className="mb-4">
        <label htmlFor="melodyName" className={`block text-sm font-medium ${colors.text} mb-2`}>
          {t('register.melody_name')}
        </label>
        <input
          type="text"
          id="melodyName"
          value={melodyName}
          onChange={(e) => setMelodyName(e.target.value)}
          className={`w-full px-4 py-2 border ${colors.border} rounded-lg ${colors.inputBg} ${colors.text} focus:outline-none focus:ring-2 focus:ring-[#0a84ff]`}
          placeholder={t('register.name_placeholder')}
          disabled={isProcessing}
        />
      </div>
      
      <Piano onNotesChange={handleNotesChange} maxNotes={8} />
      
      {error && (
        <div className={`p-4 mb-4 ${colors.alertBg} border-l-4 border-red-500 rounded-md ${colors.text}`}>
          {error}
        </div>
      )}
      
      {/* Status Messages with Emojis */}
      {statusMessages.length > 0 && (
        <div className={`my-4 p-4 rounded-lg ${colors.statusBg} border ${colors.border}`}>
          <h3 className={`font-medium mb-2 ${colors.text}`}>Registration Progress:</h3>
          <div className="space-y-2">
            {statusMessages.map((msg, index) => (
              <div key={index} className={`${colors.text} flex items-start`}>
                <span className="mr-2 text-xl">{msg.substring(0, 2)}</span>
                <span className="pt-1">{msg.substring(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={registerMelodyFlow}
          disabled={isProcessing || !isWalletConnected || notes.length !== 8 || !melodyName.trim()} 
          className={`w-full px-6 py-3 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a84ff] ${colors.buttonBg} ${colors.buttonHover} transition-all duration-300 shadow-md cursor-pointer ${
            isProcessing || !isWalletConnected || notes.length !== 8 || !melodyName.trim() 
              ? 'opacity-70 cursor-not-allowed' 
              : ''
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
              {t('register.processing')}
            </span>
          ) : t('register.button')}
        </button>
        
        {/* Debug info to see what's causing the button to be disabled */}
        <div className={`mt-2 p-3 ${colors.alertBg} rounded-lg text-xs ${colors.mutedText}`}>
          <div>Notes: {notes.length}/8 {notes.length === 8 ? "✅" : "❌"}</div>
          <div>Wallet connected: {isWalletConnected ? "✅" : "❌"}</div>
          <div>Melody name: {melodyName.trim() ? "✅" : "❌"}</div>
          <div>Processing: {isProcessing ? "Yes ❌" : "No ✅"}</div>
        </div>
      </div>
      
      <div className={`mt-6 text-sm ${colors.mutedText} ${colors.alertBg} p-4 rounded-lg`}>
        <p className={`font-medium mb-2 ${colors.text}`}>How it works:</p>
        <ol className="list-decimal ml-5 space-y-1">
          <li>{t('about.step1')}</li>
          <li>{t('about.step2')}</li>
          <li>{t('about.step3')}</li>
          <li>{t('about.step4')}</li>
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