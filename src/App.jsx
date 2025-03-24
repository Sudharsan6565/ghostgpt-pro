// src/App.jsx
import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { useThemeStore } from './themeStore';

function App() {
  const { isDarkMode } = useThemeStore();

  return (
    // If isDarkMode is true, we add 'dark' to enable Tailwind's dark mode classes
    <div className={isDarkMode ? 'dark h-screen flex flex-col' : 'h-screen flex flex-col'}>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <ChatArea />
      </div>
    </div>
  );
}

export default App;

