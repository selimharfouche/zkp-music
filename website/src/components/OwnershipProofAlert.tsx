// src/components/OwnershipProofAlert.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { language, t } = useLanguage();
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
      // Create new document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Document dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Colors with proper tuple types
      const primaryColor: [number, number, number] = [0, 101, 163];  // Blue
      const accentColor: [number, number, number] = [227, 169, 15];  // Gold
      const darkText: [number, number, number] = [51, 51, 51];       // Near-black
      const lightText: [number, number, number] = [102, 102, 102];   // Gray
      const criticalColor: [number, number, number] = [255, 248, 225]; // Light yellow for highlighting
      const criticalBorder: [number, number, number] = [237, 162, 12]; // Darker yellow for border
      
      // Background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      // Decorative top and bottom borders
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(3);
      doc.line(15, 12, pageWidth - 15, 12);
      doc.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
      
      // Header with decorative elements
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(...primaryColor);
      doc.text(t('certificate.title'), pageWidth / 2, 25, { align: 'center' });
      
      // Subtitle
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(...lightText);
      doc.text(t('certificate.subtitle'), pageWidth / 2, 32, { align: 'center' });
      
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
      doc.text(t('certificate.details'), 25, 60);
      
      // Add certificate data
      let y = 70;
      const leftMargin = 25;
      const labelWidth = 45;
      
      // Function to add fields to the certificate - with proper type annotations
      const addField = (label: string, value: string, isHighlighted: boolean = false) => {
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
      addField(t('certificate.melody_name'), melodyData.name);
      addField(t('certificate.notes'), melodyData.notes.join(', '));
      addField(t('certificate.registered_by'), melodyData.owner);
      addField(t('certificate.time'), melodyData.timestamp.toLocaleString());
      
      // Critical fields with highlighting
      addField(t('certificate.salt'), melodyData.salt, true);
      
      // For the hash, we'll handle the multi-line highlighting properly
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(11);
      doc.text(t('certificate.hash') + ':', leftMargin, y);
      
      // Calculate how many lines the hash will take up
      const hashText = doc.splitTextToSize(melodyData.hash, pageWidth - leftMargin - labelWidth - 35);
      const hashHeight = hashText.length * 6; // Each line is about 6mm high
      
      // Draw highlight background that covers all lines
      doc.setFillColor(...criticalColor);
      doc.setDrawColor(...criticalBorder);
      doc.roundedRect(leftMargin + labelWidth, y - 5, pageWidth - leftMargin - labelWidth - 30, hashHeight + 4, 1, 1, 'FD');
      
      // Add the hash text
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.text(hashText, leftMargin + labelWidth, y);
      y += hashHeight + 4;
      
      // Add transaction hash if available
      if (melodyData.txHash) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(t('certificate.tx_hash') + ':', leftMargin, y);
        
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
      doc.text(t('certificate.notice_title') + ':', leftMargin + 5, y + 6);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(10);
      const noticeText = t('certificate.notice');
      const noticeLines = doc.splitTextToSize(noticeText, pageWidth - leftMargin * 2 - 12);
      doc.text(noticeLines, leftMargin + 5, y + 12);
      
      y += 35;
      
      // Verification instructions
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.setFontSize(12);
      doc.text(t('certificate.verify_title') + ':', leftMargin, y);
      y += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...darkText);
      doc.setFontSize(10);
      
      const verifySteps = [
        t('certificate.verify_step1'),
        t('certificate.verify_step2'),
        t('certificate.verify_step3'),
        t('certificate.verify_step4')
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
      doc.text(t('certificate.footer'), pageWidth / 2, footerY, { align: 'center' });
      doc.text(`${t('certificate.id')}: ${melodyData.hash.substring(0, 16)}...`, pageWidth / 2, footerY + 5, { align: 'center' });
      doc.text(`${t('certificate.generated')}: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 10, { align: 'center' });
      
      // Save the PDF
      doc.save(`melody-certificate-${melodyData.name.replace(/\s+/g, '-')}.pdf`);
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
          <h2 className={`text-2xl font-bold ${colors.text}`}>{t('ownership.title')}</h2>
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
            {t('ownership.description')}
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="space-y-1">
            <p className={colors.mutedText}>{t('ownership.melody_name')}:</p>
            <p className={colors.text}>{melodyData.name}</p>
          </div>
          
          <div className="space-y-1">
            <p className={colors.mutedText}>{t('ownership.notes')}:</p>
            <p className={`${colors.text} font-mono`}>{melodyData.notes.join(', ')}</p>
          </div>
          
          <div className="space-y-1">
            <p className={`${colors.mutedText} font-bold`}>{t('ownership.salt')}:</p>
            <p className={`${colors.text} font-mono ${colors.bgCode} p-2 rounded`}>{melodyData.salt}</p>
          </div>
          
          <div className="space-y-1">
            <p className={colors.mutedText}>{t('ownership.hash')}:</p>
            <p className={`${colors.text} font-mono ${colors.bgCode} p-2 rounded break-all`}>{melodyData.hash}</p>
          </div>
          
          <div className="space-y-1">
            <p className={colors.mutedText}>{t('ownership.time')}:</p>
            <p className={colors.text}>{melodyData.timestamp.toLocaleString()}</p>
          </div>
          
          {melodyData.txHash && (
            <div className="space-y-1">
              <p className={colors.mutedText}>{t('ownership.tx_hash')}:</p>
              <div className="flex items-center">
                <p className={`${colors.text} font-mono ${colors.bgCode} p-2 rounded break-all mr-2`}>{melodyData.txHash}</p>
                <a 
                  href={`https://sepolia.etherscan.io/tx/${melodyData.txHash}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#0a84ff] hover:underline cursor-pointer"
                >
                  {t('ownership.view')}
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
            <span className="mr-2">📄</span> {t('ownership.download')}
          </button>
          
          <button
            onClick={() => {
              // Copy to clipboard
              try {
                const text = `${t('ownership.melody_name')}: ${melodyData.name}
${t('ownership.notes')}: ${melodyData.notes.join(', ')}
${t('ownership.salt')}: ${melodyData.salt}
${t('ownership.hash')}: ${melodyData.hash}
${t('ownership.time')}: ${melodyData.timestamp.toLocaleString()}`;
                navigator.clipboard.writeText(text);
                alert(t('ownership.copy_success'));
              } catch (error) {
                console.error('Failed to copy to clipboard:', error);
                alert('Failed to copy to clipboard. Please try again.');
              }
            }}
            className={`${colors.btnSecondary} ${colors.text} font-bold py-3 px-6 rounded-lg cursor-pointer`}
          >
            {t('ownership.copy')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnershipProofAlert;