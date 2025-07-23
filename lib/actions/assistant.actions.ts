"use server";

import { ConvexHttpClient } from "convex/browser";
import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  type ToolInvocation,
  type GraphState,
  type GraphNode,
  type Message,
  createCopilotError,
  validateCopilotRequest,
  createCopilotResponse,
} from "@/lib/validations/assistant.schema";
import { createAzureProvider } from "../assistant/azure";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { availableModels } from "@/constants";
import { convertToCoreMessages, generateText } from "ai";
import { generateSystemPrompt } from "../assistant/prompts/system-prompts";
import { graphTools } from "../assistant/tools/graph-tools";

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Rate limiter: 60 copilot requests per user per hour
const assistantRateLimiter = new RateLimiterMemory({
  points: 60, // 60 copilot requests
  duration: 60 * 60, // per hour
});

// Validate if a tool call can be executed by the user
function validateToolCallPermissions(
  toolCall: ToolInvocation,
  graphState: GraphState,
): boolean {
  try {
    switch (toolCall.toolName) {
      case "updateNodeProperties":
      case "deleteNode":
        // Ensure the node exists in the user's graph
        const nodeId = (toolCall.args as { nodeId: string }).nodeId;
        return graphState.nodes.some((node: GraphNode) => node.id === nodeId);

      case "addNode":
        // Validate graph size limits
        return graphState.nodes.length < 50;

      default:
        return false;
    }
  } catch (error) {
    console.error("Error validating tool permissions:", error);
    return false;
  }
}

export async function processAssistantMessage(formData: FormData) {
  const startTime = Date.now();

  try {
    // Authentication check
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return createCopilotError(
        "authentication_error",
        "Unauthorized - User is not authenticated",
      );
    }

    // Verify that the user exists in the convex database
    // Get user from Convex database
    const convexUser = await convex.query(api.users.getByClerkId, {
      clerkId: clerkUserId,
    });

    if (!convexUser) {
      return createCopilotError(
        "authentication_error",
        "User not found in database",
      );
    }

    // Rate limiting check
    try {
      await assistantRateLimiter.consume(clerkUserId);
    } catch {
      return createCopilotError(
        "rate_limit_error",
        "Too many copilot requests. Please wait before sending more messages.",
      );
    }

    // Parse and validate form data
    const messagesStr = formData.get("messages") as string;
    const graphStateStr = formData.get("graphState") as string;
    const projectId = formData.get("projectId") as string;

    if (!messagesStr || !graphStateStr || !projectId) {
      return createCopilotError(
        "validation_error",
        "Missing required fields: messages, graphState, projectId",
      );
    }

    let messages, graphState;
    try {
      messages = JSON.parse(messagesStr);
      graphState = JSON.parse(graphStateStr);
    } catch {
      return createCopilotError(
        "validation_error",
        "Invalid JSON in messages or graphState",
      );
    }

    // Validate project ownership
    const project = await convex.query(api.projects.getProjectByIdWithClerkId, {
      projectId: projectId as Id<"projects">,
      clerkId: clerkUserId,
    });

    if (!project) {
      return createCopilotError(
        "authorization_error",
        "Project not found or access denied",
      );
    }

    // Validate request structure
    const requestValidation = validateCopilotRequest({
      messages,
      graphState,
      projectId,
    });

    if (!requestValidation.isValid) {
      return createCopilotError(
        "validation_error",
        "Invalid copilot request structure",
        { validationErrors: requestValidation.errors },
      );
    }

    // Generate assistant ai response
    // Create Azure provider
    const azureProvider = createAzureProvider();

    const systemPrompt = generateSystemPrompt(graphState, availableModels);

    // Clean messages (remove tool invocations without results) with proper typing
    const cleanedMessages = convertToCoreMessages(
      messages.map((msg: Message) => {
        if (msg.role === "assistant" && msg.toolInvocations) {
          // Remove toolInvocations property for clean AI SDK consumption
          return {
            role: msg.role,
            content: msg.content,
          };
        }
        return msg;
      }),
    );

    const result = await generateText({
      model: azureProvider(process.env.AZURE_OPENAI_DEPLOYMENT_NAME!),
      system: systemPrompt,
      messages: cleanedMessages,
      tools: graphTools,
      maxTokens: 4000,
      temperature: 0.7,
    });

    // Process tool calls and verify permissions with proper type conversion
    const processedToolInvocations: ToolInvocation[] = [];

    if (result.toolCalls && result.toolCalls.length > 0) {
      for (const toolCall of result.toolCalls) {
        // Convert AI SDK format to your schema format
        const toolInvocation: ToolInvocation = {
          toolName: toolCall.toolName as ToolInvocation["toolName"],
          args: toolCall.args,
        };

        // Validate tool call permissions
        const canExecute = validateToolCallPermissions(
          toolInvocation,
          graphState,
        );

        if (canExecute) {
          processedToolInvocations.push(toolInvocation);
        }
      }
    }

    return createCopilotResponse(
      result.text || "I've processed your request.",
      processedToolInvocations,
      {
        processingTimeMs: Date.now() - startTime,
        tokenCount: result.usage?.totalTokens,
      },
    );
  } catch (error) {
    console.error("Copilot server action error:", error);

    return createCopilotError(
      "internal_error",
      "Copilot service temporarily unavailable",
      {
        originalError: error instanceof Error ? error.message : "Unknown error",
        processingTimeMs: Date.now() - startTime,
      },
    );
  }
}
