// Assistant Utility Functions
// Tool invocation processing and graph manipulation utilities

import { availableModels } from "@/constants";
import type { ToolInvocation } from "@/lib/validations/assistant.schema";
import type { TModelDetail } from "@/lib/validations/model.schema";
import type { Node, Edge, NodeChange } from "@xyflow/react";

/**
 * Processes tool invocations with conversation-level context for NEW_NODE_ID resolution
 */
export function processToolInvocationsWithContext(
  toolInvocations: ToolInvocation[],
  graphState: { nodes: Node[]; edges: Edge[] },
  graphActions: {
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
    addNode: (
      type: string,
      position: { x: number; y: number },
      projectId?: string,
    ) => string | undefined;
    deleteNode: (nodeId: string) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    addConnection: (
      sourceNodeId: string,
      targetNodeId: string,
      sourceHandle: string,
      targetHandle: string,
    ) => boolean;
    deleteConnection: (args: {
      connectionId?: string;
      sourceNodeId?: string;
      targetNodeId?: string;
    }) => boolean;
  },
  projectId: string,
  conversationNodeIds: string[],
): {
  success: boolean;
  processedCount: number;
  errors: string[];
  newNodeIds: string[];
} {
  const errors: string[] = [];
  let processedCount = 0;

  // Use conversation-level node tracking for NEW_NODE_ID resolution
  const newNodeIds: string[] = [...conversationNodeIds];

  toolInvocations.forEach((toolCall, index) => {
    try {
      const { toolName, args } = toolCall;

      switch (toolName) {
        case "updateNodeProperties":
          processUpdateNodeProperties(
            args,
            graphState,
            graphActions,
            errors,
            newNodeIds,
          );
          break;

        case "addNode": {
          const newNodeId = processAddNode(
            args,
            graphActions,
            errors,
            projectId,
          );
          if (newNodeId) {
            newNodeIds.push(newNodeId);
          }
          break;
        }

        case "deleteNode":
          processDeleteNode(args, graphState, graphActions, errors, newNodeIds);
          break;

        case "addConnection": {
          // Enhanced connection processing with node ID resolution
          const processedArgs = resolveConnectionNodeIds(
            args,
            newNodeIds,
            graphState,
          );
          processAddConnection(processedArgs, graphActions, errors);
          break;
        }

        case "deleteConnection":
          processDeleteConnection(args, graphActions, errors);
          break;

        default:
          errors.push(`Unknown tool name: ${toolName}`);
          console.warn(`Unknown tool name: ${toolName}`);
          return;
      }

      processedCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Error processing tool ${index + 1}: ${errorMessage}`);
      console.error(`Error processing tool invocation ${index + 1}:`, error);
    }
  });

  const success = errors.length === 0;
  if (errors.length > 0) {
    console.error("Tool processing errors:", errors);
  }

  return {
    success,
    processedCount,
    errors,
    newNodeIds,
  };
}

/**
 * Processes tool invocations from the AI assistant and updates the graph state
 *
 * @param toolInvocations - Array of tool invocations from the AI response
 * @param graphState - Current graph state with nodes and edges
 * @param graphActions - Graph manipulation functions from the flow store
 * @param projectId - The current project ID for context
 */
export function processToolInvocations(
  toolInvocations: ToolInvocation[],
  graphState: { nodes: Node[]; edges: Edge[] },
  graphActions: {
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
    addNode: (
      type: string,
      position: { x: number; y: number },
      projectId?: string,
    ) => string | undefined; // Updated to return node ID
    deleteNode: (nodeId: string) => void;
    onNodesChange: (changes: NodeChange[]) => void;
    addConnection: (
      sourceNodeId: string,
      targetNodeId: string,
      sourceHandle: string,
      targetHandle: string,
    ) => boolean;
    deleteConnection: (args: {
      connectionId?: string;
      sourceNodeId?: string;
      targetNodeId?: string;
    }) => boolean;
  },
  projectId?: string,
): {
  success: boolean;
  processedCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  let processedCount = 0;

  // Track newly created nodes for connection reference resolution
  const newNodeIds: string[] = [];

  toolInvocations.forEach((toolCall, index) => {
    try {
      const { toolName, args } = toolCall;

      switch (toolName) {
        case "updateNodeProperties":
          processUpdateNodeProperties(
            args,
            graphState,
            graphActions,
            errors,
            newNodeIds,
          );
          break;

        case "addNode": {
          const newNodeId = processAddNode(
            args,
            graphActions,
            errors,
            projectId,
          );
          if (newNodeId) {
            newNodeIds.push(newNodeId);
          }
          break;
        }

        case "deleteNode":
          processDeleteNode(args, graphState, graphActions, errors, newNodeIds);
          break;

        case "addConnection": {
          // Enhanced connection processing with node ID resolution
          const processedArgs = resolveConnectionNodeIds(
            args,
            newNodeIds,
            graphState,
          );
          processAddConnection(processedArgs, graphActions, errors);
          break;
        }

        case "deleteConnection":
          processDeleteConnection(args, graphActions, errors);
          break;

        default:
          errors.push(`Unknown tool name: ${toolName}`);
          console.warn(`Unknown tool name: ${toolName}`);
          return;
      }

      processedCount++;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Error processing tool ${index + 1}: ${errorMessage}`);
      console.error(`Error processing tool invocation ${index + 1}:`, error);
    }
  });

  const success = errors.length === 0;
  if (errors.length > 0) {
    console.error("Tool processing errors:", errors);
  }

  return {
    success,
    processedCount,
    errors,
  };
}

/**
 * Processes updateNodeProperties tool invocation
 */
function processUpdateNodeProperties(
  args: unknown,
  graphState: { nodes: Node[]; edges: Edge[] },
  graphActions: {
    updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  },
  errors: string[],
  newNodeIds?: string[], // Add newNodeIds parameter for NEW_NODE_ID resolution
): void {
  // Type guard for args
  if (!isUpdateNodePropertiesArgs(args)) {
    errors.push("Invalid updateNodeProperties arguments");
    return;
  }

  let { nodeId } = args;
  const { nodeType, properties } = args;

  // Resolve NEW_NODE_ID to the most recently created node
  if (nodeId === "NEW_NODE_ID") {
    if (newNodeIds && newNodeIds.length > 0) {
      const latestNodeId = newNodeIds[newNodeIds.length - 1];
      nodeId = latestNodeId;
    } else {
      errors.push(
        "NEW_NODE_ID referenced but no new nodes were created in this conversation",
      );
      return;
    }
  }

  // Verify node exists
  const nodeExists = graphState.nodes.some((node) => node.id === nodeId);
  if (!nodeExists) {
    errors.push(`Node with ID ${nodeId} not found`);
    return;
  }

  const updateData: Record<string, unknown> = {};

  if (nodeType === "training") {
    // Update training node properties
    if (properties.epochs !== undefined) updateData.epochs = properties.epochs;
    if (properties.batchSize !== undefined)
      updateData.batchSize = properties.batchSize;
    if (properties.quantization !== undefined)
      updateData.quantization = properties.quantization;
    if (properties.downloadQuant !== undefined)
      updateData.downloadQuant = properties.downloadQuant;
  } else if (nodeType === "model") {
    // Update model node properties
    if (properties.selectedModelId !== undefined) {
      const inputModel = String(properties.selectedModelId)
        .toLowerCase()
        .trim();

      // Smart model matching function
      const selectedModel = findModelByNaturalLanguage(
        inputModel,
        availableModels,
      );

      if (selectedModel) {
        updateData.selectedModel = selectedModel;
      } else {
        errors.push(
          `Model "${properties.selectedModelId}" not found. Available models: ${Object.values(
            availableModels,
          )
            .map((m) => m.display_name)
            .join(", ")}`,
        );
        return;
      }
    }
  } else if (nodeType === "dataset") {
    // Update dataset node properties
    if (properties.status !== undefined) updateData.status = properties.status;
    if (properties.activeTab !== undefined)
      updateData.activeTab = properties.activeTab;
  } else {
    errors.push(`Unsupported node type for update: ${nodeType}`);
    return;
  }

  // Apply the update if we have data to update
  if (Object.keys(updateData).length > 0) {
    graphActions.updateNodeData(nodeId, updateData);
  } else {
    errors.push(`No valid properties to update for node ${nodeId}`);
  }
}

/**
 * Processes addNode tool invocation
 * Returns the ID of the newly created node for connection purposes
 */
function processAddNode(
  args: unknown,
  graphActions: {
    addNode: (
      type: string,
      position: { x: number; y: number },
      projectId?: string,
    ) => string | undefined; // Return node ID
  },
  errors: string[],
  projectId?: string,
): string | undefined {
  // Type guard for args
  if (!isAddNodeArgs(args)) {
    errors.push("Invalid addNode arguments");
    return undefined;
  }

  const { nodeType, position } = args;

  // Validate node type
  if (!["dataset", "model", "training"].includes(nodeType)) {
    errors.push(`Invalid node type: ${nodeType}`);
    return undefined;
  }

  // Validate position
  if (typeof position.x !== "number" || typeof position.y !== "number") {
    errors.push("Invalid position coordinates");
    return undefined;
  }

  return graphActions.addNode(nodeType, position, projectId);
}

/**
 * Processes deleteNode tool invocation
 */
function processDeleteNode(
  args: unknown,
  graphState: { nodes: Node[]; edges: Edge[] },
  graphActions: { deleteNode: (nodeId: string) => void },
  errors: string[],
  newNodeIds?: string[], // Add newNodeIds parameter for NEW_NODE_ID resolution
): void {
  // Type guard for args
  if (!isDeleteNodeArgs(args)) {
    errors.push("Invalid deleteNode arguments");
    return;
  }

  let { nodeId } = args;

  // Resolve NEW_NODE_ID to the most recently created node
  if (nodeId === "NEW_NODE_ID") {
    if (newNodeIds && newNodeIds.length > 0) {
      const latestNodeId = newNodeIds[newNodeIds.length - 1];
      nodeId = latestNodeId;
    } else {
      errors.push(
        "NEW_NODE_ID referenced but no new nodes were created in this conversation",
      );
      return;
    }
  }

  // Verify node exists
  const nodeExists = graphState.nodes.some((node) => node.id === nodeId);
  if (!nodeExists) {
    errors.push(`Node with ID ${nodeId} not found`);
    return;
  }

  // Use our custom deleteNode function that properly cleans up edges
  graphActions.deleteNode(nodeId);
}

/**
 * Processes addConnection tool invocation
 */
function processAddConnection(
  args: unknown,
  graphActions: {
    addConnection: (
      sourceNodeId: string,
      targetNodeId: string,
      sourceHandle: string,
      targetHandle: string,
    ) => boolean;
  },
  errors: string[],
): void {
  // Type guard for args
  if (!isAddConnectionArgs(args)) {
    errors.push("Invalid addConnection arguments");
    return;
  }

  const { sourceNodeId, targetNodeId, sourceHandle, targetHandle } = args;

  // Attempt to add the connection
  const success = graphActions.addConnection(
    sourceNodeId,
    targetNodeId,
    sourceHandle,
    targetHandle,
  );

  if (!success) {
    errors.push(
      `Failed to add connection from ${sourceNodeId} to ${targetNodeId}`,
    );
  }
}

/**
 * Processes deleteConnection tool invocation
 */
function processDeleteConnection(
  args: unknown,
  graphActions: {
    deleteConnection: (args: {
      connectionId?: string;
      sourceNodeId?: string;
      targetNodeId?: string;
    }) => boolean;
  },
  errors: string[],
): void {
  // Type guard for args
  if (!isDeleteConnectionArgs(args)) {
    errors.push("Invalid deleteConnection arguments");
    return;
  }

  // Handle both deletion methods
  const typedArgs = args as {
    connectionId?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
  };

  const deleteArgs: {
    connectionId?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
  } = {
    connectionId: typedArgs.connectionId,
    sourceNodeId: typedArgs.sourceNodeId,
    targetNodeId: typedArgs.targetNodeId,
  };

  // Attempt to delete the connection
  const success = graphActions.deleteConnection(deleteArgs);

  if (!success) {
    const identifier =
      deleteArgs.connectionId ||
      `${deleteArgs.sourceNodeId} → ${deleteArgs.targetNodeId}`;
    errors.push(`Failed to delete connection ${identifier}`);
  }
}

/**
 * Resolves node IDs in connection arguments, handling cases where the AI
 * references newly created nodes that need to be mapped to actual IDs
 */
function resolveConnectionNodeIds(
  args: unknown,
  newNodeIds: string[],
  graphState: { nodes: Node[]; edges: Edge[] },
): unknown {
  if (!isAddConnectionArgs(args)) {
    return args;
  }

  const { sourceNodeId, targetNodeId, sourceHandle, targetHandle } = args;

  // Resolve NEW_NODE_ID references first
  let resolvedSourceId = sourceNodeId;
  let resolvedTargetId = targetNodeId;

  if (sourceNodeId === "NEW_NODE_ID") {
    if (newNodeIds.length > 0) {
      resolvedSourceId = newNodeIds[newNodeIds.length - 1];
    }
  }

  if (targetNodeId === "NEW_NODE_ID") {
    if (newNodeIds.length > 0) {
      resolvedTargetId = newNodeIds[newNodeIds.length - 1];
    }
  }

  // Handle cases where AI might use generic references or invalid IDs
  // This is a fallback for when the AI doesn't know specific node IDs
  if (
    resolvedSourceId === "dataset" ||
    resolvedSourceId === "new-node" ||
    !graphState.nodes.find((n) => n.id === resolvedSourceId)
  ) {
    if (sourceHandle === "upload-dataset-output") {
      // Find the most recently created dataset node
      const latestDatasetId = findLatestNodeOfType(
        "dataset",
        newNodeIds,
        graphState,
      );
      if (latestDatasetId) {
        resolvedSourceId = latestDatasetId;
      }
    }
  }

  if (
    resolvedTargetId === "model" ||
    !graphState.nodes.find((n) => n.id === resolvedTargetId)
  ) {
    if (targetHandle === "select-model-input") {
      // Find the model node (there should only be one model the AI is targeting)
      const modelNode = graphState.nodes.find((node) => node.type === "model");
      if (modelNode) {
        resolvedTargetId = modelNode.id;
      }
    }
  }

  return {
    sourceNodeId: resolvedSourceId,
    targetNodeId: resolvedTargetId,
    sourceHandle,
    targetHandle,
  };
}

/**
 * Finds the latest node of a specific type, prioritizing newly created nodes
 */
function findLatestNodeOfType(
  nodeType: string,
  newNodeIds: string[],
  graphState: { nodes: Node[]; edges: Edge[] },
): string | undefined {
  // First check if any newly created nodes match the type
  for (const nodeId of newNodeIds.reverse()) {
    // Check most recent first
    const node = graphState.nodes.find((n) => n.id === nodeId);
    if (node && node.type === nodeType) {
      return nodeId;
    }
  }

  // Get all nodes of the specified type
  const nodesOfType = graphState.nodes.filter((node) => node.type === nodeType);

  if (nodesOfType.length === 0) {
    return undefined;
  }

  // If we have multiple nodes, find the one that's most likely the newest
  // Strategy: find the one with the highest Y position (assumes nodes are added below existing ones)
  const latestNode = nodesOfType.reduce((latest, current) => {
    // Compare by Y position (higher Y = more recent in most cases)
    if (current.position.y > latest.position.y) {
      return current;
    }
    // If Y positions are similar, prefer the one with the longer ID (more recent nanoid)
    if (
      Math.abs(current.position.y - latest.position.y) < 50 &&
      current.id.length >= latest.id.length
    ) {
      return current;
    }
    return latest;
  });

  return latestNode.id;
}

/**
 * Smart model matching function that handles natural language inputs
 */
function findModelByNaturalLanguage(
  input: string,
  availableModels: Record<string, TModelDetail>,
): TModelDetail | null {
  const originalInput = input.toLowerCase().trim();
  const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Handle comparative language first (before normalization removes spaces)
  if (originalInput.includes("smaller") || originalInput.includes("small")) {
    if (originalInput.includes("llama")) {
      return availableModels["llama-3.2-1b"];
    }
    if (originalInput.includes("dialogpt") || originalInput.includes("dialo")) {
      return availableModels["DialoGPT-small"];
    }
  }

  if (
    originalInput.includes("larger") ||
    originalInput.includes("bigger") ||
    originalInput.includes("big")
  ) {
    if (originalInput.includes("llama")) {
      return availableModels["llama-3.2-3b"];
    }
  }

  // Define matching patterns for each model
  const modelPatterns: Record<string, string[]> = {
    "phi-2": ["phi2", "phi-2", "phi 2"],
    "phi-3-mini": [
      "phi3",
      "phi-3",
      "phi 3",
      "phi3mini",
      "phi-3mini",
      "phi 3 mini",
    ],
    "phi-3_5-mini": [
      "phi35",
      "phi-35",
      "phi 35",
      "phi35mini",
      "phi-35mini",
      "phi 35 mini",
      "phi3.5",
      "phi-3.5",
    ],
    "llama-3.2-3b": [
      "llama",
      "llama3b",
      "llama-3b",
      "llama 3b",
      "llama32-3b",
      "llama-32-3b",
      "llama 32 3b",
      "llama3.2-3b",
      "llama-3.2-3b",
    ],
    "llama-3.2-1b": [
      "llama1b",
      "llama-1b",
      "llama 1b",
      "llama32-1b",
      "llama-32-1b",
      "llama 32 1b",
      "llama3.2-1b",
      "llama-3.2-1b",
    ],
    "DialoGPT-small": [
      "dialogpt",
      "diablogpt",
      "dialo-gpt",
      "dialo gpt",
      "dialogptsmall",
      "dialo-gpt-small",
      "dialo gpt small",
    ],
  };

  // Try exact key match first
  if (availableModels[normalizedInput]) {
    return availableModels[normalizedInput];
  }

  // Try pattern matching
  for (const [modelKey, patterns] of Object.entries(modelPatterns)) {
    const normalizedPatterns = patterns.map((p) =>
      p.toLowerCase().replace(/[^a-z0-9]/g, ""),
    );

    if (normalizedPatterns.includes(normalizedInput)) {
      return availableModels[modelKey];
    }
  }

  // Try partial matching with display names
  for (const [, model] of Object.entries(availableModels)) {
    const normalizedDisplayName = model.display_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (
      normalizedDisplayName.includes(normalizedInput) ||
      normalizedInput.includes(normalizedDisplayName)
    ) {
      return model;
    }
  }

  return null;
}

// Type guards for tool arguments
function isUpdateNodePropertiesArgs(args: unknown): args is {
  nodeId: string;
  nodeType: "dataset" | "model" | "training";
  properties: Record<string, unknown>;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "nodeId" in args &&
    "nodeType" in args &&
    "properties" in args &&
    typeof (args as Record<string, unknown>).nodeId === "string" &&
    typeof (args as Record<string, unknown>).nodeType === "string" &&
    typeof (args as Record<string, unknown>).properties === "object"
  );
}

function isAddNodeArgs(args: unknown): args is {
  nodeType: string;
  position: { x: number; y: number };
} {
  const argsObj = args as Record<string, unknown>;
  return (
    typeof args === "object" &&
    args !== null &&
    "nodeType" in args &&
    "position" in args &&
    typeof argsObj.nodeType === "string" &&
    typeof argsObj.position === "object" &&
    argsObj.position !== null &&
    "x" in (argsObj.position as Record<string, unknown>) &&
    "y" in (argsObj.position as Record<string, unknown>)
  );
}

function isDeleteNodeArgs(args: unknown): args is {
  nodeId: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "nodeId" in args &&
    typeof (args as Record<string, unknown>).nodeId === "string"
  );
}

function isAddConnectionArgs(args: unknown): args is {
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: string;
  targetHandle: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "sourceNodeId" in args &&
    "targetNodeId" in args &&
    "sourceHandle" in args &&
    "targetHandle" in args &&
    typeof (args as Record<string, unknown>).sourceNodeId === "string" &&
    typeof (args as Record<string, unknown>).targetNodeId === "string" &&
    typeof (args as Record<string, unknown>).sourceHandle === "string" &&
    typeof (args as Record<string, unknown>).targetHandle === "string"
  );
}

function isDeleteConnectionArgs(args: unknown): args is {
  connectionId?: string;
  sourceNodeId?: string;
  targetNodeId?: string;
} {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const argsObj = args as Record<string, unknown>;

  // Check if it has connectionId
  const hasConnectionId =
    "connectionId" in argsObj &&
    typeof argsObj.connectionId === "string" &&
    argsObj.connectionId.length > 0;

  // Check if it has both sourceNodeId and targetNodeId
  const hasNodeIds =
    "sourceNodeId" in argsObj &&
    "targetNodeId" in argsObj &&
    typeof argsObj.sourceNodeId === "string" &&
    typeof argsObj.targetNodeId === "string" &&
    argsObj.sourceNodeId.length > 0 &&
    argsObj.targetNodeId.length > 0;

  // Must have either connectionId OR both node IDs
  return hasConnectionId || hasNodeIds;
}
