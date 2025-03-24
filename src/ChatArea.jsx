// src/ChatArea.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useChatStore } from './store';

const ChatArea = () => {
  const { activeChat, messages, sendMessage } = useChatStore();
  const [input, setInput] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const chatMessages = messages[activeChat] || [];

  return (
    <section className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-800">
      <div className="flex-1 p-4 overflow-y-auto">
        {chatMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-2 p-3 rounded-md max-w-[80%] ${
              msg.sender === 'bot'
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 self-start'
                : 'bg-blue-500 dark:bg-blue-600 text-white self-end'
            }`}
            style={{ clear: 'both' }}
          >
            {msg.text}
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300 dark:border-gray-700 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
        />
        <button
          type="submit"
          className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-3 rounded-r-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatArea;

