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

// Final Schema Transformation Functions
// Convert TrainingSchemaData to finalSchema.json format

export type FinalSchemaNode = {
  id: string;
  type: "Dataset" | "BaseModel" | "Train";
  props: {
    uris?: string[];
    model_id?: string;
    epochs?: number;
    batch_size?: number;
    train_quant?: "int4" | "int8";
    download_quant?: "int4" | "int8";
  };
};

export type FinalSchemaOutput = {
  training_id: string;
  project_name: string;
  node_schema: {
    schema_version: 1;
    nodes: Record<string, FinalSchemaNode>;
    edges: Array<{
      from: string;
      to: string;
    }>;
    meta: {
      created_by: string;
    };
  };
};

/**
 * Converts TrainingSchemaData to finalSchema.json format
 * Handles all necessary data type conversions and structure mapping
 */
export function buildFinalTrainingSchema(
  trainingData: TrainingSchemaData,
  metadata: {
    trainingId: string; // modelId becomes training_id
    projectName: string;
    createdBy: string; // user identifier
  },
): { success: boolean; data?: FinalSchemaOutput; errors?: string[] } {
  const errors: string[] = [];

  try {
    // Build nodes object for finalSchema
    const nodes: Record<string, FinalSchemaNode> = {};

    // 1. Convert dataset nodes
    for (const dataset of trainingData.datasetNodes) {
      if (!dataset.azureUrl) {
        errors.push(`Dataset ${dataset.id} is missing azureUrl`);
        continue;
      }

      nodes[dataset.id] = {
        id: dataset.id,
        type: "Dataset",
        props: {
          uris: [dataset.azureUrl], // Convert single URL to array
        },
      };
    }

    // 2. Convert model node
    if (!trainingData.modelNode.modelId) {
      errors.push("Model node is missing modelId");
    } else {
      nodes[trainingData.modelNode.id] = {
        id: trainingData.modelNode.id,
        type: "BaseModel",
        props: {
          model_id: trainingData.modelNode.modelId,
        },
      };
    }

    // 3. Convert training node with data type conversions
    const trainingNode = trainingData.trainingNode;

    // Convert batchSize string to number
    const batchSizeNum = parseInt(trainingNode.batchSize, 10);
    if (isNaN(batchSizeNum)) {
      errors.push(`Invalid batch size: ${trainingNode.batchSize}`);
    }

    // Validate quantization values
    if (!["int4", "int8"].includes(trainingNode.trainQuant)) {
      errors.push(`Invalid train quantization: ${trainingNode.trainQuant}`);
    }
    if (!["int4", "int8"].includes(trainingNode.downloadQuant)) {
      errors.push(
        `Invalid download quantization: ${trainingNode.downloadQuant}`,
      );
    }

    nodes[trainingNode.id] = {
      id: trainingNode.id,
      type: "Train",
      props: {
        epochs: trainingNode.epochs,
        batch_size: batchSizeNum, // string → number conversion
        train_quant: trainingNode.trainQuant as "int4" | "int8",
        download_quant: trainingNode.downloadQuant as "int4" | "int8",
      },
    };

    // 4. Copy edges as-is (they're already in the correct format)
    const edges = trainingData.edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
    }));

    // 5. Build final schema structure
    const finalSchema: FinalSchemaOutput = {
      training_id: metadata.trainingId,
      project_name: metadata.projectName,
      node_schema: {
        schema_version: 1,
        nodes,
        edges,
        meta: {
          created_by: metadata.createdBy,
        },
      },
    };

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: finalSchema,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      errors: [errorMessage],
    };
  }
}

/**
 * Utility to generate consistent user identifier for meta.created_by
 */
export function generateCreatedByIdentifier(convexUserId: string): string {
  // Use Convex user ID as primary identifier
  // Can be extended to use email, name, etc. if needed
  return convexUserId;
}

/**
 * Validation helper to ensure final schema matches expected structure
 */
export function validateFinalSchema(schema: FinalSchemaOutput): {
  isValid: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!schema.training_id) errors.push("Missing training_id");
  if (!schema.project_name) errors.push("Missing project_name");
  if (schema.node_schema.schema_version !== 1)
    errors.push("Invalid schema_version");

  // Check nodes structure
  const nodeIds = Object.keys(schema.node_schema.nodes);
  if (nodeIds.length === 0) errors.push("No nodes found");

  // Validate node types
  for (const [nodeId, node] of Object.entries(schema.node_schema.nodes)) {
    if (!["Dataset", "BaseModel", "Train"].includes(node.type)) {
      errors.push(`Invalid node type '${node.type}' for node ${nodeId}`);
    }
  }

  // Check edges reference valid nodes
  for (const edge of schema.node_schema.edges) {
    if (!schema.node_schema.nodes[edge.from]) {
      errors.push(`Edge references non-existent source node: ${edge.from}`);
    }
    if (!schema.node_schema.nodes[edge.to]) {
      errors.push(`Edge references non-existent target node: ${edge.to}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Model Creation Utilities
// Functions for handling model record creation from training data

/**
 * Maps a base model ID to the schema format expected by Convex
 * This provides a mapping from model IDs to their display information
 */
export function mapBaseModelIdToDetails(modelId: string): {
  modelId:
    | "microsoft/phi-2"
    | "microsoft/Phi-3-mini-4k-instruct"
    | "microsoft/Phi-3.5-mini-instruct"
    | "meta-llama/Llama-3.2-3B-Instruct"
    | "meta-llama/Llama-3.2-1B-Instruct"
    | "microsoft/DialoGPT-small";
  displayName: string;
  provider: string;
  parameters: string;
} | null {
  const modelMapping = {
    "microsoft/phi-2": {
      modelId: "microsoft/phi-2" as const,
      displayName: "Phi-2",
      provider: "Microsoft",
      parameters: "2.7B",
    },
    "microsoft/Phi-3-mini-4k-instruct": {
      modelId: "microsoft/Phi-3-mini-4k-instruct" as const,
      displayName: "Phi-3 Mini 4K",
      provider: "Microsoft",
      parameters: "3.8B",
    },
    "microsoft/Phi-3.5-mini-instruct": {
      modelId: "microsoft/Phi-3.5-mini-instruct" as const,
      displayName: "Phi-3.5 Mini",
      provider: "Microsoft",
      parameters: "3.8B",
    },
    "meta-llama/Llama-3.2-3B-Instruct": {
      modelId: "meta-llama/Llama-3.2-3B-Instruct" as const,
      displayName: "Llama 3.2 3B",
      provider: "Meta",
      parameters: "3B",
    },
    "meta-llama/Llama-3.2-1B-Instruct": {
      modelId: "meta-llama/Llama-3.2-1B-Instruct" as const,
      displayName: "Llama 3.2 1B",
      provider: "Meta",
      parameters: "1B",
    },
    "microsoft/DialoGPT-small": {
      modelId: "microsoft/DialoGPT-small" as const,
      displayName: "DialoGPT Small",
      provider: "Microsoft",
      parameters: "117M",
    },
  };

  return modelMapping[modelId as keyof typeof modelMapping] || null;
}

/**
 * Extracts and validates model creation data from training schema
 */
export function extractModelCreationData(trainingData: TrainingSchemaData): {
  success: boolean;
  data?: {
    baseModelDetails: {
      modelId:
        | "microsoft/phi-2"
        | "microsoft/Phi-3-mini-4k-instruct"
        | "microsoft/Phi-3.5-mini-instruct"
        | "meta-llama/Llama-3.2-3B-Instruct"
        | "meta-llama/Llama-3.2-1B-Instruct"
        | "microsoft/DialoGPT-small";
      displayName: string;
      provider: string;
      parameters: string;
    };
    trainingConfig: {
      epochs: number;
      batch_size: number;
      train_quant: "int4" | "int8";
      download_quant: "int4" | "int8";
    };
    title: string;
    trainingGraph: {
      schema_version: number;
      nodes: Record<string, object>;
      edges: Array<{ from: string; to: string }>;
    };
  };
  errors?: string[];
} {
  const errors: string[] = [];

  // Extract and validate base model details
  const baseModelDetails = mapBaseModelIdToDetails(
    trainingData.modelNode.modelId,
  );
  if (!baseModelDetails) {
    errors.push(`Unsupported base model: ${trainingData.modelNode.modelId}`);
  }

  // Extract and validate training configuration
  const batchSizeNum = parseInt(trainingData.trainingNode.batchSize, 10);
  if (isNaN(batchSizeNum)) {
    errors.push(`Invalid batch size: ${trainingData.trainingNode.batchSize}`);
  }

  if (!["int4", "int8"].includes(trainingData.trainingNode.trainQuant)) {
    errors.push(
      `Invalid train quantization: ${trainingData.trainingNode.trainQuant}`,
    );
  }

  if (!["int4", "int8"].includes(trainingData.trainingNode.downloadQuant)) {
    errors.push(
      `Invalid download quantization: ${trainingData.trainingNode.downloadQuant}`,
    );
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const trainingConfig = {
    epochs: trainingData.trainingNode.epochs,
    batch_size: batchSizeNum,
    train_quant: trainingData.trainingNode.trainQuant as "int4" | "int8",
    download_quant: trainingData.trainingNode.downloadQuant as "int4" | "int8",
  };

  // Generate title
  const title = `${baseModelDetails!.displayName} - Fine-tuned (${new Date().toLocaleDateString()})`;

  // Create training graph
  const trainingGraph = {
    schema_version: 1,
    nodes: {} as Record<string, object>,
    edges: trainingData.edges,
  };

  // Build nodes for training graph
  trainingData.datasetNodes.forEach((dataset) => {
    trainingGraph.nodes[dataset.id] = {
      type: "Dataset",
      nodeId: dataset.nodeId,
      azureUrl: dataset.azureUrl,
    };
  });

  trainingGraph.nodes[trainingData.modelNode.id] = {
    type: "BaseModel",
    nodeId: trainingData.modelNode.nodeId,
    modelId: trainingData.modelNode.modelId,
  };

  trainingGraph.nodes[trainingData.trainingNode.id] = {
    type: "Train",
    nodeId: trainingData.trainingNode.nodeId,
    epochs: trainingData.trainingNode.epochs,
    batchSize: trainingData.trainingNode.batchSize,
    trainQuant: trainingData.trainingNode.trainQuant,
    downloadQuant: trainingData.trainingNode.downloadQuant,
  };

  return {
    success: true,
    data: {
      baseModelDetails: baseModelDetails!,
      trainingConfig,
      title,
      trainingGraph,
    },
  };
}

// Note: Convex dataset lookup utilities removed - better handled directly in server actions

// Note: Convex model creation utilities removed - better handled directly in server actions
