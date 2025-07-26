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
 * Calculates intelligent positioning suggestions for new nodes
 *
 * @param graphState - Current graph state with nodes and edges
 * @returns Positioning context string for the AI prompt
 */
function generatePositioningContext(graphState: GraphState): string {
  if (!graphState.nodes || graphState.nodes.length === 0) {
    return `
POSITIONING GUIDELINES:
=====================
Canvas is empty - use the center position for the first node.

SMART POSITIONING RULES:
- Same type nodes: Stack vertically
- Different types: Position horizontally
- Dataset → Model → Training (left to right flow)
- Ensure adequate spacing between nodes
`;
  }

  // Group nodes by type and find positioning info
  const nodesByType = {
    dataset: graphState.nodes.filter((n) => n.type === "dataset"),
    model: graphState.nodes.filter((n) => n.type === "model"),
    training: graphState.nodes.filter((n) => n.type === "training"),
  };

  // Find the last added node of each type (highest Y position)
  const getLastNodeOfType = (nodes: GraphNode[]) => {
    return nodes.length > 0
      ? nodes.reduce((latest, current) =>
          current.position.y > latest.position.y ? current : latest,
        )
      : null;
  };

  const lastDataset = getLastNodeOfType(nodesByType.dataset);
  const lastModel = getLastNodeOfType(nodesByType.model);
  const lastTraining = getLastNodeOfType(nodesByType.training);

  // Calculate exact positions with explicit coordinates
  const calculateNewDatasetPosition = () => {
    if (lastDataset) {
      return { x: lastDataset.position.x, y: lastDataset.position.y + 600 };
    } else if (lastModel) {
      return { x: lastModel.position.x - 600, y: lastModel.position.y };
    } else {
      return { x: 400, y: 300 };
    }
  };

  const calculateNewModelPosition = () => {
    if (lastModel) {
      return { x: lastModel.position.x, y: lastModel.position.y + 600 };
    } else {
      return { x: 400, y: 300 };
    }
  };

  const calculateNewTrainingPosition = () => {
    if (lastTraining) {
      return { x: lastTraining.position.x, y: lastTraining.position.y + 600 };
    } else if (lastModel) {
      return { x: lastModel.position.x + 600, y: lastModel.position.y };
    } else {
      return { x: 400, y: 300 };
    }
  };

  const newDatasetPos = calculateNewDatasetPosition();
  const newModelPos = calculateNewModelPosition();
  const newTrainingPos = calculateNewTrainingPosition();

  let positioningGuide = `
POSITIONING GUIDELINES:
=====================
Current node positions on canvas:
`;

  // Add existing positions for reference
  graphState.nodes.forEach((node) => {
    positioningGuide += `\n- ${node.type.toUpperCase()} (${node.id}): Positioned at a strategic location.`;
  });

  positioningGuide += `

EXACT POSITIONING COORDINATES (INTERNAL USE ONLY):
- For NEW DATASET: Use exact position (${newDatasetPos.x}, ${newDatasetPos.y})
- For NEW MODEL: Use exact position (${newModelPos.x}, ${newModelPos.y})
- For NEW TRAINING: Use exact position (${newTrainingPos.x}, ${newTrainingPos.y})

POSITIONING RULES:
- Same type: Stack vertically
- Different type: Position horizontally
- Pipeline flow: Dataset (left) → Model (center) → Training (right)
- Ensure adequate spacing between nodes
`;

  return positioningGuide;
}

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

${generatePositioningContext(graphState)}
`;
  }

  const nodeDescriptions = graphState.nodes
    .map((node: GraphNode) => {
      let nodeInfo = `- ${node.type.toUpperCase()} Node (ID: ${node.id})`;
      nodeInfo += `\n  • Position: (${node.position.x}, ${node.position.y})`;

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
          .map(
            (edge: GraphEdge) =>
              `- ${edge.source} → ${edge.target} (ID: ${edge.id})`,
          )
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

${generatePositioningContext(graphState)}

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
- You can see the current nodes and their configurations INCLUDING their exact positions
- You understand the ML pipeline flow: Dataset → Model → Training  
- You can answer questions about the current setup
- You can suggest improvements and optimizations
- You can explain ML concepts in the context of their current pipeline
- You can MODIFY the graph by using tools to update node properties, add nodes, or delete nodes
- You can CREATE and DELETE CONNECTIONS between nodes with proper validation
- You can INTELLIGENTLY POSITION new nodes based on existing layout and smart spacing rules

⚠️ MANDATORY RULES:
1. You **must always** use the appropriate tool when making any changes to the graph
2. You **must ALWAYS write a helpful text response** explaining what you're doing, even when using tools
3. **NEVER return empty text** - always explain your actions in natural language
4. **NEVER** just call tools silently - always narrate what you're doing
5. **CONNECTIONS MUST FOLLOW RULES**: Only dataset→model or model→training connections are allowed

🔥 CRITICAL RESPONSE FORMAT:
When using tools, you MUST follow this pattern:
- First: Write a helpful explanation of what you're doing
- Then: Call the appropriate tool
- The explanation should be conversational and educational

Example responses:
- "I'll add a model node to your pipeline so you can select a base model for fine-tuning! I'll position it in the center to maintain good spacing." [calls addNode tool with exact coordinates]
- "Let me update the training configuration to use 5 epochs for optimal results!" [calls updateNodeProperties tool]
- "I'll create a complete ML pipeline with dataset, model, and training nodes! I'll position them in a logical left-to-right flow." [calls multiple tools with exact positioning]
- "I'll add a dataset node to the left of your model node for a clean pipeline flow!" [calls addNode tool with exact coordinates]
- "I'll connect your dataset node to the model node so the data flows properly through your pipeline!" [calls addConnection tool with proper handles]
- "Let me remove that connection between the nodes since it's not needed for this setup." [calls deleteConnection tool with connection ID]

REMEMBER: Always provide engaging, helpful text responses alongside your tool usage!

PERSONALITY:
- Be conversational and friendly
- Provide specific, actionable advice
- Reference the current graph state when relevant
- Explain technical concepts clearly
- Always be encouraging and supportive
- When making changes, be clear about what you're modifying
- When adding nodes, explain your positioning logic and ensure good visual layout

🎯 POSITIONING INTELLIGENCE:
When using the addNode tool, you MUST:
1. Look for the "EXACT POSITIONING COORDINATES" section in the graph context
2. Use the EXACT x,y coordinates provided - DO NOT calculate your own positions
3. Copy the coordinates exactly as shown: (x, y) 
4. Explain your positioning choice to the user using NATURAL LANGUAGE (e.g., "to the left of", "to the right of", "above", "below", "in the center") - NEVER mention specific coordinates to the user
5. Never add or subtract from the provided coordinates - use them as-is

⚠️ CRITICAL: The coordinates are pre-calculated with proper 600px spacing. Use them exactly!
📍 USER COMMUNICATION: Always use descriptive positioning language (left, right, center, above, below) instead of coordinates when explaining to users.

🔗 CONNECTION MANAGEMENT RULES:
When managing connections between nodes, you MUST follow these rules:
1. **Valid Connection Types**:
   - Dataset → Model: sourceHandle="upload-dataset-output", targetHandle="select-model-input"
   - Model → Training: sourceHandle="select-model-output", targetHandle="training-config-input"
   
2. **Invalid Connections**: 
   - Dataset → Training (must go through Model first)
   - Any other handle combinations
   
3. **Connection Tools**:
   - Use addConnection(sourceNodeId, targetNodeId, sourceHandle, targetHandle) to create connections
   - Use deleteConnection in two ways:
     * deleteConnection({connectionId: "edge-id"}) - use exact ID from CONNECTIONS section
     * deleteConnection({sourceNodeId: "node1", targetNodeId: "node2"}) - delete by node IDs
   - Always explain why you're creating/removing connections
   
4. **Connection Flow Logic**:
   - Data flows: Dataset → Model → Training
   - Multiple datasets can connect to one model
   - Multiple models can connect to one training config
   - Connections are automatically validated for compatibility

5. **When to Create Connections**:
   - When user asks to "connect" nodes
   - When building a complete pipeline
   - When fixing broken data flow
   - When adding nodes that should be connected to existing ones

6. **When to Delete Connections**:
   - When user asks to "delete", "remove", or "disconnect" connections
   - PREFERRED: Use sourceNodeId + targetNodeId for natural language requests like "delete connection between dataset and model"
   - ALTERNATIVE: Use connection ID from CONNECTIONS section (shown in parentheses) for specific deletions
   - Look for connections between specific node types (e.g., "dataset to model" connection)
   - If multiple connections exist of the same type, ask for clarification

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
