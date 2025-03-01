// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import MelodyRegistration from '../components/MelodyRegistration';
import UserMelodies from '../components/UserMelodies';
import FinalVerification from '../components/FinalVerification';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { theme } = useTheme();
  const [walletConnected, setWalletConnected] = useState(false);
  const [refreshMelodies, setRefreshMelodies] = useState(0);
  
  const handleWalletConnect = (address: string) => {
    setWalletConnected(true);
  };
  
  const handleRegistrationSuccess = (melodyHash: string) => {
    // Trigger a refresh of the melodies list
    setRefreshMelodies(prev => prev + 1);
  };
  
  // Get theme-based classes
  const getThemeClasses = () => {
    return {
      bgMain: theme === 'dark' ? 'bg-[#1c1c1e]' : 'bg-[#f2f2f7]',
      bgHeader: theme === 'dark' ? 'bg-[#1c1c1e]' : 'bg-white',
      bgFooter: theme === 'dark' ? 'bg-[#1c1c1e]' : 'bg-white',
      borderColor: theme === 'dark' ? 'border-[#38383a]' : 'border-gray-200',
      text: theme === 'dark' ? 'text-white' : 'text-black',
      mutedText: theme === 'dark' ? 'text-[#86868b]' : 'text-gray-500',
      bgAbout: theme === 'dark' ? 'bg-[#2c2c2e]' : 'bg-white'
    };
  };
  
  const colors = getThemeClasses();
  
  return (
    <main className={`min-h-screen ${colors.bgMain} transition-colors duration-300 pb-20`}>
      <header className={`${colors.bgHeader} ${colors.text} py-6 border-b ${colors.borderColor} transition-colors duration-300`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Music ZKP System</h1>
            <p className={`mt-2 ${colors.mutedText}`}>Register and verify your melodies with zero-knowledge proofs</p>
          </div>
          <ThemeSwitcher />
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8">
          <WalletConnect onConnect={handleWalletConnect} />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <MelodyRegistration 
              isWalletConnected={walletConnected}
              onRegistrationSuccess={handleRegistrationSuccess} 
            />
            
            <UserMelodies 
              isWalletConnected={walletConnected}
              refreshTrigger={refreshMelodies}
            />
          </div>
          
          <FinalVerification isWalletConnected={walletConnected} />
          
          <div className={`${colors.bgAbout} p-6 rounded-lg shadow-lg ${colors.text} transition-colors duration-300`}>
            <h2 className="text-2xl font-bold mb-4">About This Project</h2>
            <div className="prose prose-invert">
              <p className={colors.mutedText}>
                This decentralized application allows you to register ownership of musical melodies
                without ever revealing the actual notes to anyone else.
              </p>
              
              <h3 className={colors.text}>How It Works</h3>
              <ol className={`list-decimal ml-5 space-y-2 ${colors.mutedText}`}>
                <li>You create a melody using the on-screen piano</li>
                <li>The app creates a cryptographic hash of your melody along with a random salt</li>
                <li>A zero-knowledge proof is generated that proves you know the melody without revealing the notes</li>
                <li>This proof is verified on the blockchain, establishing your ownership</li>
              </ol>
              
              <h3 className={colors.text}>Benefits</h3>
              <ul className={`list-disc ml-5 space-y-1 ${colors.mutedText}`}>
                <li>Establish verifiable ownership without exposing your creative work</li>
                <li>Secure timestamped proof of your musical ideas</li>
                <li>Protect against unauthorized copying while still being able to prove ownership</li>
              </ul>
              
              <p className={`mt-4 ${colors.mutedText}`}>
                This project uses zero-knowledge proofs built with Circom, and smart contracts
                deployed on the Sepolia testnet.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className={`${colors.bgFooter} ${colors.text} py-6 mt-8 border-t ${colors.borderColor} transition-colors duration-300`}>
        <div className="container mx-auto px-4 text-center">
          <p className={colors.mutedText}>&copy; 2025 Music ZKP Project</p>
          <p className={`mt-2 ${colors.mutedText}`}>
            Built with Next.js, Ethers.js, and Circom
          </p>
        </div>
      </footer>
    </main>
  );
};