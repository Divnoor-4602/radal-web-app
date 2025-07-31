// Canvas Utility Functions

import { NodeChange, EdgeChange } from "@xyflow/react";

// Valid connection patterns
// One dataset can be connected to multiple models
export const validConnectionPatterns = {
  // many-to-many -> One model can be connected to multiple datasets
  // one dataset can connect to multiple models
  datasetToModel: {
    sourceHandle: "upload-dataset-output",
    targetHandle: "select-model-input",
  },
  // many to one between model and training
  modelToTraining: {
    sourceHandle: "select-model-output",
    targetHandle: "training-config-input",
  },
};

// Generate flow key based on project and model context
export function generateFlowKey(
  projectId: string | string[] | undefined,
  modelId: string | string[] | undefined,
  pathname: string | null,
): string {
  // Defensive check for production SSR issues
  if (modelId && modelId !== "undefined") {
    return `model-flow-${modelId}`;
  } else if (projectId && projectId !== "undefined") {
    // Check if we're on the new canvas page
    const isNewCanvasPage = pathname?.includes("/models/new/canvas");
    if (isNewCanvasPage) {
      return `project-canvas-${projectId}`;
    }
    return `project-flow-${projectId}`;
  }
  return "default-flow";
}

// Helper functions for smart change detection
export const isMeaningfulNodeChange = (changes: NodeChange[]): boolean => {
  const meaningfulTypes = changes.filter(
    (change) => change.type === "remove" || change.type === "add",
  );

  return meaningfulTypes.length > 0;
};

export const isMeaningfulEdgeChange = (changes: EdgeChange[]): boolean => {
  const meaningfulTypes = changes.filter(
    (change) => change.type === "remove" || change.type === "add",
  );

  return meaningfulTypes.length > 0;
};

// Check if a connection already exists between the same source and target nodes
export function isDuplicateConnection(
  connection: {
    source?: string | null;
    target?: string | null;
  },
  existingEdges: Array<{
    source: string;
    target: string;
  }>,
): boolean {
  if (!connection.source || !connection.target) {
    return false;
  }

  return existingEdges.some(
    (edge) =>
      edge.source === connection.source && edge.target === connection.target,
  );
}

// Utility function to validate connections based on business rules
export function isConnectionCompatible(connection: {
  sourceHandle?: string | null;
  targetHandle?: string | null;
}): boolean {
  // Check if the handle combination matches any valid pattern
  const isValidHandleCombination = Object.values(validConnectionPatterns).some(
    (pattern) =>
      pattern.sourceHandle === connection.sourceHandle &&
      pattern.targetHandle === connection.targetHandle,
  );

  if (!isValidHandleCombination) {
    return false;
  }

  // All valid handle combinations are now allowed:
  // - Multiple datasets → multiple models (many-to-many)
  // - Multiple models → one training config (many-to-one from model perspective)
  // - Datasets cannot connect to training (prevented by handle patterns)
  // - Flow is unidirectional: Dataset → Model → Training

  return true;
}

// Canvas custom handle connection and reconnection determiner
export function isCustomHandleConnectable(
  connectionCount: number | undefined,
  currentConnectionsLength: number,
  isReconnecting: boolean,
): boolean {
  // If no connectionCount is provided (undefined) or is 0, allow unlimited connections
  if (!connectionCount || connectionCount === 0) {
    return true;
  }

  // During reconnection, allow one extra connection beyond the limit to enable reconnection
  // Normal operation enforces strict limit
  return isReconnecting
    ? currentConnectionsLength <= connectionCount // More permissive during reconnection
    : currentConnectionsLength < connectionCount; // Normal limit otherwise
}

// Get stroke color for connection line and custom edge
export function getConnectionStrokeColor(options: {
  // For error states (ConnectionLine)
  connectionStatus?: "valid" | "invalid";

  // For handle-based detection (ConnectionLine)
  fromHandleId?: string;
  toHandleId?: string;

  // For node-type based detection (CustomEdge)
  sourceNodeType?: string;
  targetNodeType?: string;
  sourceHandleId?: string;
  targetHandleId?: string;

  // For selected state (CustomEdge)
  isSelected?: boolean;
}): string {
  const {
    connectionStatus,
    fromHandleId,
    toHandleId,
    sourceNodeType,
    targetNodeType,
    sourceHandleId,
    targetHandleId,
    isSelected = false,
  } = options;

  // Error state always red
  if (connectionStatus === "invalid") {
    return "#dc2626"; // red-700
  }

  // Handle sets for color determination
  const amberHandles = new Set([
    "select-model-output",
    "training-config-input",
  ]);

  const purpleHandles = new Set([
    "upload-dataset-output",
    "select-model-input",
  ]);

  let baseColor = "#8142D7"; // Default purple

  // Check for amber connections (model <-> training)
  const hasAmberHandles =
    amberHandles.has(fromHandleId ?? "") ||
    amberHandles.has(toHandleId ?? "") ||
    amberHandles.has(sourceHandleId ?? "") ||
    amberHandles.has(targetHandleId ?? "") ||
    (sourceNodeType === "model" && targetNodeType === "training");

  if (hasAmberHandles) {
    baseColor = "#E17100"; // Amber
  } else {
    // Check for purple connections (dataset <-> model)
    const hasPurpleHandles =
      purpleHandles.has(fromHandleId ?? "") ||
      purpleHandles.has(toHandleId ?? "") ||
      purpleHandles.has(sourceHandleId ?? "") ||
      purpleHandles.has(targetHandleId ?? "") ||
      (sourceNodeType === "dataset" && targetNodeType === "model");

    if (hasPurpleHandles) {
      baseColor = "#8142D7"; // Purple
    }
  }

  // Return lighter color if selected, darker if not selected but used to be selected logic
  if (isSelected) {
    if (baseColor === "#E17100") return "#fef3c7"; // Light amber when selected
    if (baseColor === "#8142D7") return "#c4b5fd"; // Light purple when selected
  }

  return baseColor;
}
