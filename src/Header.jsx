// src/Header.jsx
import React from 'react';
import { useThemeStore } from './themeStore';
import icon from './icon.png'; // Import the icon from the src folder

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-md">
      {/* Center container for icon + text */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center">
          <img
            src={icon}
            alt="GHOSTGPT Icon"
            className="w-20 h-20 rounded-md mr-3"  // Larger icon size
          />
          <h1 className="text-3xl font-bold">GHOSTGPT</h1>  {/* Larger text size */}
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md"
      >
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
    </header>
  );
};

export default Header;

