// src/components/LanguageSelector.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const LanguageSelector = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Get theme-based styles
  const getStyles = () => {
    if (theme === 'dark') {
      return {
        button: 'bg-[#2c2c2e] text-white hover:bg-[#3a3a3c] border-[#48484a]',
        dropdown: 'bg-[#2c2c2e] border-[#48484a]',
        option: 'hover:bg-[#3a3a3c]',
        activeOption: 'bg-[#0a84ff] text-white',
        text: 'text-white',
      };
    } else {
      return {
        button: 'bg-white text-gray-800 hover:bg-gray-100 border-gray-200',
        dropdown: 'bg-white border-gray-200 shadow-lg',
        option: 'hover:bg-gray-100',
        activeOption: 'bg-blue-500 text-white',
        text: 'text-gray-800',
      };
    }
  };
  
  const styles = getStyles();
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-md border ${styles.button} flex items-center space-x-2 transition-colors cursor-pointer`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>{language === 'en' ? '🇬🇧' : '🇫🇷'}</span>
        <span className={styles.text}>{t('language.select')}</span>
        <svg 
          className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className={`absolute right-0 mt-2 py-1 w-48 rounded-md border ${styles.dropdown} z-20 transition-all`}
          role="menu"
        >
          <button
            onClick={() => {
              setLanguage('en');
              setIsOpen(false);
            }}
            className={`flex items-center w-full text-left px-4 py-2 ${language === 'en' ? styles.activeOption : styles.option} cursor-pointer`}
            role="menuitem"
          >
            <span className="mr-3">🇬🇧</span>
            <span>English</span>
          </button>
          <button
            onClick={() => {
              setLanguage('fr');
              setIsOpen(false);
            }}
            className={`flex items-center w-full text-left px-4 py-2 ${language === 'fr' ? styles.activeOption : styles.option} cursor-pointer`}
            role="menuitem"
          >
            <span className="mr-3">🇫🇷</span>
            <span>Français</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;