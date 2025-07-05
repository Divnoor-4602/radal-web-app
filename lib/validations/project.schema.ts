// This file is empty - validation schemas to be added based on requirements

import { z } from "zod";

// =======================
// CSV FILE VALIDATION
// =======================

// CSV File validation schema
export const CSVFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "text/csv" || file.name.endsWith(".csv"), {
    message: "File must be a CSV file",
  })
  .refine(
    (file) => file.size <= 50_000_000, // 50MB limit
    {
      message: "File size must be less than 50MB",
    },
  )
  .refine((file) => file.size > 0, {
    message: "File cannot be empty",
  });

// Multiple CSV files validation
export const CSVFilesSchema = z
  .array(CSVFileSchema)
  .min(1, "At least one CSV file is required")
  .max(10, "Maximum 10 files allowed");

// =======================
// MODEL SELECTION VALIDATION
// =======================

// Available models enum
export const ModelIdSchema = z.enum(["phi-2"], {
  errorMap: () => ({ message: "Please select a valid model" }),
});

// Available quantization options
export const QuantizationSchema = z.enum(["int4", "int8", "fp16"], {
  errorMap: () => ({ message: "Please select a valid quantization option" }),
});

// Model Props Schema (for the API JSON format)
export const ModelPropsSchema = z.object({
  model_id: ModelIdSchema,
  quant: QuantizationSchema,
});

// Full BaseModel Schema (matches your API JSON format)
export const BaseModelSchema = z.object({
  id: z
    .string()
    .min(1, "Model ID is required")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Model ID can only contain alphanumeric characters, hyphens, and underscores",
    ),
  type: z.literal("BaseModel"),
  props: ModelPropsSchema,
});

// Client-side model selection validation
export const ClientModelSelectionSchema = z.object({
  title: z.string().min(1, "Model title is required"),
  description: z.string().optional(),
  modelId: ModelIdSchema,
  quant: QuantizationSchema,
});

// Server-side model creation schema
export const ServerCreateModelSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Model title is required"),
  description: z.string().optional(),
  modelId: ModelIdSchema,
  quant: QuantizationSchema,
  userId: z.string().min(1, "User ID is required"),
});

// =======================
// PARSED CSV VALIDATION
// =======================

// Validate individual CSV cell content
export const CSVCellSchema = z
  .string()
  .transform((val) => val.trim())
  .refine((val) => val.length >= 0, "Cell values must be valid strings");

// Validate CSV row structure (exactly 2 columns)
export const CSVRowSchema = z
  .array(CSVCellSchema)
  .length(2, "Each row must have exactly 2 columns")
  .refine(
    (row) => row.every((cell) => typeof cell === "string"),
    "All cell values must be strings",
  );

// Validate CSV header structure (exactly 2 column names)
export const CSVHeaderSchema = z
  .array(z.string().min(1, "Column names cannot be empty"))
  .length(2, "CSV must have exactly 2 columns")
  .refine(
    (headers) => headers.every((header) => header.trim().length > 0),
    "Column names cannot be empty or whitespace only",
  )
  .refine(
    (headers) => new Set(headers).size === headers.length,
    "Column names must be unique",
  );

// Validate complete parsed CSV structure
export const ParsedCSVSchema = z
  .object({
    headers: CSVHeaderSchema,
    rows: z
      .array(CSVRowSchema)
      .min(1, "CSV must contain at least one data row")
      .max(100000, "CSV cannot exceed 100,000 rows"),
    totalRows: z.number().min(1).max(100000),
    totalColumns: z.literal(2, { message: "CSV must have exactly 2 columns" }),
  })
  .refine(
    (data) => data.rows.length === data.totalRows,
    "Row count mismatch: actual rows don't match total count",
  )
  .refine(
    (data) => data.headers.length === data.totalColumns,
    "Column count mismatch: headers don't match total columns",
  )
  .refine(
    (data) => data.rows.every((row) => row.length === 2),
    "All rows must have exactly 2 columns",
  );

// Raw CSV validation (before processing)
export const RawCSVDataSchema = z
  .array(z.array(z.string()))
  .min(2, "CSV must have at least a header row and one data row")
  .refine(
    (rows) => rows.length >= 2,
    "CSV must contain header row and at least one data row",
  )
  .refine(
    (rows) => rows[0].length >= 1,
    "CSV header must have at least one column",
  );

// =======================
// DATASET UPLOAD FLOW
// =======================

// Step 1: Generate upload URL request
export const GenerateUploadUrlSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  filename: z.string().min(1, "Filename is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// Step 2: File upload response (from Convex storage)
export const FileUploadResponseSchema = z.object({
  storageId: z.string().min(1, "Storage ID is required"),
});

// Step 3: Save dataset request
export const SaveDatasetSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  storageId: z.string().min(1, "Storage ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  originalFilename: z.string().min(1, "Original filename is required"),
  fileSize: z.number().min(1, "File size is required"),
  mimeType: z.string().min(1, "MIME type is required"),
});

// =======================
// DATASET API SCHEMA
// =======================

// Dataset Props Schema (for the API JSON format)
export const DatasetPropsSchema = z.object({
  uris: z
    .array(z.string().url("Invalid URI format"))
    .min(1, "At least one URI is required")
    .max(10, "Maximum 10 URIs allowed"),
});

// Full Dataset Schema (matches your API JSON format)
export const DatasetSchema = z.object({
  id: z
    .string()
    .min(1, "Dataset ID is required")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Dataset ID can only contain alphanumeric characters, hyphens, and underscores",
    ),
  type: z.literal("Dataset"),
  props: DatasetPropsSchema,
});

// =======================
// CLIENT VALIDATION
// =======================

// Client-side CSV file upload validation
export const ClientCSVUploadSchema = z.object({
  files: CSVFilesSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// Client-side single file validation
export const ClientSingleFileUploadSchema = z.object({
  file: CSVFileSchema,
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

// =======================
// SERVER VALIDATION
// =======================

// Server-side file upload validation
export const ServerFileUploadSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileSize: z
    .number()
    .min(1, "File size must be greater than 0")
    .max(50_000_000, "File size must be less than 50MB"),
  mimeType: z
    .string()
    .refine(
      (type) => type === "text/csv" || type === "application/csv",
      "File must be a CSV file",
    ),
  fileContent: z.string().min(1, "File content is required"),
});

// Server-side dataset creation schema
export const ServerCreateDatasetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  files: z
    .array(ServerFileUploadSchema)
    .min(1, "At least one file is required"),
  userId: z.string().min(1, "User ID is required"),
});

// CSV Processing validation
export const CSVProcessingSchema = z.object({
  content: z.string().min(1, "CSV content is required"),
  filename: z.string().min(1, "Filename is required"),
  maxRows: z.number().min(1).max(100000).default(10000),
  maxColumns: z.literal(2, { message: "CSV must have exactly 2 columns" }),
});

// =======================
// TRAINING GRAPH VALIDATION
// =======================

// Node validation for the training graph
export const TrainingNodeSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1, "Node ID is required"),
    type: z.literal("Dataset"),
    props: z.object({
      uris: z
        .array(z.string().url())
        .min(1, "At least one dataset URI is required"),
    }),
  }),
  z.object({
    id: z.string().min(1, "Node ID is required"),
    type: z.literal("BaseModel"),
    props: z.object({
      model_id: ModelIdSchema,
      quant: QuantizationSchema,
    }),
  }),
]);

// Edge validation for the training graph
export const TrainingEdgeSchema = z.object({
  from: z.string().min(1, "From node ID is required"),
  to: z.string().min(1, "To node ID is required"),
});

// Meta information for the training graph
export const TrainingMetaSchema = z.object({
  created_by: z.string().min(1, "Creator ID is required"),
  created_at: z.string().datetime("Invalid datetime format"),
  clerk_id: z.string().min(1, "Clerk ID is required"),
  jwt_token: z.string().min(1, "JWT token is required"),
});

// Complete training graph schema
export const TrainingGraphSchema = z.object({
  schema_version: z.literal(1),
  nodes: z.array(TrainingNodeSchema).min(1, "At least one node is required"),
  edges: z.array(TrainingEdgeSchema),
  meta: TrainingMetaSchema,
});

// Client-side training submission schema
export const ClientTrainingSubmissionSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  clerkId: z.string().min(1, "Clerk ID is required"),
  jwtToken: z.string().min(1, "JWT token is required"),
  datasetNode: z.object({
    id: z.string().min(1, "Dataset node ID is required"),
    title: z.string().min(1, "Dataset title is required"),
    description: z.string().optional(),
    datasetId: z.string().min(1, "Dataset ID is required"),
    storageId: z.string().min(1, "Storage ID is required"),
  }),
  modelNode: z.object({
    id: z.string().min(1, "Model node ID is required"),
    title: z.string().min(1, "Model title is required"),
    description: z.string().optional(),
    modelId: ModelIdSchema,
    quant: QuantizationSchema,
  }),
});

// Server action response schema
export const TrainingSubmissionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  projectId: z.string().optional(),
  jobId: z.string().optional(),
  redirectTo: z.string().optional(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});

// =======================
// TYPE INFERENCE
// =======================

// Infer types from schemas
export type CSVFile = z.infer<typeof CSVFileSchema>;
export type CSVFiles = z.infer<typeof CSVFilesSchema>;
export type ModelId = z.infer<typeof ModelIdSchema>;
export type Quantization = z.infer<typeof QuantizationSchema>;
export type ModelProps = z.infer<typeof ModelPropsSchema>;
export type BaseModel = z.infer<typeof BaseModelSchema>;
export type ClientModelSelection = z.infer<typeof ClientModelSelectionSchema>;
export type ServerCreateModel = z.infer<typeof ServerCreateModelSchema>;
export type CSVCell = z.infer<typeof CSVCellSchema>;
export type CSVRow = z.infer<typeof CSVRowSchema>;
export type CSVHeader = z.infer<typeof CSVHeaderSchema>;
export type ParsedCSV = z.infer<typeof ParsedCSVSchema>;
export type RawCSVData = z.infer<typeof RawCSVDataSchema>;
export type GenerateUploadUrl = z.infer<typeof GenerateUploadUrlSchema>;
export type FileUploadResponse = z.infer<typeof FileUploadResponseSchema>;
export type SaveDataset = z.infer<typeof SaveDatasetSchema>;
export type DatasetProps = z.infer<typeof DatasetPropsSchema>;
export type Dataset = z.infer<typeof DatasetSchema>;
export type ClientCSVUpload = z.infer<typeof ClientCSVUploadSchema>;
export type ClientSingleFileUpload = z.infer<
  typeof ClientSingleFileUploadSchema
>;
export type ServerFileUpload = z.infer<typeof ServerFileUploadSchema>;
export type ServerCreateDataset = z.infer<typeof ServerCreateDatasetSchema>;
export type CSVProcessing = z.infer<typeof CSVProcessingSchema>;
export type TrainingNode = z.infer<typeof TrainingNodeSchema>;
export type TrainingEdge = z.infer<typeof TrainingEdgeSchema>;
export type TrainingMeta = z.infer<typeof TrainingMetaSchema>;
export type TrainingGraph = z.infer<typeof TrainingGraphSchema>;
export type ClientTrainingSubmission = z.infer<
  typeof ClientTrainingSubmissionSchema
>;
export type TrainingSubmissionResponse = z.infer<
  typeof TrainingSubmissionResponseSchema
>;

// =======================
// VALIDATION UTILITIES
// =======================

// Validate CSV file on client-side
export const validateCSVFile = (file: File) => {
  const result = CSVFileSchema.safeParse(file);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

// Validate multiple CSV files
export const validateCSVFiles = (files: File[]) => {
  const result = CSVFilesSchema.safeParse(files);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

// Validate model selection on client-side
export const validateModelSelection = (data: unknown) => {
  const result = ClientModelSelectionSchema.safeParse(data);
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

// Validate base model API format
export const validateBaseModel = (data: unknown) => {
  const result = BaseModelSchema.safeParse(data);
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

// Validate raw CSV data structure
export const validateRawCSVData = (data: unknown) => {
  const result = RawCSVDataSchema.safeParse(data);
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

// Validate parsed CSV structure (after processing)
export const validateParsedCSV = (data: unknown) => {
  const result = ParsedCSVSchema.safeParse(data);
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

// Validate CSV headers (exactly 2 columns)
export const validateCSVHeaders = (headers: unknown) => {
  const result = CSVHeaderSchema.safeParse(headers);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => issue.message),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

// Validate single file upload
export const validateSingleFileUpload = (data: unknown) => {
  const result = ClientSingleFileUploadSchema.safeParse(data);
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

// Validate dataset JSON format
export const validateDataset = (data: unknown) => {
  const result = DatasetSchema.safeParse(data);
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

// Validate CSV processing parameters
export const validateCSVProcessing = (data: unknown) => {
  const result = CSVProcessingSchema.safeParse(data);
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

// Validate client training submission
export const validateClientTrainingSubmission = (data: unknown) => {
  const result = ClientTrainingSubmissionSchema.safeParse(data);
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

// Validate training graph
export const validateTrainingGraph = (data: unknown) => {
  const result = TrainingGraphSchema.safeParse(data);
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
