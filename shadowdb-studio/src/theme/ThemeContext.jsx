import React, { useState, useEffect } from 'react';
import { ACCENT_COLORS } from './themeConfig';
import { ThemeContext } from './themeContextInstance';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('shadowdb_theme') || 'dark';
  });

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('shadowdb_accent') || 'cyan';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accent);
    localStorage.setItem('shadowdb_theme', theme);
  }, [theme, accent]);

  useEffect(() => {
    localStorage.setItem('shadowdb_accent', accent);
  }, [accent]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, accent, setAccent, ACCENT_COLORS }}>
      {children}
    </ThemeContext.Provider>
  );
}
