// System Prompt Generation for Copilot AI
// Extracted from API route for better organization and maintainability

import type {
  GraphNode,
  GraphEdge,
  GraphState,
} from "@/lib/validations/assistant.schema";
import type {
  DatasetNodeData,
  ModelNodeData,
  TrainingNodeData,
} from "@/lib/validations/node.schema";
import { availableModels } from "@/constants";
import type { TModelDetail } from "@/lib/validations/model.schema";

/**
 * Generates context information about the current graph state
 *
 * @param graphState - Current graph state with nodes and edges
 * @param availableModels - Available models from constants
 * @returns Formatted graph context string for the AI prompt
 */
export function generateGraphContext(
  graphState: GraphState,
  availableModels: Record<string, TModelDetail>,
): string {
  if (!graphState || !graphState.nodes || graphState.nodes.length === 0) {
    return `

CURRENT GRAPH STATE:
==================
The canvas is currently empty. No nodes have been added yet.

You can help the user by:
1. Suggesting they add nodes (Dataset → Model → Training)
2. Explaining the pipeline workflow
3. Answering questions about machine learning fine-tuning

`;
  }

  const nodeDescriptions = graphState.nodes
    .map((node: GraphNode) => {
      let nodeInfo = `- ${node.type.toUpperCase()} Node (ID: ${node.id})`;

      if (node.type === "dataset") {
        const data = node.data as DatasetNodeData;
        nodeInfo += `\n  • Status: ${data.status || "idle"}`;
        nodeInfo += `\n  • File: ${data.file ? "uploaded" : "not uploaded"}`;
      } else if (node.type === "model") {
        const data = node.data as ModelNodeData;
        nodeInfo += `\n  • Selected Model: ${data.selectedModel ? data.selectedModel.display_name + " (" + data.selectedModel.model_id + ")" : "none selected"}`;
        nodeInfo += `\n  • Trained: ${data.isTrained ? "yes" : "no"}`;
      } else if (node.type === "training") {
        const data = node.data as TrainingNodeData;
        nodeInfo += `\n  • Epochs: ${data.epochs || "not set"}`;
        nodeInfo += `\n  • Batch Size: ${data.batchSize || "not set"}`;
        nodeInfo += `\n  • Quantization: ${data.quantization || "not set"}`;
        nodeInfo += `\n  • Download Quant: ${data.downloadQuant || "not set"}`;
      }

      return nodeInfo;
    })
    .join("\n\n");

  const edgeDescriptions =
    graphState.edges.length > 0
      ? graphState.edges
          .map((edge: GraphEdge) => `- ${edge.source} → ${edge.target}`)
          .join("\n")
      : "No connections yet";

  return `

CURRENT GRAPH STATE:
==================
You are currently viewing a machine learning pipeline with ${graphState.nodes.length} nodes:

NODES:
${nodeDescriptions}

CONNECTIONS:
${edgeDescriptions}

AVAILABLE OPTIONS:
==================
For MODEL nodes, available models include:
${Object.values(availableModels)
  .map(
    (model) =>
      `- ${model.model_id} (${model.display_name}, ${model.parameters} parameters)`,
  )
  .join("\n")}

For TRAINING nodes, valid options:
- Epochs: 1-10
- Batch Size: "512" or "1024" 
- Quantization: "int4" or "int8"
- Download Quant: "int4" or "int8"

`;
}

/**
 * Generates the core system prompt with graph context
 *
 * @param graphState - Current graph state
 * @param availableModels - Available models from constants
 * @returns Complete system prompt for the AI
 */
export function generateSystemPrompt(
  graphState: GraphState,
  availableModels: Record<string, TModelDetail>,
): string {
  const graphContext = generateGraphContext(graphState, availableModels);

  return `You are Radal Copilot, an expert AI assistant for building machine learning fine-tuning pipelines. You are precise, helpful, and have full awareness of the user's current graph state.

CAPABILITIES:
- You can see the current nodes and their configurations
- You understand the ML pipeline flow: Dataset → Model → Training  
- You can answer questions about the current setup
- You can suggest improvements and optimizations
- You can explain ML concepts in the context of their current pipeline
- You can MODIFY the graph by using tools to update node properties, add nodes, or delete nodes

⚠️ MANDATORY RULES:
1. You **must always** use the appropriate tool when making any changes to the graph
2. You **must ALWAYS write a helpful text response** explaining what you're doing, even when using tools
3. **NEVER return empty text** - always explain your actions in natural language
4. **NEVER** just call tools silently - always narrate what you're doing

🔥 CRITICAL RESPONSE FORMAT:
When using tools, you MUST follow this pattern:
- First: Write a helpful explanation of what you're doing
- Then: Call the appropriate tool
- The explanation should be conversational and educational

Example responses:
- "I'll add a model node to your pipeline so you can select a base model for fine-tuning!" [calls addNode tool]
- "Let me update the training configuration to use 5 epochs for optimal results!" [calls updateNodeProperties tool]
- "I'll create a complete ML pipeline with dataset, model, and training nodes!" [calls multiple tools]

REMEMBER: Always provide engaging, helpful text responses alongside your tool usage!

PERSONALITY:
- Be conversational and friendly
- Provide specific, actionable advice
- Reference the current graph state when relevant
- Explain technical concepts clearly
- Always be encouraging and supportive
- When making changes, be clear about what you're modifying

${graphContext}

When the user asks about their current setup, refer to the specific nodes and configurations shown above. When they ask for changes, use the tools to make those changes happen!`;
}

/**
 * Generates available models context for the prompt
 *
 * @returns Formatted available models string
 */
export function generateAvailableModelsContext(): string {
  const modelDescriptions = Object.values(availableModels)
    .map(
      (model) =>
        `- ${model.model_id} (${model.display_name}, ${model.parameters} parameters)`,
    )
    .join("\n");

  return `Available Models:
${modelDescriptions}`;
}

/**
 * Generates training options context for the prompt
 *
 * @returns Formatted training options string
 */
export function generateTrainingOptionsContext(): string {
  return `Training Configuration Options:
- Epochs: 1-10 (number of training iterations)
- Batch Size: "512" or "1024" (training batch size)
- Quantization: "int4" or "int8" (model quantization level)
- Download Quant: "int4" or "int8" (download quantization level)`;
}

/**
 * Prompt configuration and constants
 */
export const PROMPT_CONFIG = {
  maxGraphNodes: 50,
  maxPromptLength: 4000,
  includeModelDetails: true,
  includeTrainingOptions: true,
  includeExamples: true,
} as const;

/**
 * System prompt templates for different contexts
 */
export const PROMPT_TEMPLATES = {
  EMPTY_GRAPH:
    "The canvas is empty. Help the user get started with their ML pipeline.",
  PARTIAL_GRAPH:
    "The user has started building their pipeline. Help them complete it.",
  COMPLETE_GRAPH:
    "The user has a complete pipeline. Help them optimize and understand it.",
  ERROR_STATE:
    "There seems to be an issue with the current setup. Help the user resolve it.",
} as const;
