import { ConvexHttpClient } from "convex/browser";
import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  type Message,
  type ToolInvocation,
  type GraphState,
  type GraphNode,
  validateCopilotRequest,
} from "@/lib/validations/assistant.schema";
import { createAzureProvider } from "@/lib/assistant/azure";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { availableModels } from "@/constants";
import { convertToCoreMessages, streamText } from "ai";
import { generateSystemPrompt } from "@/lib/assistant/prompts/system-prompts";
import { graphTools } from "@/lib/assistant/tools/graph-tools";
import {
  isConnectionCompatible,
  isDuplicateConnection,
} from "@/lib/utils/canvas.utils";

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Rate limiter: 60 copilot requests per user per hour
const assistantRateLimiter = new RateLimiterMemory({
  points: 60, // 60 copilot requests
  duration: 60 * 60, // per hour
});

// Helper function to validate node type compatibility
function validateNodeTypeCompatibility(
  sourceNodeType: string,
  targetNodeType: string,
  sourceHandle: string,
  targetHandle: string,
): boolean {
  // Dataset → Model connections
  if (sourceNodeType === "dataset" && targetNodeType === "model") {
    return (
      sourceHandle === "upload-dataset-output" &&
      targetHandle === "select-model-input"
    );
  }

  // Model → Training connections
  if (sourceNodeType === "model" && targetNodeType === "training") {
    return (
      sourceHandle === "select-model-output" &&
      targetHandle === "training-config-input"
    );
  }

  // All other combinations are invalid
  return false;
}

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

      case "addConnection":
        const addConnArgs = toolCall.args as {
          sourceNodeId: string;
          targetNodeId: string;
          sourceHandle: string;
          targetHandle: string;
        };

        // Check if both nodes exist
        const sourceNode = graphState.nodes.find(
          (node) => node.id === addConnArgs.sourceNodeId,
        );
        const targetNode = graphState.nodes.find(
          (node) => node.id === addConnArgs.targetNodeId,
        );

        if (!sourceNode || !targetNode) return false;

        // Validate node type compatibility based on handles
        const isValidNodeTypeCombo = validateNodeTypeCompatibility(
          sourceNode.type,
          targetNode.type,
          addConnArgs.sourceHandle,
          addConnArgs.targetHandle,
        );

        if (!isValidNodeTypeCombo) return false;

        // Use existing canvas validation logic
        const connection = {
          source: addConnArgs.sourceNodeId,
          target: addConnArgs.targetNodeId,
          sourceHandle: addConnArgs.sourceHandle,
          targetHandle: addConnArgs.targetHandle,
        };

        // Check connection compatibility using existing utils
        if (!isConnectionCompatible(connection)) return false;

        // Check for duplicate connections using existing utils
        if (isDuplicateConnection(connection, graphState.edges)) return false;

        // Validate graph size limits
        return graphState.edges.length < 100;

      case "deleteConnection":
        const deleteConnArgs = toolCall.args as {
          connectionId?: string;
          sourceNodeId?: string;
          targetNodeId?: string;
        };

        if (deleteConnArgs.connectionId) {
          // Validate by connection ID
          return graphState.edges.some(
            (edge) => edge.id === deleteConnArgs.connectionId,
          );
        } else if (deleteConnArgs.sourceNodeId && deleteConnArgs.targetNodeId) {
          // Validate by source and target nodes
          const sourceExists = graphState.nodes.some(
            (node) => node.id === deleteConnArgs.sourceNodeId,
          );
          const targetExists = graphState.nodes.some(
            (node) => node.id === deleteConnArgs.targetNodeId,
          );
          const connectionExists = graphState.edges.some(
            (edge) =>
              edge.source === deleteConnArgs.sourceNodeId &&
              edge.target === deleteConnArgs.targetNodeId,
          );
          return sourceExists && targetExists && connectionExists;
        }
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error("Error validating tool permissions:", error);
    return false;
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // Authentication check
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized - User is not authenticated",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Verify that the user exists in the convex database
    const convexUser = await convex.query(api.users.getByClerkId, {
      clerkId: clerkUserId,
    });

    if (!convexUser) {
      return new Response(
        JSON.stringify({
          error: "User not found in database",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Rate limiting check
    try {
      await assistantRateLimiter.consume(clerkUserId);
    } catch {
      return new Response(
        JSON.stringify({
          error:
            "Too many copilot requests. Please wait before sending more messages.",
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Parse and validate request body
    const { messages, graphState, projectId } = await req.json();

    if (!messages || !graphState || !projectId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: messages, graphState, projectId",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate project ownership
    let project;
    try {
      project = await convex.query(api.projects.getProjectByIdWithClerkId, {
        projectId: projectId as Id<"projects">,
        clerkId: clerkUserId,
      });
    } catch (error) {
      console.error("Project validation error:", error);

      // Handle Convex validation errors specifically
      if (
        error instanceof Error &&
        error.message.includes("ArgumentValidationError")
      ) {
        return new Response(
          JSON.stringify({
            error: "Invalid project ID format",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Handle other Convex errors
      if (error instanceof Error && error.message.includes("Server Error")) {
        return new Response(
          JSON.stringify({
            error: "Project access validation failed",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Generic database error
      return new Response(
        JSON.stringify({
          error: "Database connection error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!project) {
      return new Response(
        JSON.stringify({
          error: "Project not found or access denied",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Validate request structure
    const requestValidation = validateCopilotRequest({
      messages,
      graphState,
      projectId,
    });

    if (!requestValidation.isValid) {
      return new Response(
        JSON.stringify({
          error: "Invalid copilot request structure",
          details: requestValidation.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Create Azure provider and system prompt
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

    // Stream the response using streamText
    const result = streamText({
      model: azureProvider(process.env.AZURE_OPENAI_DEPLOYMENT_NAME!),
      system: systemPrompt,
      messages: cleanedMessages,
      tools: graphTools,
      maxTokens: 4000,
      temperature: 0.7,
      toolCallStreaming: true, // Enable tool call streaming
      maxSteps: 5, // Allow multiple tool execution rounds

      // Validate tool calls after they're generated
      onFinish: async (event) => {
        console.log("🎯 Streaming finished, validating tool calls");

        if (event.toolCalls && event.toolCalls.length > 0) {
          // Validate each tool call
          const validatedToolCalls = event.toolCalls.filter((toolCall) => {
            const toolInvocation: ToolInvocation = {
              toolName: toolCall.toolName as ToolInvocation["toolName"],
              args: toolCall.args,
            };

            const isValid = validateToolCallPermissions(
              toolInvocation,
              graphState,
            );

            if (!isValid) {
              console.warn(
                `🚫 Tool call ${toolCall.toolName} rejected due to validation failure`,
              );
            }

            return isValid;
          });

          console.log(
            `✅ Validated ${validatedToolCalls.length}/${event.toolCalls.length} tool calls`,
          );
        }
      },
    });

    // Return data stream response for useChat compatibility
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("API route error:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        processingTimeMs: Date.now() - startTime,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
