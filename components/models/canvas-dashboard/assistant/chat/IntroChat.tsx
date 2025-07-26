"use client";

import React, { memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import SendButton from "../SendButton";

type IntroChatProps = {
  onSendMessage?: (content: string) => void;
  input?: string;
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  validationError?: string | null;
};

const pillSuggestions: { text: string; prompt: string }[] = [
  {
    text: "Explain my pipeline",
    prompt: "What does each node in my graph do and how do they connect?",
  },
  {
    text: "Choose a model for my dataset",
    prompt: "What model should I use for my dataset?",
  },
  {
    text: "Change model settings",
    prompt: "How can I change the model settings?",
  },
];

// Intro chat component for initial state
const IntroChat = memo(
  ({
    onSendMessage,
    input,
    handleInputChange,
    validationError,
  }: IntroChatProps) => {
    const handlePillClick = (prompt: string) => {
      if (onSendMessage) {
        onSendMessage(prompt);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const trimmedInput = input?.trim();
        if (trimmedInput && onSendMessage) {
          onSendMessage(trimmedInput);
        }
      }
      // Shift+Enter will naturally create a new line due to default behavior
    };

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 h-full bg-bg-100">
        <div className="text-center max-w-xl w-full overflow-hidden flex flex-col items-center">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            How can I assist you?
          </h2>

          <div className="w-full mb-6">
            {/* Validation error display */}
            {validationError && (
              <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg mx-auto max-w-md">
                ⚠️ {validationError}
              </div>
            )}

            <div className="relative w-full">
              <Textarea
                className="w-full !outline-0 !ring-0 !focus:ring-0 !focus-visible:ring-0 !shadow-none !bg-[#1B1B1D] !border !border-stone-800 focus:!ring-0 focus:!ring-offset-0 focus:!border-border-default placeholder:text-text-inactive !min-h-20 text-sm pr-12 pb-12"
                placeholder="Ask me anything..."
                value={input || ""}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
              {/* send button */}
              <SendButton onSendMessage={onSendMessage} input={input} />
            </div>
          </div>

          {/* Suggestion pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {pillSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handlePillClick(suggestion.prompt)}
                className="h-auto py-1 px-3 text-[12px] text-text-primary rounded-full border-border-default hover:!border-border-highlight bg-bg-300 border cursor-pointer transition-colors"
              >
                {suggestion.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

IntroChat.displayName = "IntroChat";

export default IntroChat;
