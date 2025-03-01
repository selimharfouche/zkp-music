// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import WalletConnect from '../components/WalletConnect';
import MelodyRegistration from '../components/MelodyRegistration';
import UserMelodies from '../components/UserMelodies';
import FinalVerification from '../components/FinalVerification';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LanguageSelector from '../components/LanguageSelector';
import ZkpExplanation from '../components/ZkpExplanation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const { theme } = useTheme();
  const { t } = useLanguage();
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
            <h1 className="text-3xl font-bold">{t('app.title')}</h1>
            <p className={`mt-2 ${colors.mutedText}`}>{t('app.subtitle')}</p>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector />
            <ThemeSwitcher />
          </div>
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
            <h2 className="text-2xl font-bold mb-4">{t('about.title')}</h2>
            <div className="prose prose-invert">
              <p className={colors.mutedText}>
                {t('about.description')}
              </p>
              
              <h3 className={colors.text}>{t('about.how_it_works')}</h3>
              <ol className={`list-decimal ml-5 space-y-2 ${colors.mutedText}`}>
                <li>{t('about.step1')}</li>
                <li>{t('about.step2')}</li>
                <li>{t('about.step3')}</li>
                <li>{t('about.step4')}</li>
              </ol>
              
              <h3 className={colors.text}>{t('about.benefits')}</h3>
              <ul className={`list-disc ml-5 space-y-1 ${colors.mutedText}`}>
                <li>{t('about.benefit1')}</li>
                <li>{t('about.benefit2')}</li>
                <li>{t('about.benefit3')}</li>
              </ul>
              
              <p className={`mt-4 ${colors.mutedText}`}>
                {t('about.tech')}
              </p>
            </div>
          </div>
          
          {/* ZKP Explanation Component */}
          <ZkpExplanation />
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
}