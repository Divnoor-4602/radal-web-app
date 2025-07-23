// AI Tools for Graph Manipulation
// Extracted from API route for better organization

import { tool } from "ai";
import {
  UpdateNodePropertiesSchema,
  AddNodeSchema,
  DeleteNodeSchema,
  AddConnectionSchema,
  DeleteConnectionSchema,
} from "@/lib/validations/assistant.schema";

/**
 * Tool for updating properties of existing nodes in the graph
 * Validates parameters using the comprehensive schema
 */
export const updateNodePropertiesTool = tool({
  description: "Update properties of an existing node in the graph",
  parameters: UpdateNodePropertiesSchema,
});

/**
 * Tool for adding new nodes to the graph
 * Validates parameters and ensures proper positioning
 */
export const addNodeTool = tool({
  description: "Add a new node to the graph",
  parameters: AddNodeSchema,
});

/**
 * Tool for deleting nodes from the graph
 * Validates node ownership and handles cleanup
 */
export const deleteNodeTool = tool({
  description: "Delete a node from the graph",
  parameters: DeleteNodeSchema,
});

/**
 * Tool for adding new connections between nodes
 * Validates connection compatibility and prevents duplicates
 * Valid connections: dataset→model or model→training
 */
export const addConnectionTool = tool({
  description:
    "Add a new connection between two nodes in the graph. Valid connections: dataset→model (upload-dataset-output to select-model-input) or model→training (select-model-output to training-config-input). Automatically validates compatibility and prevents duplicates.",
  parameters: AddConnectionSchema,
});

/**
 * Tool for deleting existing connections
 * Validates connection exists before deletion
 */
export const deleteConnectionTool = tool({
  description:
    "Delete an existing connection from the graph by its connection ID",
  parameters: DeleteConnectionSchema,
});

/**
 * Complete tools object for AI SDK
 * Exported for use in the AI service
 */
export const graphTools = {
  updateNodeProperties: updateNodePropertiesTool,
  addNode: addNodeTool,
  deleteNode: deleteNodeTool,
  addConnection: addConnectionTool,
  deleteConnection: deleteConnectionTool,
};

/**
 * Tool names enum for type safety
 */
export const TOOL_NAMES = {
  UPDATE_NODE_PROPERTIES: "updateNodeProperties",
  ADD_NODE: "addNode",
  DELETE_NODE: "deleteNode",
  ADD_CONNECTION: "addConnection",
  DELETE_CONNECTION: "deleteConnection",
} as const;

/**
 * Type for tool names
 */
export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];

/**
 * Validates if a tool name is supported
 *
 * @param toolName - Tool name to validate
 * @returns boolean indicating if tool is supported
 */
export function isValidToolName(toolName: string): toolName is ToolName {
  return Object.values(TOOL_NAMES).includes(toolName as ToolName);
}

/**
 * Gets tool description for a given tool name
 *
 * @param toolName - Tool name
 * @returns Tool description or null if not found
 */
export function getToolDescription(toolName: ToolName): string | null {
  switch (toolName) {
    case TOOL_NAMES.UPDATE_NODE_PROPERTIES:
      return "Updates properties of an existing node in the ML pipeline";
    case TOOL_NAMES.ADD_NODE:
      return "Adds a new node to the ML pipeline";
    case TOOL_NAMES.DELETE_NODE:
      return "Removes a node from the ML pipeline";
    case TOOL_NAMES.ADD_CONNECTION:
      return "Creates a connection between two nodes in the ML pipeline";
    case TOOL_NAMES.DELETE_CONNECTION:
      return "Removes a connection between nodes in the ML pipeline";
    default:
      return null;
  }
}

/**
 * Configuration for tool usage limits and constraints
 */
export const TOOL_CONFIG = {
  maxToolsPerRequest: 10,
  maxNodesPerGraph: 50,
  maxEdgesPerGraph: 100,
  maxConnectionsPerRequest: 5,
  allowedNodeTypes: ["dataset", "model", "training"] as const,
  allowedConnections: [
    {
      from: "dataset",
      to: "model",
      sourceHandle: "upload-dataset-output",
      targetHandle: "select-model-input",
    },
    {
      from: "model",
      to: "training",
      sourceHandle: "select-model-output",
      targetHandle: "training-config-input",
    },
  ] as const,
} as const;
