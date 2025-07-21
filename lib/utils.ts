import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Canvas Utility Functions

// Valid connection patterns

// One dataset can be connected to multiple models
export const validConnectionPatterns = {
  // many-to-many -> One model can be connected to multiple datasets
  // one dataset can connect to multiple models
  datasetToModel: {
    sourceHandle: "upload-dataset-output",
    targetHandle: "select-model-input",
  },
  modelToDataset: {
    sourceHandle: "select-model-input",
    targetHandle: "upload-dataset-output",
  },
  // many to one between model and training
  modelToTraining: {
    sourceHandle: "select-model-output",
    targetHandle: "training-config-input",
  },
  // one to many between training and model
  trainingToModel: {
    sourceHandle: "training-config-input",
    targetHandle: "select-model-output",
  },
};

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
  // - Multiple datasets ↔ multiple models (many-to-many)
  // - Multiple models ↔ one training config (many-to-one from model perspective)
  // - One training config ↔ multiple models (one-to-many from training perspective)
  // - Datasets cannot connect to training (prevented by handle patterns)

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

  // Return darker color if selected
  if (isSelected) {
    if (baseColor === "#E17100") return "#C65A00"; // Darker amber
    if (baseColor === "#8142D7") return "#6A3AA0"; // Darker purple
  }

  return baseColor;
}
