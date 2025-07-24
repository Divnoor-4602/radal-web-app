"use client";

import React, { memo } from "react";
import { Textarea } from "@/components/ui/textarea";
import SendButton from "../SendButton";
import UserMessage from "./UserMessage";
import AssistantMessage from "./AssistantMessage";
import type { UIMessage } from "ai";
import type { MessageStatus, ToolCall } from "@/lib/stores/chatStore";

// Create the same type used in AssistantMessage for consistency
type DisplayMessage = UIMessage & {
  status: MessageStatus;
  timestamp: number;
  toolCalls?: ToolCall[];
  error?: string;
};

type ActiveChatProps = {
  messages: DisplayMessage[];
  input?: string;
  isLoading?: boolean;
  validationError?: string | null;
};

// Active chat component for when conversation is ongoing
const ActiveChat = memo(
  ({ messages, input, isLoading, validationError }: ActiveChatProps) => {
    return (
      <div className="w-full h-full flex flex-col px-6 bg-bg-100">
        {/* Messages section - scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            <div className="flex flex-col space-y-6">
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

        {/* Text area section - fixed at bottom */}
        <div className="pb-6">
          {/* Validation error display */}
          {validationError && (
            <div className="mb-3 p-3 bg-red-100 border border-red-300 text-red-700 text-sm rounded-lg">
              ⚠️ {validationError}
            </div>
          )}

          <div className="relative w-full">
            <Textarea
              className="w-full !outline-0 !ring-0 !focus:ring-0 !focus-visible:ring-0 !shadow-none !bg-[#1B1B1D] !border !border-stone-800 focus:!ring-0 focus:!ring-offset-0 focus:!border-border-default placeholder:text-text-inactive !min-h-20 text-sm pr-12 pb-12"
              placeholder="Ask me anything..."
              value={input || ""}
              readOnly
            />
            {/* send button */}
            <SendButton input={input} isLoading={isLoading} />
          </div>
        </div>
      </div>
    );
  },
);

ActiveChat.displayName = "ActiveChat";

export default ActiveChat;
