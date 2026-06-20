import React from 'react';
import { Check } from 'lucide-react';

const themes = [
  { id: 'minimal', name: 'Minimal', color: '#fcfcfc', border: '#e5e5e5' },
  { id: 'dark', name: 'Dark', color: '#0f0f12', border: '#2e2e3f' },
  { id: 'gradient', name: 'Gradient', color: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)', border: 'transparent' },
  { id: 'neon', name: 'Neon', color: '#030303', border: '#39ff14' },
  { id: 'pastel', name: 'Pastel', color: '#faf6f0', border: '#c7d2fe' },
];

const ThemeSelector = ({ currentTheme, onSelectTheme }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
      {themes.map((theme) => (
        <div
          key={theme.id}
          className={`cursor-pointer rounded-lg p-2 border-2 transition-all ${
            currentTheme === theme.id ? 'border-indigo-600 scale-105' : 'border-transparent hover:scale-105'
          }`}
          onClick={() => onSelectTheme(theme.id)}
        >
          <div
            className="w-full h-16 rounded-md relative flex items-center justify-center mb-2"
            style={{
              background: theme.color,
              border: `2px solid ${theme.border}`,
            }}
          >
            {currentTheme === theme.id && (
              <div className="bg-indigo-600 text-white rounded-full p-1 absolute bottom-1 right-1 shadow-md">
                <Check size={14} />
              </div>
            )}
          </div>
          <p className="text-xs text-center font-medium text-gray-700">{theme.name}</p>
        </div>
      ))}
    </div>
  );
};

export default ThemeSelector;
