// website/src/components/Piano.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface PianoProps {
  onNotesChange: (notes: string[]) => void;
  maxNotes?: number;
}

const Piano: React.FC<PianoProps> = ({ onNotesChange, maxNotes = 8 }) => {
  const { theme } = useTheme();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  
  // Notes layout (2 octaves)
  const octave1 = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4'];
  const octave2 = ['C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'];
  const notes = [...octave1, ...octave2];
  
  // Theme colors
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        pianoContainer: 'bg-[#3a3a3c]',
        whiteKeyBase: 'bg-white',
        whiteKeySelected: 'bg-[#5ac8fa]',
        blackKeyBase: 'bg-black',
        blackKeySelected: 'bg-[#0a84ff]',
        keyBorder: 'border-[#48484a]',
        text: 'text-white',
        buttonBg: 'bg-[#ff453a]',
        buttonHover: 'hover:bg-[#d70015]',
        mutedText: 'text-[#86868b]'
      };
    } else {
      return {
        pianoContainer: 'bg-gray-100',
        whiteKeyBase: 'bg-white',
        whiteKeySelected: 'bg-blue-300',
        blackKeyBase: 'bg-black',
        blackKeySelected: 'bg-blue-600',
        keyBorder: 'border-gray-300',
        text: 'text-black',
        buttonBg: 'bg-red-500',
        buttonHover: 'hover:bg-red-600',
        mutedText: 'text-gray-500'
      };
    }
  };
  
  const colors = getThemeColors();
  
  // Determine if a note is a sharp (black key)
  const isSharpNote = (note: string) => note.includes('#');
  
  const toggleNote = (note: string) => {
    setSelectedNotes(prev => {
      // If the note is already selected, remove it
      if (prev.includes(note)) {
        return prev.filter(n => n !== note);
      }
      
      // If we've reached the max number of notes, don't add more
      if (prev.length >= maxNotes) {
        return prev;
      }
      
      // Add the note
      return [...prev, note];
    });
  };
  
  const clearNotes = () => {
    setSelectedNotes([]);
  };
  
  // Play a note when clicked
  const playNote = (note: string) => {
    // This is a simple way to play notes. For a more sophisticated approach,
    // you'd use the Web Audio API or a library like Tone.js
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Convert note to frequency (simplified)
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
    } catch (err) {
      console.error("Error playing note:", err);
    }
  };
  
  // Update the parent component when the selected notes change
  useEffect(() => {
    onNotesChange(selectedNotes);
  }, [selectedNotes, onNotesChange]);
  
  return (
    <div className="mt-6 mb-8">
      <h3 className={`text-lg font-medium mb-2 ${colors.text}`}>
        Create Your Melody ({selectedNotes.length}/{maxNotes} notes)
      </h3>
      
      <div className={`piano-container relative h-40 overflow-x-auto whitespace-nowrap ${colors.pianoContainer} p-4 rounded-lg`}>
        <div className="piano flex h-32">
          {notes.map((note, index) => {
            const isSharp = isSharpNote(note);
            const isSelected = selectedNotes.includes(note);
            
            return (
              <div
                key={note}
                className={`
                  ${isSharp 
                    ? `black-key ${isSelected ? colors.blackKeySelected : colors.blackKeyBase}` 
                    : `white-key ${isSelected ? colors.whiteKeySelected : colors.whiteKeyBase}`
                  }
                  ${isSharp 
                    ? 'h-20 w-8 -mx-4 z-10' 
                    : `h-32 w-12 border ${colors.keyBorder}`
                  }
                  relative inline-block cursor-pointer transition-colors hover:opacity-90
                `}
                onClick={() => {
                  toggleNote(note);
                  playNote(note);
                }}
              >
                {!isSharp && (
                  <div className="absolute bottom-2 left-0 right-0 text-center text-xs">
                    {note}
                  </div>
                )}
                {isSharp && isSelected && (
                  <div className="absolute -bottom-5 left-0 right-0 text-center text-xs text-white">
                    {note}
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
          className={`px-4 py-2 ${colors.buttonBg} text-white rounded-lg ${colors.buttonHover} transition-colors cursor-pointer`}
        >
          Clear Notes
        </button>
        <div className={`ml-4 ${colors.mutedText}`}>
          Selected notes: {selectedNotes.length > 0 ? selectedNotes.join(', ') : 'None'}
        </div>
      </div>
    </div>
  );
};

export default Piano;