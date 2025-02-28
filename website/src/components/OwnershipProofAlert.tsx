// src/components/OwnershipProofAlert.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface OwnershipProofAlertProps {
  show: boolean;
  onClose: () => void;
  melodyData: {
    name: string;
    notes: string[];
    salt: string;
    hash: string;
    timestamp: Date;
    owner: string;
    txHash?: string;
  };
}

const OwnershipProofAlert: React.FC<OwnershipProofAlertProps> = ({ 
  show, 
  onClose, 
  melodyData 
}) => {
  const { theme } = useTheme();
  const [countdown, setCountdown] = useState(10);
  
  // Theme-based styles
  const getThemeClasses = () => {
    return {
      bgOverlay: theme === 'dark' ? 'bg-black' : 'bg-gray-700',
      bgCard: theme === 'dark' ? 'bg-[#2c2c2e]' : 'bg-white',
      text: theme === 'dark' ? 'text-white' : 'text-black',
      mutedText: theme === 'dark' ? 'text-[#86868b]' : 'text-gray-500',
      bgItem: theme === 'dark' ? 'bg-[#1c1c1e]' : 'bg-gray-100',
      counterBg: theme === 'dark' ? 'bg-[#3a3a3c]' : 'bg-gray-200',
      border: theme === 'dark' ? 'border-[#48484a]' : 'border-gray-200',
      warningBorder: 'border-yellow-500',
      downloadBg: theme === 'dark' ? 'bg-[#0a84ff]' : 'bg-blue-500',
      downloadHover: theme === 'dark' ? 'hover:bg-[#0070d8]' : 'hover:bg-blue-600',
      copyBg: theme === 'dark' ? 'bg-[#3a3a3c]' : 'bg-gray-200',
      copyHover: theme === 'dark' ? 'hover:bg-[#48484a]' : 'hover:bg-gray-300'
    };
  };
  
  const colors = getThemeClasses();
  
  // Rest of component with updated styles
  
  return (
    <div className={`fixed inset-0 ${colors.bgOverlay} bg-opacity-80 flex items-center justify-center z-50 p-4`}>
      <div className={`${colors.bgCard} rounded-xl p-6 max-w-2xl w-full shadow-2xl`}>
        {/* Rest of the component with updated styles */}
      </div>
    </div>
  );
};

export default OwnershipProofAlert;