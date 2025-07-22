import { type Node, type Edge } from "@xyflow/react";
import {
  type DatasetNodeData,
  type ModelNodeData,
  type TrainingNodeData,
  validateDatasetNodeData,
  validateModelNodeData,
  validateTrainingNodeData,
} from "@/lib/validations/node.schema";
import {
  ModelDetailSchema,
  type TModelDetail,
} from "@/lib/validations/model.schema";
import { TrainingConfigSchema } from "@/lib/validations/training.schema";

// Training Flow Validation Functions
//
// Architecture:
// - Core functions (*Core) work with server-agnostic types and can be used in server actions
// - Wrapper functions handle ReactFlow types and call the core functions
// - This ensures data validation consistency between client and server

export type TrainingFlowValidation = {
  isValid: boolean;
  errors: string[];
  trainingNodeId?: string;
  connectedModelNodeId?: string;
  connectedDatasetNodeIds?: string[];
};

// Server-agnostic types for validation
export type ServerNode = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};

export type ServerEdge = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

/**
 * Core validation function that works with server-agnostic types
 * Can be used in both client and server contexts
 */
export function validateTrainingFlowCore(
  nodes: ServerNode[],
  edges: ServerEdge[],
): TrainingFlowValidation {
  const errors: string[] = [];

  // Find training nodes
  const trainingNodes = nodes.filter((node) => node.type === "training");

  if (trainingNodes.length === 0) {
    errors.push("No training configuration node found on canvas");
    return { isValid: false, errors };
  }

  if (trainingNodes.length > 1) {
    errors.push(
      "Multiple training configuration nodes found. Only one is allowed",
    );
    return { isValid: false, errors };
  }

  const trainingNode = trainingNodes[0];

  // Find model nodes connected to the training node
  const modelToTrainingEdges = edges.filter(
    (edge) =>
      edge.target === trainingNode.id &&
      edge.targetHandle === "training-config-input",
  );

  if (modelToTrainingEdges.length === 0) {
    errors.push(
      "Training configuration node must be connected to a model node",
    );
    return { isValid: false, errors };
  }

  if (modelToTrainingEdges.length > 1) {
    errors.push(
      "Training configuration node can only be connected to one model node",
    );
    return { isValid: false, errors };
  }

  const connectedModelNodeId = modelToTrainingEdges[0].source;
  const connectedModelNode = nodes.find(
    (node) => node.id === connectedModelNodeId,
  );

  if (!connectedModelNode || connectedModelNode.type !== "model") {
    errors.push(
      "Training configuration node must be connected to a valid model node",
    );
    return { isValid: false, errors };
  }

  // Find dataset nodes connected to the model node
  const datasetToModelEdges = edges.filter(
    (edge) =>
      edge.target === connectedModelNodeId &&
      edge.targetHandle === "select-model-input",
  );

  if (datasetToModelEdges.length === 0) {
    errors.push("Model node must be connected to at least one dataset node");
    return { isValid: false, errors };
  }

  // Validate that all connected sources are actually dataset nodes
  const connectedDatasetNodeIds: string[] = [];
  for (const edge of datasetToModelEdges) {
    const sourceNode = nodes.find((node) => node.id === edge.source);
    if (!sourceNode || sourceNode.type !== "dataset") {
      errors.push(`Invalid connection: ${edge.source} is not a dataset node`);
      return { isValid: false, errors };
    }
    connectedDatasetNodeIds.push(edge.source);
  }

  return {
    isValid: true,
    errors: [],
    trainingNodeId: trainingNode.id,
    connectedModelNodeId,
    connectedDatasetNodeIds,
  };
}

/**
 * Client-side wrapper for ReactFlow types
 * Validates that the canvas has a proper training flow:
 * - One training configuration node exists
 * - Training node is connected to exactly one model node
 * - Connected model node has at least one dataset connected to it
 */
export function validateTrainingFlow(
  nodes: Node[],
  edges: Edge[],
): TrainingFlowValidation {
  // Convert ReactFlow types to server-agnostic types
  const serverNodes: ServerNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type || "unknown",
    data: node.data,
  }));

  const serverEdges: ServerEdge[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return validateTrainingFlowCore(serverNodes, serverEdges);
}

// Training Flow Node Collection and Validation

export type ValidatedTrainingNodes = {
  isValid: boolean;
  errors: string[];
  datasetNodes?: Array<{
    id: string;
    data: DatasetNodeData;
    azureUrl?: string;
  }>;
  modelNode?: {
    id: string;
    data: ModelNodeData;
    selectedModel?: TModelDetail;
  };
  trainingNode?: {
    id: string;
    data: TrainingNodeData;
  };
};

/**
 * Core function that collects and validates nodes (server-agnostic)
 * Only includes dataset nodes connected to the model node that connects to training
 */
export function getConnectedTrainingNodesCore(
  nodes: ServerNode[],
  edges: ServerEdge[],
): ValidatedTrainingNodes {
  const errors: string[] = [];

  // First validate the flow structure
  const flowValidation = validateTrainingFlowCore(nodes, edges);
  if (!flowValidation.isValid) {
    return {
      isValid: false,
      errors: flowValidation.errors,
    };
  }

  const { trainingNodeId, connectedModelNodeId, connectedDatasetNodeIds } =
    flowValidation;

  // Get the actual nodes
  const trainingNode = nodes.find((node) => node.id === trainingNodeId);
  const modelNode = nodes.find((node) => node.id === connectedModelNodeId);
  const datasetNodes = connectedDatasetNodeIds!
    .map((id) => nodes.find((node) => node.id === id))
    .filter(Boolean) as ServerNode[];

  // Validate dataset nodes
  const validatedDatasetNodes: Array<{
    id: string;
    data: DatasetNodeData;
    azureUrl?: string;
  }> = [];

  for (const node of datasetNodes) {
    const validation = validateDatasetNodeData(node.data);
    if (!validation.isValid) {
      const errorMessages = validation.errors
        ? validation.errors.map((e) => e.message).join(", ")
        : "Unknown validation error";
      errors.push(`Dataset node ${node.id}: ${errorMessages}`);
      continue;
    }

    const datasetData = validation.data as DatasetNodeData;

    // Check if dataset has required data for training
    if (!datasetData.azureUrl && !datasetData.storageId) {
      errors.push(`Dataset node ${node.id}: Missing azureUrl or storageId`);
      continue;
    }

    // Validate that azureUrl is not empty if it exists (required for training schema)
    if (datasetData.azureUrl && datasetData.azureUrl.trim() === "") {
      errors.push(`Dataset node ${node.id}: azureUrl cannot be empty`);
      continue;
    }

    // Validate that we have at least one non-empty URL for training
    const hasValidAzureUrl =
      datasetData.azureUrl && datasetData.azureUrl.trim() !== "";
    const hasValidStorageId =
      datasetData.storageId && datasetData.storageId.trim() !== "";

    if (!hasValidAzureUrl && !hasValidStorageId) {
      errors.push(
        `Dataset node ${node.id}: Must have valid non-empty azureUrl or storageId`,
      );
      continue;
    }

    validatedDatasetNodes.push({
      id: node.id,
      data: datasetData,
      azureUrl: datasetData.azureUrl,
    });
  }

  // Validate model node
  if (!modelNode) {
    errors.push("Model node not found");
    return { isValid: false, errors };
  }

  const modelValidation = validateModelNodeData(modelNode.data);
  if (!modelValidation.isValid) {
    const errorMessages = modelValidation.errors
      ? modelValidation.errors.map((e) => e.message).join(", ")
      : "Unknown validation error";
    errors.push(`Model node ${modelNode.id}: ${errorMessages}`);
    return { isValid: false, errors };
  }

  const modelData = modelValidation.data as ModelNodeData;

  // Validate that a model is selected
  if (!modelData.selectedModel) {
    errors.push(`Model node ${modelNode.id}: No model selected`);
    return { isValid: false, errors };
  }

  // Validate the selected model against schema
  const selectedModelValidation = ModelDetailSchema.safeParse(
    modelData.selectedModel,
  );
  if (!selectedModelValidation.success) {
    errors.push(`Model node ${modelNode.id}: Invalid selected model data`);
    return { isValid: false, errors };
  }

  // Validate training node
  if (!trainingNode) {
    errors.push("Training node not found");
    return { isValid: false, errors };
  }

  const trainingValidation = validateTrainingNodeData(trainingNode.data);
  if (!trainingValidation.isValid) {
    const errorMessages = trainingValidation.errors
      ? trainingValidation.errors.map((e) => e.message).join(", ")
      : "Unknown validation error";
    errors.push(`Training node ${trainingNode.id}: ${errorMessages}`);
    return { isValid: false, errors };
  }

  const trainingData = trainingValidation.data as TrainingNodeData;

  // Validate training configuration against schema
  const trainingConfigValidation = TrainingConfigSchema.safeParse({
    epochs: trainingData.epochs,
    batchSize: trainingData.batchSize,
    downloadQuant: trainingData.downloadQuant,
  });

  if (!trainingConfigValidation.success) {
    errors.push(
      `Training node ${trainingNode.id}: Invalid training configuration`,
    );
    return { isValid: false, errors };
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: [],
    datasetNodes: validatedDatasetNodes,
    modelNode: {
      id: modelNode.id,
      data: modelData,
      selectedModel: selectedModelValidation.data,
    },
    trainingNode: {
      id: trainingNode.id,
      data: trainingData,
    },
  };
}

/**
 * Client-side wrapper for ReactFlow types
 * Collects and validates nodes that are part of the training flow
 * Only includes dataset nodes connected to the model node that connects to training
 */
export function getConnectedTrainingNodes(
  nodes: Node[],
  edges: Edge[],
): ValidatedTrainingNodes {
  // Convert ReactFlow types to server-agnostic types
  const serverNodes: ServerNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type || "unknown",
    data: node.data,
  }));

  const serverEdges: ServerEdge[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return getConnectedTrainingNodesCore(serverNodes, serverEdges);
}

// Training Flow Transformation Functions

export type TrainingSchemaData = {
  datasetNodes: Array<{
    id: string; // d1, d2, etc.
    nodeId: string; // original node ID
    azureUrl?: string;
  }>;
  modelNode: {
    id: string; // b1
    nodeId: string; // original node ID
    modelId: string;
  };
  trainingNode: {
    id: string; // t1
    nodeId: string; // original node ID
    epochs: number;
    batchSize: string;
    trainQuant: string;
    downloadQuant: string;
  };
  edges: Array<{
    from: string;
    to: string;
  }>;
};

/**
 * Core transformation function (server-agnostic)
 * Transforms validated training nodes into the format expected by server actions
 */
export function transformFlowToTrainingSchemaCore(
  nodes: ServerNode[],
  edges: ServerEdge[],
): { success: boolean; data?: TrainingSchemaData; errors?: string[] } {
  // First validate and collect the nodes
  const connectedNodes = getConnectedTrainingNodesCore(nodes, edges);

  if (
    !connectedNodes.isValid ||
    !connectedNodes.datasetNodes ||
    !connectedNodes.modelNode ||
    !connectedNodes.trainingNode
  ) {
    return {
      success: false,
      errors: connectedNodes.errors || ["Failed to collect connected nodes"],
    };
  }

  const transformedDatasets = connectedNodes.datasetNodes
    .filter((dataset) => dataset.azureUrl && dataset.azureUrl.trim() !== "")
    .map((dataset, index) => ({
      id: `d${index + 1}`,
      nodeId: dataset.id,
      azureUrl: dataset.azureUrl!.trim(),
    }));

  if (transformedDatasets.length === 0) {
    return {
      success: false,
      errors: ["No datasets with valid azureUrl found for training"],
    };
  }

  const transformedModel = {
    id: "b1",
    nodeId: connectedNodes.modelNode.id,
    modelId: connectedNodes.modelNode.selectedModel?.model_id || "",
  };

  if (!transformedModel.modelId) {
    return {
      success: false,
      errors: ["Model node must have a selected model with valid model_id"],
    };
  }

  const transformedTraining = {
    id: "t1",
    nodeId: connectedNodes.trainingNode.id,
    epochs: connectedNodes.trainingNode.data.epochs,
    batchSize: connectedNodes.trainingNode.data.batchSize,
    trainQuant: connectedNodes.trainingNode.data.quantization,
    downloadQuant: connectedNodes.trainingNode.data.downloadQuant,
  };

  // Transform edges - map original node IDs to schema IDs
  const nodeIdMapping = new Map<string, string>();

  // Build mapping from original node IDs to schema IDs
  transformedDatasets.forEach((dataset) => {
    nodeIdMapping.set(dataset.nodeId, dataset.id);
  });
  nodeIdMapping.set(transformedModel.nodeId, transformedModel.id);
  nodeIdMapping.set(transformedTraining.nodeId, transformedTraining.id);

  const transformedEdges = edges
    .filter((edge) => {
      // Only include edges between our connected nodes
      const sourceSchemaId = nodeIdMapping.get(edge.source);
      const targetSchemaId = nodeIdMapping.get(edge.target);
      return sourceSchemaId && targetSchemaId;
    })
    .map((edge) => ({
      from: nodeIdMapping.get(edge.source)!,
      to: nodeIdMapping.get(edge.target)!,
    }));

  return {
    success: true,
    data: {
      datasetNodes: transformedDatasets,
      modelNode: transformedModel,
      trainingNode: transformedTraining,
      edges: transformedEdges,
    },
  };
}

/**
 * Client-side wrapper for ReactFlow types
 * Transforms validated training nodes into the format expected by server actions
 */
export function transformFlowToTrainingSchema(
  nodes: Node[],
  edges: Edge[],
): { success: boolean; data?: TrainingSchemaData; errors?: string[] } {
  // Convert ReactFlow types to server-agnostic types
  const serverNodes: ServerNode[] = nodes.map((node) => ({
    id: node.id,
    type: node.type || "unknown",
    data: node.data,
  }));

  const serverEdges: ServerEdge[] = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
  }));

  return transformFlowToTrainingSchemaCore(serverNodes, serverEdges);
}
