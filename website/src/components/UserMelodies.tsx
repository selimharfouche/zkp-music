// src/components/UserMelodies.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { getUserMelodies } from '../utils/web3Utils';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

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
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [melodies, setMelodies] = useState<MelodyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track client-side mounting to avoid hydration issues
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true once the component is mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Theme-based styles
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#2c2c2e]',
        text: 'text-white',
        mutedText: 'text-[#86868b]',
        bgItem: 'bg-[#3a3a3c]',
        border: 'border-[#48484a]'
      };
    } else {
      return {
        bgCard: 'bg-white',
        text: 'text-black',
        mutedText: 'text-gray-500',
        bgItem: 'bg-gray-100',
        border: 'border-gray-200'
      };
    }
  };
  
  const colors = getThemeClasses();
  
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
      <div className={`${colors.bgCard} p-6 rounded-lg shadow-lg ${colors.text} transition-colors duration-300`}>
        <h2 className="text-2xl font-bold mb-4">{t('melodies.title')}</h2>
        <p className={colors.mutedText}>{t('melodies.loading')}</p>
      </div>
    );
  }
  
  if (!isWalletConnected) {
    return (
      <div className={`${colors.bgCard} p-6 rounded-lg shadow-lg ${colors.text} transition-colors duration-300`}>
        <h2 className="text-2xl font-bold mb-4">{t('melodies.title')}</h2>
        <p className={colors.mutedText}>{t('melodies.connect_wallet')}</p>
      </div>
    );
  }
  
  return (
    <div className={`${colors.bgCard} p-6 rounded-lg shadow-lg ${colors.text} transition-colors duration-300`}>
      <h2 className="text-2xl font-bold mb-4">{t('melodies.title')}</h2>
      
      {error && (
        <div className={`p-4 mb-4 ${colors.bgItem} border-l-4 border-red-500 rounded-md ${colors.text}`}>
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className={`animate-pulse ${colors.mutedText}`}>{t('melodies.loading')}</div>
        </div>
      ) : (
        <>
          {melodies.length === 0 ? (
            <p className={colors.mutedText}>{t('melodies.none')}</p>
          ) : (
            <div className="space-y-4">
              {melodies.map((melody, index) => (
                <div key={index} className={`p-4 border ${colors.border} rounded-lg ${colors.bgItem}`}>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <h3 className={`font-medium ${colors.text}`}>{t('melodies.melody_number')}{index + 1}</h3>
                      <p className={`text-sm ${colors.mutedText} break-all mt-1`}>{t('melodies.hash')}: {melody.hash}</p>
                      {melody.registrationTime && (
                        <p className={`text-sm ${colors.mutedText} mt-1`}>
                          {t('melodies.registered_on')}: {melody.registrationTime.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 md:mt-0">
                      {melody.txHash ? (
                        
                          href={`https://sepolia.etherscan.io/tx/${melody.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0a84ff] hover:underline text-sm font-medium cursor-pointer"
                        >
                          {t('melodies.view_transaction')}
                        </a>
                      ) : (
                        <span className={`${colors.mutedText} text-sm`}>
                          {t('melodies.no_transaction')}
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