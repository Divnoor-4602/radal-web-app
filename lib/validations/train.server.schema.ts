import { z } from "zod";

// Server-side validation schemas for training flow

// Validate individual dataset node in the training data
export const ServerDatasetNodeSchema = z.object({
  id: z.string().regex(/^d\d+$/, "Dataset ID must follow pattern d1, d2, etc."),
  nodeId: z.string().min(1, "Node ID is required"),
  azureUrl: z
    .string()
    .url("Invalid Azure URL format")
    .min(1, "Azure URL is required"),
});

// Validate model node in the training data
export const ServerModelNodeSchema = z.object({
  id: z.literal("b1", {
    errorMap: () => ({ message: "Model ID must be 'b1'" }),
  }),
  nodeId: z.string().min(1, "Node ID is required"),
  modelId: z.string().min(1, "Model ID is required"),
});

// Validate training node in the training data
export const ServerTrainingNodeSchema = z.object({
  id: z.literal("t1", {
    errorMap: () => ({ message: "Training ID must be 't1'" }),
  }),
  nodeId: z.string().min(1, "Node ID is required"),
  epochs: z.number().int().min(1).max(5, "Epochs must be between 1 and 5"),
  batchSize: z.literal("4", {
    errorMap: () => ({ message: "Batch size must be '4'" }),
  }),
  trainQuant: z.enum(["int4", "int8"], {
    errorMap: () => ({
      message: "Train quantization must be 'int4' or 'int8'",
    }),
  }),
  downloadQuant: z.enum(["int4", "int8"], {
    errorMap: () => ({
      message: "Download quantization must be 'int4' or 'int8'",
    }),
  }),
});

// Validate edge connections in the training data
export const ServerEdgeSchema = z.object({
  from: z.string().min(1, "Edge 'from' is required"),
  to: z.string().min(1, "Edge 'to' is required"),
});

// Validate the complete TrainingSchemaData structure from client
export const TrainingSchemaDataServerSchema = z.object({
  datasetNodes: z
    .array(ServerDatasetNodeSchema)
    .min(1, "At least one dataset is required")
    .max(10, "Maximum 10 datasets allowed"),
  modelNode: ServerModelNodeSchema,
  trainingNode: ServerTrainingNodeSchema,
  edges: z
    .array(ServerEdgeSchema)
    .min(1, "At least one edge connection is required"),
});

// Validate the complete server action input parameters
export const StartTrainingInputSchema = z.object({
  trainingData: TrainingSchemaDataServerSchema,
  projectId: z.string().min(1, "Project ID is required"),
  canvasData: z.optional(z.any()), // Canvas data from localStorage
});

// Schema for the final JSON output that matches finalSchema.json structure
export const FinalSchemaNodePropsSchema = z.object({
  uris: z.array(z.string().url()).optional(),
  model_id: z.string().optional(),
  epochs: z.number().int().optional(),
  batch_size: z.number().int().optional(),
  train_quant: z.enum(["int4", "int8"]).optional(),
  download_quant: z.enum(["int4", "int8"]).optional(),
});

export const FinalSchemaNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["Dataset", "BaseModel", "Train"]),
  props: FinalSchemaNodePropsSchema,
});

export const FinalSchemaEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const FinalSchemaMetaSchema = z.object({
  created_by: z.string(),
});

export const FinalSchemaNodeSchemaSchema = z.object({
  schema_version: z.literal(1),
  nodes: z.record(z.string(), FinalSchemaNodeSchema),
  edges: z.array(FinalSchemaEdgeSchema),
  meta: FinalSchemaMetaSchema,
});

export const FinalTrainingSchemaSchema = z.object({
  training_id: z.string().min(1, "Training ID is required"),
  project_name: z.string().min(1, "Project name is required"),
  node_schema: FinalSchemaNodeSchemaSchema,
});

// Type exports for use in server actions
export type TrainingSchemaDataServer = z.infer<
  typeof TrainingSchemaDataServerSchema
>;
export type StartTrainingInput = z.infer<typeof StartTrainingInputSchema>;
export type FinalTrainingSchema = z.infer<typeof FinalTrainingSchemaSchema>;
export type FinalSchemaNode = z.infer<typeof FinalSchemaNodeSchema>;
export type FinalSchemaEdge = z.infer<typeof FinalSchemaEdgeSchema>;

// Validation helper functions for server actions
export const validateStartTrainingInput = (data: unknown) => {
  const result = StartTrainingInputSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

export const validateFinalTrainingSchema = (data: unknown) => {
  const result = FinalTrainingSchemaSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

// Model Creation Validation Schemas
// Schemas for validating data during model record creation

// Validate base model details for model creation
export const BaseModelDetailsSchema = z.object({
  modelId: z.enum([
    "microsoft/phi-2",
    "microsoft/Phi-3-mini-4k-instruct",
    "microsoft/Phi-3.5-mini-instruct",
    "meta-llama/Llama-3.2-3B-Instruct",
    "meta-llama/Llama-3.2-1B-Instruct",
    "microsoft/DialoGPT-small",
  ]),
  displayName: z.string().min(1, "Display name is required"),
  provider: z.string().min(1, "Provider is required"),
  parameters: z.string().min(1, "Parameters is required"),
});

// Validate training configuration for model creation
export const TrainingConfigSchema = z.object({
  epochs: z.number().int().min(1).max(5, "Epochs must be between 1 and 5"),
  batch_size: z.number().int().positive("Batch size must be positive"),
  train_quant: z.enum(["int4", "int8"]),
  download_quant: z.enum(["int4", "int8"]),
});

// Validate model creation data
export const ModelCreationDataSchema = z.object({
  baseModelDetails: BaseModelDetailsSchema,
  trainingConfig: TrainingConfigSchema,
  title: z.string().min(1, "Title is required"),
  trainingGraph: z.object({
    schema_version: z.number().int().positive(),
    nodes: z.record(z.string(), z.object({})),
    edges: z.array(
      z.object({
        from: z.string(),
        to: z.string(),
      }),
    ),
  }),
});

// Type exports for model creation
export type BaseModelDetails = z.infer<typeof BaseModelDetailsSchema>;
export type TrainingConfig = z.infer<typeof TrainingConfigSchema>;
export type ModelCreationData = z.infer<typeof ModelCreationDataSchema>;

// Validation helper functions
export const validateBaseModelDetails = (data: unknown) => {
  const result = BaseModelDetailsSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

export const validateTrainingConfig = (data: unknown) => {
  const result = TrainingConfigSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

export const validateModelCreationData = (data: unknown) => {
  const result = ModelCreationDataSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

// Validation helper for edge connections integrity
export const validateEdgeConnections = (
  nodes: Record<string, FinalSchemaNode>,
  edges: FinalSchemaEdge[],
): { isValid: boolean; errors?: string[] } => {
  const errors: string[] = [];

  for (const edge of edges) {
    if (!nodes[edge.from]) {
      errors.push(`Edge references non-existent source node: ${edge.from}`);
    }
    if (!nodes[edge.to]) {
      errors.push(`Edge references non-existent target node: ${edge.to}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
};
