import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition border flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] text-amber-300 hover:text-amber-200'
          : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900 shadow-sm'
      } ${className}`}
      title={theme === 'dark' ? 'Switch to Light Mode (Ivory Parchment)' : 'Switch to Dark Mode (Obsidian Void)'}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun size={15} className="transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon size={15} className="transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
};
