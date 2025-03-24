// src/Sidebar.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from './store';

const Sidebar = () => {
  const {
    chats,
    activeChat,
    selectedModel,
    setSelectedModel,
    setActiveChat,
    createChat,
    deleteChat,
    sendFileToChat
  } = useChatStore();

  const [newChatName, setNewChatName] = useState('');

  const handleCreateChat = () => {
    if (newChatName.trim()) {
      createChat(newChatName.trim());
      setNewChatName('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      sendFileToChat(file);
    }
  };

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 p-4">
      {/* Model Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model</label>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="text-davinci-003">Text-Davinci-003</option>
        </select>
      </div>

      {/* Create New Chat */}
      <div className="mb-4">
        <input
          type="text"
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          placeholder="New chat name"
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        />
        <button
          onClick={handleCreateChat}
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Create Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="space-y-2">
        {chats.map(chat => (
          <motion.div
            key={chat.id}
            whileHover={{ scale: 1.02 }}
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
              chat.id === activeChat
                ? 'bg-blue-100 dark:bg-blue-900 font-bold text-gray-900 dark:text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveChat(chat.id)}
          >
            <span>{chat.name}</span>
            <button onClick={() => deleteChat(chat.id)} className="text-red-500">
              ❌
            </button>
          </motion.div>
        ))}
      </div>

      {/* File Upload */}
      <div className="mt-4">
        <label htmlFor="fileInput" className="block text-blue-500 cursor-pointer dark:text-blue-400">
          Upload File
        </label>
        <input
          id="fileInput"
          type="file"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </aside>
  );
};

export default Sidebar;

