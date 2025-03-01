// src/components/Piano.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface PianoProps {
  onNotesChange: (notes: string[]) => void;
  maxNotes?: number;
}

const Piano: React.FC<PianoProps> = ({ onNotesChange, maxNotes = 8 }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  
  // Notes layout (2 octaves)
  const octave1 = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
  const octave2 = ['C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'];
  const notes = [...octave1, ...octave2];
  
  // Determine if a note is a sharp (black key)
  const isSharpNote = (note: string) => note.includes('#');
  
  // Use callback to avoid unnecessary re-renders
  const addNote = useCallback((note: string) => {
    if (selectedNotes.length >= maxNotes) return;
    
    const newNotes = [...selectedNotes, note];
    setSelectedNotes(newNotes);
    onNotesChange(newNotes); // Call parent's handler directly with new value
  }, [selectedNotes, maxNotes, onNotesChange]);
  
  const removeLastNote = useCallback(() => {
    if (selectedNotes.length === 0) return;
    
    const newNotes = selectedNotes.slice(0, -1);
    setSelectedNotes(newNotes);
    onNotesChange(newNotes); // Call parent's handler directly with new value
  }, [selectedNotes, onNotesChange]);
  
  const clearNotes = useCallback(() => {
    setSelectedNotes([]);
    onNotesChange([]); // Call parent's handler directly with new value
  }, [onNotesChange]);
  
  // Play a note when clicked
  const playNote = (note: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Convert note to frequency
      const noteMap: Record<string, number> = {
        'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
        'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
        'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
        'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
        'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
      };
      
      oscillator.type = 'sine';
      oscillator.frequency.value = noteMap[note] || 440;
      
      gainNode.gain.value = 0.5;
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      setTimeout(() => oscillator.stop(), 500);
    } catch (error) {
      console.error("Failed to play note:", error);
    }
  };
  
  // Count occurrences of each note for highlighting
  const countNoteOccurrences = (noteToCount: string): number => {
    return selectedNotes.filter(note => note === noteToCount).length;
  };
  
  return (
    <div className="mt-6 mb-8">
      <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        {t('register.create_melody')} ({selectedNotes.length}/{maxNotes} {t('register.notes')})
      </h3>
      
      <div className={`piano-container relative h-40 overflow-x-auto whitespace-nowrap ${theme === 'dark' ? 'bg-[#3a3a3c]' : 'bg-gray-100'} p-4 rounded-lg`}>
        <div className="piano flex h-32">
          {notes.map((note) => {
            const isSharp = isSharpNote(note);
            const occurrences = countNoteOccurrences(note);
            const isSelected = occurrences > 0;
            
            return (
              <div
                key={note}
                className={`
                  ${isSharp ? 'black-key' : 'white-key'}
                  ${isSelected ? (isSharp ? 'bg-[#0a84ff]' : 'bg-[#5ac8fa]') : ''}
                  ${isSharp ? 'h-20 w-8 -mx-4 z-10 bg-black' : 'h-32 w-12 bg-white border border-[#48484a]'}
                  relative inline-block cursor-pointer transition-colors hover:opacity-90
                `}
                onClick={() => {
                  addNote(note);
                  playNote(note);
                }}
              >
                {!isSharp && (
                  <div className="absolute bottom-2 left-0 right-0 text-center text-xs text-black">
                    {note}
                  </div>
                )}
                {isSelected && (
                  <div className={`absolute ${isSharp ? '-bottom-5' : 'top-2'} left-0 right-0 text-center text-xs ${isSharp ? 'text-white' : 'text-black'}`}>
                    {occurrences > 1 ? `×${occurrences}` : '●'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 flex gap-2">
        <button
          onClick={clearNotes}
          className="px-4 py-2 bg-[#ff453a] text-white rounded-lg hover:bg-[#d70015] transition-colors cursor-pointer"
        >
          {t('register.clear_all')}
        </button>
        
        <button
          onClick={removeLastNote}
          disabled={selectedNotes.length === 0}
          className={`px-4 py-2 ${
            selectedNotes.length === 0 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-orange-500 hover:bg-orange-600 cursor-pointer'
          } text-white rounded-lg transition-colors`}
        >
          {t('register.delete_last')}
        </button>
        
        <div className={`ml-4 ${theme === 'dark' ? 'text-[#86868b]' : 'text-gray-500'}`}>
          {t('register.sequence')}: {selectedNotes.length > 0 ? selectedNotes.join(', ') : t('register.none')}
        </div>
      </div>
    </div>
  );
};

export default Piano;