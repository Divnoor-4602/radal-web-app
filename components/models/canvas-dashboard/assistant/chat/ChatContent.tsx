"use client";

import React, { memo, useEffect, useCallback, useState, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
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
import { processToolInvocationsWithContext } from "@/lib/utils/assistant.utils";
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

  // Track newly created nodes across tool calls in same conversation (synchronous)
  const conversationNodeIdsRef = useRef<string[]>([]);

  // Get graph state and actions for tool execution - no memoization for real-time updates
  const graphState = useFlowStore((state) => ({
    nodes: state.nodes,
    edges: state.edges,
  }));

  // Graph actions are now fetched fresh in onToolCall handler

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

      // Basic content validation
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

      // Content length validation
      if (content.trim().length > 4000) {
        const error = "Message too long (maximum 4000 characters)";
        setValidationError(error);
        return { isValid: false, error };
      }

      // Basic input sanitization check
      const sanitizedContent = content.trim().replace(/\s+/g, " ");
      if (sanitizedContent.length === 0) {
        const error = "Message cannot be empty";
        setValidationError(error);
        return { isValid: false, error };
      }

      // Validate graph state if available
      const graphValidation = validateGraphState(graphState);
      if (!graphValidation.isValid) {
        toast.error(
          "Graph state validation warning. Please check your canvas.",
        );
        // Don't block the message for graph issues, just notify user
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

      onError: () => {
        toast.error("Failed to send message. Please try again.");
        setValidationError("Failed to send message. Please try again.");
      },

      // Handle tool calls during streaming - each tool gets fresh graph state
      onToolCall: async ({ toolCall }) => {
        try {
          // Get absolutely fresh graph state for THIS specific tool call
          const currentGraphState = useFlowStore.getState();
          const freshGraphState = {
            nodes: currentGraphState.nodes,
            edges: currentGraphState.edges,
          };

          const freshGraphActions = {
            updateNodeData: currentGraphState.updateNodeData,
            addNode: currentGraphState.addNode,
            deleteNode: currentGraphState.deleteNode,
            onNodesChange: currentGraphState.onNodesChange,
            addConnection: currentGraphState.addConnection,
            deleteConnection: currentGraphState.deleteConnection,
          };

          // Type assertion for tool invocation
          const toolInvocation = {
            toolName: toolCall.toolName,
            args: toolCall.args,
          } as ToolInvocation;

          const executionResult = processToolInvocationsWithContext(
            [toolInvocation],
            freshGraphState, // Always fresh for each tool
            freshGraphActions,
            projectId as string,
            conversationNodeIdsRef.current, // Pass current conversation-level node tracking
          );

          if (executionResult.success) {
            // Update conversation-level node tracking (synchronous)
            conversationNodeIdsRef.current = executionResult.newNodeIds;

            return `Successfully executed ${toolCall.toolName}`;
          } else {
            // Check if this is a connection duplicate error (auto-connection scenario)
            const isDuplicateConnectionError =
              toolCall.toolName === "addConnection" &&
              executionResult.errors.some(
                (error) =>
                  typeof error === "string" &&
                  error.toLowerCase().includes("already exists"),
              );

            if (isDuplicateConnectionError) {
              // Handle duplicate connection gracefully - this likely means auto-connection already created it
              return `Connection already exists (likely created automatically)`;
            }

            // Tool execution failed - notify user and return error details for AI SDK to handle
            const errorMessage = `Failed to execute ${toolCall.toolName}: ${executionResult.errors.join(", ")}`;
            toast.error(`Tool execution failed: ${toolCall.toolName}`);

            // Throw error so AI SDK marks this tool call as failed
            throw new Error(errorMessage);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

          toast.error(`Unexpected error executing ${toolCall.toolName}`);

          // Re-throw so AI SDK properly marks this as a failed tool call
          throw new Error(
            `Tool execution failed: ${toolCall.toolName} - ${errorMessage}`,
          );
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
      // 1. Validate message content
      const messageValidation = validateMessage(content);
      if (!messageValidation.isValid) {
        return;
      }

      // 2. Validate complete request
      const requestValidation = validateRequest(content);
      if (!requestValidation.isValid) {
        return;
      }

      // 3. Clear any previous errors and reset conversation context
      setValidationError(null);
      conversationNodeIdsRef.current = []; // Clear node tracking for new conversation

      // 4. Send the validated message
      try {
        append({
          role: "user",
          content: content.trim(),
        });

        // Clear the input after successful send
        setInput("");
      } catch {
        toast.error("Failed to send message. Please try again.");
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
