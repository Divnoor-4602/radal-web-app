"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { UIMessage } from "ai";

// Message streaming states based on AI SDK patterns
export type MessageStatus =
  | "pending" // Message queued but not sent yet
  | "streaming" // Message currently being streamed
  | "completed" // Message fully received
  | "error"; // Message failed

// Tool execution states
export type ToolStatus =
  | "pending" // Tool call identified but not executed
  | "executing" // Tool currently running
  | "completed" // Tool execution finished successfully
  | "failed"; // Tool execution failed

// Tool call tracking
export type ToolCall = {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  status: ToolStatus;
  result?: string | Record<string, unknown>;
  error?: string;
  startTime: number;
  endTime?: number;
};

// Message with additional metadata
export type ExtendedMessage = UIMessage & {
  status: MessageStatus;
  toolCalls?: ToolCall[];
  timestamp: number;
  error?: string;
};

// Current streaming state
export type StreamingState = {
  isStreaming: boolean;
  currentMessageId?: string;
  streamingText: string;
  toolsExecuting: ToolCall[];
};

// Chat store state
type ChatStore = {
  // Session-based chat (clears on page navigation)
  messages: ExtendedMessage[];
  streamingState: StreamingState;

  // Current input state
  currentInput: string;

  // Session management
  sessionId: string;
  isInitialized: boolean;

  // Actions
  // Message management
  addMessage: (message: Omit<ExtendedMessage, "timestamp">) => void;
  updateMessage: (messageId: string, updates: Partial<ExtendedMessage>) => void;
  clearMessages: () => void;

  // Streaming management
  startStreaming: (messageId: string) => void;
  updateStreamingText: (text: string) => void;
  completeStreaming: () => void;
  errorStreaming: (error: string) => void;

  // Tool management
  addToolCall: (
    messageId: string,
    toolCall: Omit<ToolCall, "id" | "startTime">,
  ) => void;
  updateToolCall: (
    messageId: string,
    toolCallId: string,
    updates: Partial<ToolCall>,
  ) => void;

  // Input management
  setCurrentInput: (input: string) => void;

  // Session management
  initializeSession: () => void;
  resetSession: () => void;

  // Utility getters
  getMessageById: (messageId: string) => ExtendedMessage | undefined;
  getActiveToolCalls: () => ToolCall[];
  hasActiveStreaming: () => boolean;
};

// Generate session ID
const generateSessionId = () =>
  `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate unique IDs
const generateId = () =>
  `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    messages: [],
    streamingState: {
      isStreaming: false,
      streamingText: "",
      toolsExecuting: [],
    },
    currentInput: "",
    sessionId: generateSessionId(),
    isInitialized: false,

    // Message management
    addMessage: (message) => {
      const newMessage: ExtendedMessage = {
        ...message,
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));
    },

    updateMessage: (messageId, updates) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg,
        ),
      }));
    },

    clearMessages: () => {
      set({
        messages: [],
        streamingState: {
          isStreaming: false,
          streamingText: "",
          toolsExecuting: [],
        },
      });
    },

    // Streaming management
    startStreaming: (messageId) => {
      set({
        streamingState: {
          isStreaming: true,
          currentMessageId: messageId,
          streamingText: "",
          toolsExecuting: [],
        },
      });
    },

    updateStreamingText: (text) => {
      set((state) => ({
        streamingState: {
          ...state.streamingState,
          streamingText: text,
        },
      }));
    },

    completeStreaming: () => {
      const { streamingState } = get();

      if (streamingState.currentMessageId) {
        // Update the message status to completed
        get().updateMessage(streamingState.currentMessageId, {
          status: "completed",
        });
      }

      set({
        streamingState: {
          isStreaming: false,
          streamingText: "",
          toolsExecuting: [],
        },
      });
    },

    errorStreaming: (error) => {
      const { streamingState } = get();

      if (streamingState.currentMessageId) {
        // Update the message status to error
        get().updateMessage(streamingState.currentMessageId, {
          status: "error",
          error,
        });
      }

      set({
        streamingState: {
          isStreaming: false,
          streamingText: "",
          toolsExecuting: [],
        },
      });
    },

    // Tool management
    addToolCall: (messageId, toolCall) => {
      const newToolCall: ToolCall = {
        ...toolCall,
        id: generateId(),
        startTime: Date.now(),
      };

      // Add to message
      get().updateMessage(messageId, {
        toolCalls: [
          ...(get().getMessageById(messageId)?.toolCalls || []),
          newToolCall,
        ],
      });

      // Add to streaming state if currently streaming
      set((state) => ({
        streamingState: {
          ...state.streamingState,
          toolsExecuting: [...state.streamingState.toolsExecuting, newToolCall],
        },
      }));
    },

    updateToolCall: (messageId, toolCallId, updates) => {
      const message = get().getMessageById(messageId);
      if (!message) return;

      const updatedToolCalls =
        message.toolCalls?.map((tool) =>
          tool.id === toolCallId
            ? {
                ...tool,
                ...updates,
                endTime:
                  updates.status === "completed" || updates.status === "failed"
                    ? Date.now()
                    : tool.endTime,
              }
            : tool,
        ) || [];

      // Update message
      get().updateMessage(messageId, {
        toolCalls: updatedToolCalls,
      });

      // Update streaming state
      set((state) => ({
        streamingState: {
          ...state.streamingState,
          toolsExecuting: state.streamingState.toolsExecuting.map((tool) =>
            tool.id === toolCallId ? { ...tool, ...updates } : tool,
          ),
        },
      }));
    },

    // Input management
    setCurrentInput: (input) => {
      set({ currentInput: input });
    },

    // Session management
    initializeSession: () => {
      set({
        sessionId: generateSessionId(),
        isInitialized: true,
        messages: [],
        streamingState: {
          isStreaming: false,
          streamingText: "",
          toolsExecuting: [],
        },
        currentInput: "",
      });
    },

    resetSession: () => {
      get().initializeSession();
    },

    // Utility getters
    getMessageById: (messageId) => {
      return get().messages.find((msg) => msg.id === messageId);
    },

    getActiveToolCalls: () => {
      return get().streamingState.toolsExecuting.filter(
        (tool) => tool.status === "pending" || tool.status === "executing",
      );
    },

    hasActiveStreaming: () => {
      const { streamingState } = get();
      return (
        streamingState.isStreaming || streamingState.toolsExecuting.length > 0
      );
    },
  })),
);

// Auto-initialize session on first use
useChatStore.getState().initializeSession();
