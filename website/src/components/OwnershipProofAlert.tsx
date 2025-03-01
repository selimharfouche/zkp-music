// website/src/components/OwnershipProofAlert.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { jsPDF } from 'jspdf';

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
  
  // Theme-based styles
  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        bgCard: 'bg-[#2c2c2e]',
        bgContent: 'bg-[#3a3a3c]',
        bgCode: 'bg-[#1c1c1e]',
        text: 'text-white',
        mutedText: 'text-[#86868b]',
        border: 'border-[#48484a]',
        btnPrimary: 'bg-[#0a84ff] hover:bg-[#0070d8]',
        btnSecondary: 'bg-[#3a3a3c] hover:bg-[#48484a]'
      };
    } else {
      return {
        bgCard: 'bg-white',
        bgContent: 'bg-gray-100',
        bgCode: 'bg-gray-200',
        text: 'text-black',
        mutedText: 'text-gray-500',
        border: 'border-gray-200',
        btnPrimary: 'bg-blue-500 hover:bg-blue-600',
        btnSecondary: 'bg-gray-200 hover:bg-gray-300'
      };
    }
  };
  
  const colors = getThemeClasses();
  
  // Function to generate beautiful PDF certificate
  const generatePDFCertificate = () => {
    try {
      console.log("=== ZKP CERTIFICATE GENERATION PROCESS ===");
      console.log("We're creating a certificate that proves melody ownership while preserving privacy");
      console.log("Zero-Knowledge Proof Mathematical Foundation:");
      console.log("1. Original melody notes:", melodyData.notes);
      console.log("2. Salt value (randomness for security):", melodyData.salt);
      
      console.log("\nMathematical transformations:");
      console.log("- First, notes are converted to MIDI values (numerical representation)");
      console.log("- Example: C4 → 60, D4 → 62, etc.");
      console.log("- Then, we use Poseidon hash function (designed for ZKP systems)");
      console.log("- Mathematically: hash = Poseidon([midi_values, salt])");
      console.log("- This hash uniquely represents the melody without revealing it");
      console.log("- Hash value:", melodyData.hash);
      
      console.log("\nZero-Knowledge Proof generation:");
      console.log("1. We create a circuit using Circom that defines our constraint system");
      console.log("2. The circuit takes private inputs (melody+salt) and public inputs (hash)");
      console.log("3. We generate a proof π using the Groth16 algorithm");
      console.log("4. The proof is a set of elliptic curve points that satisfy the circuit constraints");
      console.log("5. This proof can verify that someone knows the melody WITHOUT revealing it");
      console.log("6. Mathematically: π = Prove(melody, salt, hash)");
      
      console.log("\nWhat makes this zero-knowledge?");
      console.log("- Completeness: Honest prover with correct melody can always create valid proof");
      console.log("- Soundness: Dishonest prover cannot create valid proof without knowing melody");
      console.log("- Zero-knowledge: The proof reveals nothing about the melody itself");
      console.log("- The only information revealed is the hash, which is stored on blockchain");
      
      console.log("\nBlockchain verification:");
      console.log("- The proof is verified on-chain using a smart contract");
      console.log("- Anyone can verify ownership without learning the melody");
      console.log("- Transaction hash:", melodyData.txHash || "Not available");
      
      // Create new document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Document dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Colors
      const primaryColor = [0, 101, 163];  // Blue
      const accentColor = [227, 169, 15];  // Gold
      const darkText = [51, 51, 51];       // Near-black
      const lightText = [102, 102, 102];   // Gray
      const criticalColor = [255, 248, 225]; // Light yellow for highlighting
      const criticalBorder = [237, 162, 12]; // Darker yellow for border
      
      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Decorative top and bottom borders
      doc.setDrawColor(0, 101, 163);
      doc.setLineWidth(3);
      doc.line(15, 12, pageWidth - 15, 12);
      doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
      
      // Header with decorative elements
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...primaryColor);
      doc.text('MELODY OWNERSHIP CERTIFICATE', pageWidth / 2, 25, { align: 'center' });
      
      // Subtitle
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(...lightText);
      doc.text('Secured by Zero-Knowledge Proofs & Blockchain Technology', pageWidth / 2, 32, { align: 'center' });
      
      // Decorative elements - music notes represented as text
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...primaryColor);
      // Use standard text instead of music symbols to avoid encoding issues
      doc.text('∽ MUSIC ZKP SYSTEM ∽', pageWidth / 2, 40, { align: 'center' });
      
      // Certificate border
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.roundedRect(15, 45, pageWidth - 30, pageHeight - 60, 3, 3, 'S');
      
      // Content area
      doc.setDrawColor(...lightText);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, 50, pageWidth - 40, pageHeight - 70, 2, 2, 'S');
      
      // Certificate content
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...darkText);
      doc.text('CERTIFICATE DETAILS', 25, 60);
      
      // Add certificate data
      let y = 70;
      const leftMargin = 25;
      const labelWidth = 45;
      
      // Function to add fields to the certificate
      const addField = (label, value, isHighlighted = false) => {
        // Field label
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(11);
        doc.text(`${label}:`, leftMargin, y);
        
        // If the field should be highlighted (critical info)
        if (isHighlighted) {
          // Calculate text width and draw highlight background
          const valueWidth = doc.getTextWidth(value);
          doc.setFillColor(...criticalColor);
          doc.setDrawColor(...criticalBorder);
          doc.roundedRect(leftMargin + labelWidth, y - 5, valueWidth + 10, 7, 1, 1, 'FD');
        }
        
        // Field value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkText);
        
        // Handle long text that needs wrapping
        if (value.length > 50) {
          const splitValue = doc.splitTextToSize(value, pageWidth - leftMargin - labelWidth - 10);
          doc.text(splitValue, leftMargin + labelWidth, y);
          y += (splitValue.length - 1) * 6; // Adjust Y position based on number of lines
        } else {
          doc.text(value, leftMargin + labelWidth, y);
        }
        
        y += 10; // Move to next line
      };
      
      // Add certificate fields
      addField('Melody Name', melodyData.name);
      addField('Notes Sequence', melodyData.notes.join(', '));
      addField('Registered By', melodyData.owner);
      addField('Registration Time', melodyData.timestamp.toLocaleString());
      
      // Critical fields with highlighting
      addField('Salt Value (CRITICAL)', melodyData.salt, true);
      
      // For the hash, we'll wrap it if needed
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.text('Melody Hash:', leftMargin, y);
      
      // Add hash with highlighting
      doc.setFillColor(...criticalColor);
      doc.setDrawColor(...criticalBorder);
      doc.roundedRect(leftMargin + labelWidth, y - 5, pageWidth - leftMargin - labelWidth - 30, 7, 1, 1, 'FD');
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      const hashText = doc.splitTextToSize(melodyData.hash, pageWidth - leftMargin - labelWidth - 35);
      doc.text(hashText, leftMargin + labelWidth, y);
      y += hashText.length * 6 + 4;
      
      // Add transaction hash if available
      if (melodyData.txHash) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('Transaction Hash:', leftMargin, y);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...darkText);
        const txHashText = doc.splitTextToSize(melodyData.txHash, pageWidth - leftMargin - labelWidth - 35);
        doc.text(txHashText, leftMargin + labelWidth, y);
        y += txHashText.length * 6 + 10;
      } else {
        y += 10;
      }
      
      // Important notice
      doc.setFillColor(255, 240, 240);
      doc.setDrawColor(255, 100, 100);
      doc.roundedRect(leftMargin, y, pageWidth - leftMargin * 2, 25, 2, 2, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.setFontSize(12);
      doc.text('IMPORTANT NOTICE:', leftMargin + 5, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(10);
      const noticeText = 'Keep this certificate secure and confidential. The salt value is required to prove your ownership of this melody. This certificate serves as cryptographic proof of your melody registration on the blockchain.';
      const noticeLines = doc.splitTextToSize(noticeText, pageWidth - leftMargin * 2 - 12);
      doc.text(noticeLines, leftMargin + 5, y + 12);
      
      y += 35;
      
      // Verification instructions
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.text('HOW TO VERIFY OWNERSHIP:', leftMargin, y);
      y += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(10);
      
      const verifySteps = [
        '1. Visit the Music ZKP System website',
        '2. Go to the Verification section',
        '3. Enter your melody notes and salt value',
        '4. The system will compute the hash and verify ownership'
      ];
      
      verifySteps.forEach(step => {
        doc.text(step, leftMargin, y);
        y += 5;
      });
      
      // Footer with validation
      const footerY = pageHeight - 25;
      doc.setLineWidth(0.5);
      doc.setDrawColor(...lightText);
      doc.line(leftMargin * 2, footerY - 5, pageWidth - leftMargin * 2, footerY - 5);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...lightText);
      doc.text('This certificate was automatically generated by the Music ZKP System', pageWidth / 2, footerY, { align: 'center' });
      doc.text(`Certificate ID: ${melodyData.hash.substring(0, 16)}...`, pageWidth / 2, footerY + 5, { align: 'center' });
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 10, { align: 'center' });
      
      // Save the PDF
      doc.save(`melody-certificate-${melodyData.name.replace(/\s+/g, '-')}.pdf`);
      
      console.log("\n=== CERTIFICATE GENERATED SUCCESSFULLY ===");
      console.log("The PDF contains all necessary information to prove melody ownership.");
      console.log("Remember: This is a ZERO-KNOWLEDGE system - you can prove ownership WITHOUT revealing the actual melody!");
      
    } catch (error) {
      console.error('Error generating PDF certificate:', error);
      alert('Failed to generate PDF certificate. Please try again.');
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      {/* Semi-transparent backdrop - reduced opacity */}
      <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => countdown === 0 && onClose()}></div>
      
      {/* Alert content */}
      <div className={`${colors.bgCard} rounded-xl p-6 max-w-2xl w-full shadow-2xl relative z-[10000]`}>
        <div className="mb-4 flex justify-between items-center">
          <h2 className={`text-2xl font-bold ${colors.text}`}>🔐 IMPORTANT: Save Your Ownership Proof</h2>
          <div className={`${colors.bgContent} rounded-full w-8 h-8 flex items-center justify-center`}>
            {countdown > 0 ? (
              <span className={colors.mutedText}>{countdown}</span>
            ) : (
              <button onClick={onClose} className={`${colors.text} font-bold cursor-pointer`}>✕</button>
            )}
          </div>
        </div>
        
        <div className={`p-4 border-l-4 border-yellow-500 ${colors.bgContent} mb-4`}>
          <p className={`${colors.text} font-medium`}>
            This information is critical to prove your ownership in case of disputes.
            Save it securely - it will not be stored on the blockchain!
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <p className={colors.mutedText}>Melody Name:</p>
            <p className={colors.text}>{melodyData.name}</p>
          </div>
          
          <div className="space-y-1">
            <p className={colors.mutedText}>Notes:</p>
            <p className={`${colors.text} font-mono`}>{melodyData.notes.join(', ')}</p>
          </div>
          
          <div className="space-y-1">
            <p className={`${colors.mutedText} font-bold`}>Salt Value (CRITICAL):</p>
            <p className={`${colors.text} font-mono ${colors.bgCode} p-2 rounded`}>{melodyData.salt}</p>
          </div>
          
          <div className="space-y-1">
            <p className={colors.mutedText}>Melody Hash:</p>
            <p className={`${colors.text} font-mono ${colors.bgCode} p-2 rounded break-all`}>{melodyData.hash}</p>
          </div>
          
          <div className="space-y-1">
            <p className={colors.mutedText}>Registration Time:</p>
            <p className={colors.text}>{melodyData.timestamp.toLocaleString()}</p>
          </div>
          
          {melodyData.txHash && (
            <div className="space-y-1">
              <p className={colors.mutedText}>Transaction Hash:</p>
              <div className="flex items-center">
                <p className={`${colors.text} font-mono ${colors.bgCode} p-2 rounded break-all mr-2`}>{melodyData.txHash}</p>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${melodyData.txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#0a84ff] hover:underline cursor-pointer"
                >
                  View
                </a>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={generatePDFCertificate}
            className={`${colors.btnPrimary} text-white font-bold py-3 px-6 rounded-lg flex items-center cursor-pointer`}
          >
            <span className="mr-2">📄</span> Download PDF Certificate
          </button>
          
          <button
            onClick={() => {
              // Copy to clipboard
              try {
                const text = `Melody Name: ${melodyData.name}
Notes: ${melodyData.notes.join(', ')}
Salt Value: ${melodyData.salt}
Melody Hash: ${melodyData.hash}
Registration Time: ${melodyData.timestamp.toLocaleString()}`;
                navigator.clipboard.writeText(text);
                alert("Ownership details copied to clipboard!");
              } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                alert('Failed to copy to clipboard. Please try again.');
              }
            }}
            className={`${colors.btnSecondary} ${colors.text} font-bold py-3 px-6 rounded-lg cursor-pointer`}
          >
            Copy to Clipboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnershipProofAlert;