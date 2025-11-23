import React from 'react';

export const NavButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button 
    onClick={onClick}
    className={`text-sm font-bold transition-colors ${active ? 'text-tubo-orange' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'}`}
  >
    {label}
  </button>
);