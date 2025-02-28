// src/context/ThemeContext.tsx
'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Check for stored preference or use system preference
  const [theme, setTheme] = useState<Theme>('dark');
  
  useEffect(() => {
    // On component mount, check for stored preference
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme as Theme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      // Check system preference if no stored preference
      setTheme('light');
    }
  }, []);
  
  // Update document when theme changes
  useEffect(() => {
    // Update data attribute on document for CSS
    document.documentElement.setAttribute('data-theme', theme);
    // Store preference in localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Toggle function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook for using the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};