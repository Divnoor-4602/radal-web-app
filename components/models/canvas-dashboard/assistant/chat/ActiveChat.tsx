"use client";

import React, { memo, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import SendButton from "../SendButton";
import UserMessage from "./UserMessage";
import AssistantMessage, { type MessageStatus } from "./assistant-message";
import type { UIMessage } from "ai";

// Display message type that matches AI SDK v5 patterns
type DisplayMessage = UIMessage & {
  status?: MessageStatus;
  timestamp?: number;
  error?: string;
};

type ActiveChatProps = {
  messages: DisplayMessage[];
  input?: string;
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading?: boolean;
  validationError?: string | null;
  onSendMessage?: (content: string) => void;
};

// Active chat component for when conversation is ongoing
const ActiveChat = memo(
  ({
    messages,
    input,
    handleInputChange,
    isLoading,
    validationError,
    onSendMessage,
  }: ActiveChatProps) => {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isUserNearBottomRef = useRef(true);

    // Function to check if user is near the bottom of the chat
    const checkIfNearBottom = () => {
      const container = messagesContainerRef.current;
      if (!container) return false;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 100; // pixels from bottom
      return scrollHeight - scrollTop - clientHeight < threshold;
    };

    // Function to scroll to bottom smoothly
    const scrollToBottom = () => {
      const container = messagesContainerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    };

    // Handle scroll events to track user position
    const handleScroll = () => {
      isUserNearBottomRef.current = checkIfNearBottom();
    };

    // Check if there's a streaming message
    const hasStreamingMessage = messages.some(
      (message) => message.status === "streaming",
    );

    // Auto-scroll logic
    useEffect(() => {
      if (messages.length > 0) {
        // Always scroll to bottom if there's a streaming message (new content being generated)
        // Or if user is near bottom (normal chat behavior)
        if (hasStreamingMessage || isUserNearBottomRef.current) {
          scrollToBottom();
        }
      }
    }, [messages, hasStreamingMessage]);

    // Scroll to bottom on initial load
    useEffect(() => {
      scrollToBottom();
    }, []);

    return (
      <div className="w-full h-full relative bg-bg-100">
        {/* Messages section - scrollable, positioned to leave space for text area */}
        <div
          ref={messagesContainerRef}
          className="absolute top-0 left-0 right-0 bottom-32 overflow-y-auto px-6"
          onScroll={handleScroll}
        >
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message.id}>
                    {message.role === "user" ? (
                      <UserMessage content={message.content} />
                    ) : (
                      <AssistantMessage
                        message={message}
                        isStreaming={message.status === "streaming"}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-text-inactive text-sm text-center">
                  No messages yet...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Text area section - absolutely positioned at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 bg-bg-100">
          {/* Validation error display */}
          {validationError && (
            <div className="ml-1 text-red-800 text-xs rounded-lg mb-2">
              {validationError}
            </div>
          )}

          {/* Blur/Shadow Overlay */}
          <div className="pointer-events-none z-10 absolute -top-24 left-0 right-0 h-24">
            <div className="h-24 w-full bg-gradient-to-t from-bg-100 to-transparent" />
          </div>

          <div className="relative w-full">
            {/* validation error */}
            <Textarea
              className={`w-full !outline-0 !ring-0 !focus:ring-0 !focus-visible:ring-0 !shadow-none !bg-[#1B1B1D] !border !border-stone-800 focus:!ring-0 focus:!ring-offset-0 focus:!border-border-default placeholder:text-text-inactive !min-h-20 text-sm pr-12 pb-12 ${
                validationError ? "!border-red-800/50" : ""
              }`}
              placeholder="Ask me anything..."
              value={input || ""}
              onChange={handleInputChange}
            />
            {/* send button */}
            <SendButton
              input={input}
              isLoading={isLoading}
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      </div>
    );
  },
);

ActiveChat.displayName = "ActiveChat";

export default ActiveChat;
