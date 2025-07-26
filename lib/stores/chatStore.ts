"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Chat store state - simplified for AI SDK integration
type ChatStore = {
  // Current input state
  currentInput: string;

  // Session management
  sessionId: string;
  isInitialized: boolean;

  // Actions
  // Input management
  setCurrentInput: (input: string) => void;

  // Session management
  initializeSession: () => void;
  resetSession: () => void;
};

// Generate session ID
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentInput: "",
    sessionId: generateSessionId(),
    isInitialized: false,

    // Input management
    setCurrentInput: (input) => {
      set({ currentInput: input });
    },

    // Session management
    initializeSession: () => {
      set({
        sessionId: generateSessionId(),
        isInitialized: true,
        currentInput: "",
      });
    },

    resetSession: () => {
      get().initializeSession();
    },
  })),
);

// Auto-initialize session on first use
useChatStore.getState().initializeSession();
