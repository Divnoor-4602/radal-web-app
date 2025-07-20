import { z } from "zod";
import { ModelDetailSchema } from "./model.schema";

// Dataset Node Schema - for upload dataset nodes
export const DatasetNodeDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  file: z.union([z.instanceof(File), z.string()]).optional(),
  azureUrl: z.string().url("Invalid Azure URL").optional(),
  storageId: z.string().min(1, "Storage ID is required").optional(),
  projectId: z.string().min(1, "Project ID is required").optional(),
  status: z.enum(["idle", "error", "success"]).optional(),
});

// Model Node Schema - for model selection nodes
export const ModelNodeDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isTrained: z.boolean().optional(),
  availableModels: z.record(ModelDetailSchema).optional(),
  selectedModel: ModelDetailSchema.optional(),
});

// Training Node Schema - for training configuration nodes
export const TrainingNodeDataSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  epochs: z.number().min(1, "Epochs must be at least 1").optional(),
  learningRate: z
    .number()
    .min(0.0001, "Learning rate must be positive")
    .optional(),
  batchSize: z.number().min(1, "Batch size must be at least 1").optional(),
  projectId: z.string().min(1, "Project ID is required").optional(),
  isTrained: z.boolean().optional(),
});

// Union schema for all node data types
export const FlowNodeDataSchema = z.discriminatedUnion("nodeType", [
  DatasetNodeDataSchema.extend({ nodeType: z.literal("dataset") }),
  ModelNodeDataSchema.extend({ nodeType: z.literal("model") }),
  TrainingNodeDataSchema.extend({ nodeType: z.literal("training") }),
]);

// Infer TypeScript types from schemas
export type DatasetNodeData = z.infer<typeof DatasetNodeDataSchema>;
export type ModelNodeData = z.infer<typeof ModelNodeDataSchema>;
export type TrainingNodeData = z.infer<typeof TrainingNodeDataSchema>;
export type FlowNodeData = DatasetNodeData | ModelNodeData | TrainingNodeData;

// Validation helper functions
export const validateDatasetNodeData = (data: unknown) => {
  const result = DatasetNodeDataSchema.safeParse(data);
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

export const validateModelNodeData = (data: unknown) => {
  const result = ModelNodeDataSchema.safeParse(data);
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

export const validateTrainingNodeData = (data: unknown) => {
  const result = TrainingNodeDataSchema.safeParse(data);
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
