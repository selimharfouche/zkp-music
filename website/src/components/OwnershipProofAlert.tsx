// website/src/components/OwnershipProofAlert.tsx
'use client';

import React, { useState, useEffect } from 'react';

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
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    if (!show) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [show]);
  
  const generateCertificate = () => {
    // In a real implementation, we would use jsPDF or a similar library
    // For now, we'll create a text file as a placeholder
    const certificateText = `
    ====== MELODY OWNERSHIP CERTIFICATE ======
    
    Melody Name: ${melodyData.name}
    Notes: ${melodyData.notes.join(', ')}
    Salt Value: ${melodyData.salt}
    Melody Hash: ${melodyData.hash}
    Registration Time: ${melodyData.timestamp.toLocaleString()}
    Owner Address: ${melodyData.owner}
    ${melodyData.txHash ? `Transaction Hash: ${melodyData.txHash}` : ''}
    
    IMPORTANT: Keep this document secure. The salt value is required 
    to prove your ownership of this melody.
    
    This certificate serves as cryptographic proof of your melody 
    registration on the blockchain.
    ==========================================
    `;
    
    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melody-certificate-${melodyData.name.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2c2c2e] rounded-xl p-6 max-w-2xl w-full shadow-2xl">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">🔐 IMPORTANT: Save Your Ownership Proof</h2>
          <div className="bg-[#3a3a3c] rounded-full w-8 h-8 flex items-center justify-center">
            {countdown > 0 ? (
              <span className="text-[#86868b] font-bold">{countdown}</span>
            ) : (
              <button onClick={onClose} className="text-white font-bold">✕</button>
            )}
          </div>
        </div>
        
        <div className="p-4 border-l-4 border-yellow-500 bg-[#3a3a3c] mb-4">
          <p className="text-white font-medium">
            This information is critical to prove your ownership in case of disputes.
            Save it securely - it will not be stored on the blockchain!
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <p className="text-[#86868b]">Melody Name:</p>
            <p className="text-white font-medium">{melodyData.name}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[#86868b]">Notes:</p>
            <p className="text-white font-mono">{melodyData.notes.join(', ')}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[#86868b] font-bold">Salt Value (CRITICAL):</p>
            <p className="text-white font-mono bg-[#1c1c1e] p-2 rounded">{melodyData.salt}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[#86868b]">Melody Hash:</p>
            <p className="text-white font-mono bg-[#1c1c1e] p-2 rounded break-all">{melodyData.hash}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-[#86868b]">Registration Time:</p>
            <p className="text-white">{melodyData.timestamp.toLocaleString()}</p>
          </div>
          
          {melodyData.txHash && (
            <div className="space-y-1">
              <p className="text-[#86868b]">Transaction Hash:</p>
              <div className="flex items-center">
                <p className="text-white font-mono bg-[#1c1c1e] p-2 rounded break-all mr-2">{melodyData.txHash}</p>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${melodyData.txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#0a84ff] hover:underline"
                >
                  View
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={generateCertificate}
            className="bg-[#0a84ff] hover:bg-[#0070d8] text-white font-bold py-3 px-6 rounded-lg flex items-center"
          >
            <span className="mr-2">📄</span> Download Certificate
          </button>
          
          <button
            onClick={() => {
              // Copy to clipboard
              const text = `Melody Name: ${melodyData.name}
Notes: ${melodyData.notes.join(', ')}
Salt Value: ${melodyData.salt}
Melody Hash: ${melodyData.hash}
Registration Time: ${melodyData.timestamp.toLocaleString()}`;
              navigator.clipboard.writeText(text);
              alert("Ownership details copied to clipboard!");
            }}
            className="bg-[#3a3a3c] hover:bg-[#48484a] text-white font-bold py-3 px-6 rounded-lg"
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnershipProofAlert;