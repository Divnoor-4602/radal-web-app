// Assistant Utility Functions
// Tool invocation processing and graph manipulation utilities

import { availableModels } from "@/constants";
import type { ToolInvocation } from "@/lib/validations/assistant.schema";
import type { Node, Edge, NodeChange } from "@xyflow/react";

/**
 * Processes tool invocations from the AI assistant and updates the graph state
 *
 * @param toolInvocations - Array of tool invocations from the AI response
 * @param graphState - Current graph state with nodes and edges
 * @param graphActions - Graph manipulation functions from the flow store
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
    ) => void;
    onNodesChange: (changes: NodeChange[]) => void;
  },
): {
  success: boolean;
  processedCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  let processedCount = 0;

  console.log(`🛠️ Processing ${toolInvocations.length} tool invocations...`);

  toolInvocations.forEach((toolCall, index) => {
    try {
      const { toolName, args } = toolCall;

      console.log(
        `🔧 Processing tool ${index + 1}/${toolInvocations.length}: ${toolName}`,
        args,
      );

      switch (toolName) {
        case "updateNodeProperties":
          processUpdateNodeProperties(args, graphState, graphActions, errors);
          break;

        case "addNode":
          processAddNode(args, graphActions, errors);
          break;

        case "deleteNode":
          processDeleteNode(args, graphState, graphActions, errors);
          break;

        default:
          errors.push(`Unknown tool name: ${toolName}`);
          console.warn(`⚠️ Unknown tool name: ${toolName}`);
          return;
      }

      processedCount++;
      console.log(`✅ Successfully processed ${toolName}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Error processing tool ${index + 1}: ${errorMessage}`);
      console.error(`❌ Error processing tool invocation ${index + 1}:`, error);
    }
  });

  const success = errors.length === 0;
  console.log(
    `🎯 Tool processing complete: ${processedCount}/${toolInvocations.length} successful`,
  );

  if (errors.length > 0) {
    console.error("❌ Tool processing errors:", errors);
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
): void {
  // Type guard for args
  if (!isUpdateNodePropertiesArgs(args)) {
    errors.push("Invalid updateNodeProperties arguments");
    return;
  }

  const { nodeId, nodeType, properties } = args;

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
      const selectedModel = Object.values(availableModels).find(
        (model) => model.model_id === properties.selectedModelId,
      );
      if (selectedModel) {
        updateData.selectedModel = selectedModel;
      } else {
        errors.push(
          `Model with ID ${properties.selectedModelId} not found in available models`,
        );
        return;
      }
    }
  } else if (nodeType === "dataset") {
    // Update dataset node properties
    if (properties.status !== undefined) updateData.status = properties.status;
  } else {
    errors.push(`Unsupported node type for update: ${nodeType}`);
    return;
  }

  // Apply the update if we have data to update
  if (Object.keys(updateData).length > 0) {
    graphActions.updateNodeData(nodeId, updateData);
    console.log(`📝 Updated ${nodeType} node ${nodeId}:`, updateData);
  } else {
    errors.push(`No valid properties to update for node ${nodeId}`);
  }
}

/**
 * Processes addNode tool invocation
 */
function processAddNode(
  args: unknown,
  graphActions: {
    addNode: (
      type: string,
      position: { x: number; y: number },
      projectId?: string,
    ) => void;
  },
  errors: string[],
): void {
  // Type guard for args
  if (!isAddNodeArgs(args)) {
    errors.push("Invalid addNode arguments");
    return;
  }

  const { nodeType, position } = args;

  // Validate node type
  if (!["dataset", "model", "training"].includes(nodeType)) {
    errors.push(`Invalid node type: ${nodeType}`);
    return;
  }

  // Validate position
  if (typeof position.x !== "number" || typeof position.y !== "number") {
    errors.push("Invalid position coordinates");
    return;
  }

  graphActions.addNode(nodeType, position);
  console.log(
    `➕ Added ${nodeType} node at position (${position.x}, ${position.y})`,
  );
}

/**
 * Processes deleteNode tool invocation
 */
function processDeleteNode(
  args: unknown,
  graphState: { nodes: Node[]; edges: Edge[] },
  graphActions: { onNodesChange: (changes: NodeChange[]) => void },
  errors: string[],
): void {
  // Type guard for args
  if (!isDeleteNodeArgs(args)) {
    errors.push("Invalid deleteNode arguments");
    return;
  }

  const { nodeId } = args;

  // Verify node exists
  const nodeExists = graphState.nodes.some((node) => node.id === nodeId);
  if (!nodeExists) {
    errors.push(`Node with ID ${nodeId} not found`);
    return;
  }

  // Use React Flow's node change system for proper cleanup
  graphActions.onNodesChange([{ type: "remove", id: nodeId }]);
  console.log(`🗑️ Deleted node ${nodeId}`);
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
