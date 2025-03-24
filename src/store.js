// src/store.js
import { create } from 'zustand';
import { callOpenAI } from './api';

// For non-PDF libraries, use CommonJS require:
const Tesseract = require('tesseract.js');
const Papa = require('papaparse');
const mammoth = require('mammoth');
const JSZip = require('jszip');

export const useChatStore = create((set, get) => ({
  // Model selection state and setter
  selectedModel: 'gpt-3.5-turbo',
  setSelectedModel: (model) => set({ selectedModel: model }),

  // Multi-chat state: list of chats, active chat, messages per chat
  chats: [{ id: 'chat1', name: 'General' }],
  activeChat: 'chat1',
  messages: {
    chat1: [{
      id: 1,
      text: 'Welcome! Upload an image, PDF, CSV, DOCX, ZIP, code file—or type a message.',
      sender: 'bot'
    }]
  },

  setActiveChat: (chatId) => set({ activeChat: chatId }),

  createChat: (chatName) => {
    const newChatId = 'chat-' + Date.now();
    set((state) => ({
      chats: [...state.chats, { id: newChatId, name: chatName }],
      messages: { ...state.messages, [newChatId]: [] },
      activeChat: newChatId,
    }));
  },

  deleteChat: (chatId) => {
    set((state) => {
      const updatedChats = state.chats.filter((chat) => chat.id !== chatId);
      const updatedMessages = { ...state.messages };
      delete updatedMessages[chatId];
      let newActiveChat = updatedChats.length > 0 ? updatedChats[0].id : null;
      return {
        chats: updatedChats,
        messages: updatedMessages,
        activeChat: newActiveChat,
      };
    });
  },

  // Send a text message and get an AI response
  sendMessage: async (text) => {
    const { activeChat, messages, selectedModel } = get();
    if (!activeChat) return;
    const userMessage = { id: Date.now(), text, sender: 'user' };
    set({
      messages: {
        ...messages,
        [activeChat]: [...(messages[activeChat] || []), userMessage],
      },
    });
    const aiResponseText = await callOpenAI(text, selectedModel);
    const aiMessage = { id: Date.now() + 1, text: aiResponseText, sender: 'bot' };
    set((state) => ({
      messages: {
        ...state.messages,
        [activeChat]: [...(state.messages[activeChat] || []), aiMessage],
      },
    }));
  },

  // File upload processing: detect file type and extract text accordingly.
  sendFileToChat: (file) => {
    const { activeChat } = get();
    if (!activeChat) return;

    const reader = new FileReader();
    // Helper: passes extracted text to AI
    const handleExtractedText = (extractedText) => {
      get().sendMessage(`Extracted from "${file.name}":\n\n${extractedText}`);
    };

    reader.onload = async (e) => {
      try {
        if (file.type.startsWith('image/')) {
          // Image: OCR with Tesseract.js
          Tesseract.recognize(e.target.result, 'eng')
            .then(({ data: { text } }) => handleExtractedText(text))
            .catch((err) => {
              console.error('Tesseract error:', err);
              get().sendMessage(`Error parsing image: ${file.name}`);
            });
        }
        // PDF: dynamically import pdfjs-dist as ESM
        else if (file.type === 'application/pdf') {
          const { default: pdfjsLib } = await import('pdfjs-dist/build/pdf.mjs');
          // Set the worker URL for PDF.js dynamically
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).href;
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            fullText += pageText + '\n';
          }
          handleExtractedText(fullText);
        }
        // CSV: parse using PapaParse
        else if (file.type === 'text/csv') {
          const csvText = e.target.result;
          const parsed = Papa.parse(csvText, { header: false });
          const tableString = parsed.data.map((row) => row.join(', ')).join('\n');
          handleExtractedText(tableString);
        }
        // DOCX: extract text using Mammoth
        else if (file.name.endsWith('.docx')) {
          const arrayBuffer = e.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          handleExtractedText(result.value);
        }
        // ZIP: extract contents using JSZip
        else if (file.name.endsWith('.zip') || file.type === 'application/zip') {
          const jszip = new JSZip();
          const zip = await jszip.loadAsync(e.target.result);
          let extractedText = '';
          for (const fileName in zip.files) {
            const zipEntry = zip.files[fileName];
            if (!zipEntry.dir) {
              const fileContent = await zipEntry.async('string');
              extractedText += `=== ${fileName} ===\n${fileContent}\n`;
            }
          }
          handleExtractedText(extractedText);
        }
        // Code or plain text files
        else if (
          file.type.startsWith('text/') ||
          file.name.endsWith('.js') ||
          file.name.endsWith('.jsx') ||
          file.name.endsWith('.ts') ||
          file.name.endsWith('.tsx') ||
          file.name.endsWith('.json') ||
          file.name.endsWith('.css') ||
          file.name.endsWith('.html')
        ) {
          handleExtractedText(e.target.result);
        }
        // Video: fallback message
        else if (file.type.startsWith('video/')) {
          get().sendMessage(`Video file "${file.name}" uploaded. Video analysis is not supported in this version.`);
        } else {
          get().sendMessage(`File uploaded: ${file.name}`);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        get().sendMessage(`Error parsing file: ${file.name}`);
      }
    };

    // Read file based on type
    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else if (file.name.endsWith('.docx')) {
      reader.readAsArrayBuffer(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.zip')) {
      reader.readAsArrayBuffer(file);
    } else if (file.type === 'text/csv' || file.type.startsWith('text/')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  },
}));

