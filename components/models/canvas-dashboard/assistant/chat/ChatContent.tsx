"use client";

import React, { memo, useEffect, useCallback, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import { useChatStore } from "@/lib/stores/chatStore";
import ActiveChat from "./ActiveChat";
import IntroChat from "./IntroChat";
import {
  validateCopilotRequest,
  validateGraphState,
  MessageSchema,
  type ToolInvocation,
} from "@/lib/validations/assistant.schema";
import { processToolInvocations } from "@/lib/utils/assistant.utils";
import type { UIMessage } from "ai";

// Simple message types for AI SDK integration
type MessageStatus = "streaming" | "completed" | "error";

type DisplayMessage = UIMessage & {
  status: MessageStatus;
  timestamp: number;
  toolCalls?: unknown[];
  error?: string;
};

// Chat content component - memoized to prevent unnecessary re-renders
const ChatContent = memo(() => {
  const { projectId } = useParams();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Get graph state and actions for tool execution
  const graphState = useFlowStore(
    useCallback((state) => ({ nodes: state.nodes, edges: state.edges }), []),
  );

  // Get graph actions for tool execution
  const graphActions = useFlowStore(
    useCallback(
      (state) => ({
        updateNodeData: state.updateNodeData,
        addNode: state.addNode,
        onNodesChange: state.onNodesChange,
        addConnection: state.addConnection,
        deleteConnection: state.deleteConnection,
      }),
      [],
    ),
  );

  // Chat store state - only for input persistence
  const { setCurrentInput, initializeSession } = useChatStore();

  // Initialize chat session on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Validate message content before sending
  const validateMessage = useCallback(
    (content: string): { isValid: boolean; error?: string } => {
      // Clear previous validation errors
      setValidationError(null);

      // 1. Basic content validation
      const messageResult = MessageSchema.safeParse({
        role: "user",
        content: content.trim(),
      });

      if (!messageResult.success) {
        const error =
          messageResult.error.issues[0]?.message || "Invalid message format";
        setValidationError(error);
        return { isValid: false, error };
      }

      // 2. Content length validation
      if (content.trim().length > 4000) {
        const error = "Message too long (maximum 4000 characters)";
        setValidationError(error);
        return { isValid: false, error };
      }

      // 3. Basic input sanitization check
      const sanitizedContent = content.trim().replace(/\s+/g, " ");
      if (sanitizedContent.length === 0) {
        const error = "Message cannot be empty";
        setValidationError(error);
        return { isValid: false, error };
      }

      // 4. Validate graph state if available
      const graphValidation = validateGraphState(graphState);
      if (!graphValidation.isValid) {
        console.warn("Graph state validation warning:", graphValidation.errors);
        // Don't block the message for graph issues, just log
      }

      return { isValid: true };
    },
    [graphState],
  );

  // Validate complete request before sending
  const validateRequest = useCallback(
    (content: string): { isValid: boolean; error?: string } => {
      const requestData = {
        messages: [{ role: "user", content: content.trim() }],
        graphState,
        projectId: projectId as string,
      };

      const result = validateCopilotRequest(requestData);
      if (!result.isValid) {
        const error = result.errors?.[0]?.message || "Invalid request format";
        setValidationError(error);
        return { isValid: false, error };
      }

      return { isValid: true };
    },
    [graphState, projectId],
  );

  // Use chat hook for streaming with AI SDK tool handling
  const { messages, input, handleInputChange, isLoading, append, setInput } =
    useChat({
      api: "/api/assistant",
      body: {
        graphState,
        projectId: projectId as string,
      },

      onFinish: (message) => {
        console.log("🎯 Message finished:", message);
      },

      onError: (error) => {
        console.error("❌ Chat error:", error);
        setValidationError("Failed to send message. Please try again.");
      },

      // Handle tool calls during streaming
      onToolCall: async ({ toolCall }) => {
        console.log("🔧 Tool call received:", toolCall.toolName);

        // Execute the tool call on the actual graph
        try {
          // Type assertion for tool invocation
          const toolInvocation = {
            toolName: toolCall.toolName,
            args: toolCall.args,
          } as ToolInvocation;

          const executionResult = processToolInvocations(
            [toolInvocation],
            graphState,
            graphActions,
          );

          if (executionResult.success) {
            console.log("✅ Tool executed successfully:", toolCall.toolName);
            return `Successfully executed ${toolCall.toolName}`;
          } else {
            console.error("❌ Tool execution failed:", executionResult.errors);
            return `Failed to execute ${toolCall.toolName}: ${executionResult.errors.join(", ")}`;
          }
        } catch (error) {
          console.error("❌ Tool execution error:", error);
          return `Error executing ${toolCall.toolName}: ${error instanceof Error ? error.message : "Unknown error"}`;
        }
      },

      // experimental throttle
      experimental_throttle: 50,
    });

  // Sync input with chat store
  useEffect(() => {
    setCurrentInput(input);
  }, [input, setCurrentInput]);

  // Send message function with validation
  const handleSendMessage = useCallback(
    (content: string) => {
      console.log("📤 Attempting to send message:", content);

      // 1. Validate message content
      const messageValidation = validateMessage(content);
      if (!messageValidation.isValid) {
        console.error("❌ Message validation failed:", messageValidation.error);
        return;
      }

      // 2. Validate complete request
      const requestValidation = validateRequest(content);
      if (!requestValidation.isValid) {
        console.error("❌ Request validation failed:", requestValidation.error);
        return;
      }

      // 3. Clear any previous errors
      setValidationError(null);

      // 4. Send the validated message
      try {
        append({
          role: "user",
          content: content.trim(),
        });

        // Clear the input after successful send
        setInput("");
        console.log("✅ Message sent successfully");
      } catch (error) {
        console.error("❌ Failed to send message:", error);
        setValidationError("Failed to send message. Please try again.");
      }
    },
    [append, setInput, validateMessage, validateRequest],
  );

  // Use messages from useChat directly for streaming
  const hasMessages = messages.length > 0;

  // Convert AI SDK messages to DisplayMessage format
  const displayMessages: DisplayMessage[] = messages.map((msg) => ({
    ...msg,
    status:
      isLoading &&
      msg === messages[messages.length - 1] &&
      msg.role === "assistant"
        ? ("streaming" as const)
        : ("completed" as const),
    timestamp: Date.now(),
    toolCalls: [],
  }));

  // Conditionally render intro or active chat
  return hasMessages ? (
    <ActiveChat
      messages={displayMessages}
      input={input}
      handleInputChange={handleInputChange}
      isLoading={isLoading}
      validationError={validationError}
      onSendMessage={handleSendMessage}
    />
  ) : (
    <IntroChat
      onSendMessage={handleSendMessage}
      input={input}
      handleInputChange={handleInputChange}
      validationError={validationError}
    />
  );
});

ChatContent.displayName = "ChatContent";

export default ChatContent;
