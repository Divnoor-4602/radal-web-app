import { z } from "zod";

// ===== ENUMS =====
export const BlobTypeSchema = z.enum(["METADATA", "ORIGINAL"]);
export type BlobType = z.infer<typeof BlobTypeSchema>;

// ===== STORAGE CONFIG =====
export const StorageConfigSchema = z.object({
  connectionString: z
    .string()
    .min(1, "Azure Storage connection string is required"),
  containerName: z
    .string()
    .min(1, "Container name is required")
    .default("datasets"),
});
export type StorageConfig = z.infer<typeof StorageConfigSchema>;

// ===== DATASET METADATA =====
export const DatasetMetadataSchema = z.object({
  originalFilename: z.string().min(1, "Original filename is required"),
  fileSize: z.number().positive("File size must be positive"),
  mimeType: z.string().min(1, "MIME type is required"),
  uploadedAt: z.string().datetime("Invalid upload date format"),
  userId: z.string().min(1, "User ID is required"),
  projectId: z.string().min(1, "Project ID is required"),
  datasetId: z.string().min(1, "Dataset ID is required"),
  // Additional metadata fields (optional)
  title: z.string().optional(),
  description: z.string().optional(),
  rows: z.number().optional(),
  columns: z.number().optional(),
  headers: z.array(z.string()).optional(),
});
export type DatasetMetadata = z.infer<typeof DatasetMetadataSchema>;

// ===== DATASET UPLOAD =====
export const DatasetUploadSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  projectId: z.string().min(1, "Project ID is required"),
  datasetId: z.string().min(1, "Dataset ID is required"),
  filename: z.string().min(1, "Filename is required"),
  file: z.union([
    z.instanceof(File),
    z.instanceof(Buffer),
    z.string().transform((str) => Buffer.from(str, "utf8")),
  ]),
  metadata: z.record(z.unknown()).optional().default({}),
});
export type DatasetUpload = z.infer<typeof DatasetUploadSchema>;

// ===== STORAGE RESULT =====
export const StorageResultSchema = z.object({
  url: z.string().url("Invalid URL format"),
  blobPath: z.string().min(1, "Blob path is required"),
  metadata: DatasetMetadataSchema,
  uploadedAt: z.string().datetime("Invalid upload date format"),
});
export type StorageResult = z.infer<typeof StorageResultSchema>;

// ===== BLOB INFO =====
export const BlobInfoSchema = z.object({
  name: z.string().min(1, "Blob name is required"),
  url: z.string().url("Invalid URL format"),
  lastModified: z.date(),
  contentLength: z.number().nonnegative("Content length must be non-negative"),
  contentType: z.string().min(1, "Content type is required"),
  metadata: z.record(z.string()).default({}),
});
export type BlobInfo = z.infer<typeof BlobInfoSchema>;

// ===== VALIDATION HELPERS =====

// Validate Azure connection string format
export const validateAzureConnectionString = (
  connectionString: string,
): boolean => {
  const requiredKeys = [
    "DefaultEndpointsProtocol",
    "AccountName",
    "AccountKey",
  ];
  return requiredKeys.every((key) => connectionString.includes(key));
};

// Validate blob name format (Azure naming rules)
export const validateBlobName = (name: string): boolean => {
  // Azure blob names must:
  // - Be 1-1024 characters long
  // - Not end with dot or forward slash
  // - Not contain consecutive forward slashes
  // - Not contain certain characters
  const invalidChars = /[\\<>:"|?*\x00-\x1f]/;
  return (
    name.length >= 1 &&
    name.length <= 1024 &&
    !name.endsWith(".") &&
    !name.endsWith("/") &&
    !name.includes("//") &&
    !invalidChars.test(name)
  );
};

// Validate container name format (Azure naming rules)
export const validateContainerName = (name: string): boolean => {
  // Azure container names must:
  // - Be 3-63 characters long
  // - Start with letter or number
  // - Contain only lowercase letters, numbers, and hyphens
  // - Not have consecutive hyphens
  // - Not start or end with hyphen
  const containerRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return (
    name.length >= 3 &&
    name.length <= 63 &&
    containerRegex.test(name) &&
    !name.includes("--")
  );
};

// Enhanced storage config validation with Azure-specific rules
export const StorageConfigValidationSchema = StorageConfigSchema.refine(
  (config) => validateAzureConnectionString(config.connectionString),
  {
    message: "Invalid Azure Storage connection string format",
    path: ["connectionString"],
  },
).refine((config) => validateContainerName(config.containerName), {
  message: "Invalid Azure container name format",
  path: ["containerName"],
});

// File upload validation
export const FileUploadValidationSchema = z
  .object({
    file: z.union([z.instanceof(File), z.instanceof(Buffer)]),
    maxSizeBytes: z
      .number()
      .positive()
      .default(50 * 1024 * 1024), // 50MB default
    allowedMimeTypes: z
      .array(z.string())
      .default(["text/csv", "application/csv"]),
  })
  .refine(
    (data) => {
      if (data.file instanceof File) {
        return data.file.size <= data.maxSizeBytes;
      } else if (data.file instanceof Buffer) {
        return data.file.length <= data.maxSizeBytes;
      }
      return false;
    },
    {
      message: "File size exceeds maximum allowed size",
      path: ["file"],
    },
  )
  .refine(
    (data) => {
      if (data.file instanceof File) {
        return data.allowedMimeTypes.includes(data.file.type);
      }
      return true; // Skip MIME type check for Buffer
    },
    {
      message: "File type not allowed",
      path: ["file"],
    },
  );

// Path generation validation
export const BlobPathGenerationSchema = z
  .object({
    userId: z.string().min(1, "User ID is required"),
    projectId: z.string().min(1, "Project ID is required"),
    datasetId: z.string().min(1, "Dataset ID is required"),
    type: BlobTypeSchema,
    extension: z.string().optional(),
    originalFilename: z.string().optional(),
  })
  .refine(
    (data) => {
      // If type is not METADATA, we need either extension or originalFilename
      if (data.type !== "METADATA") {
        return data.extension || data.originalFilename;
      }
      return true;
    },
    {
      message: "Extension or original filename required for non-metadata blobs",
      path: ["extension", "originalFilename"],
    },
  );

// Error response schema for API
export const StorageErrorSchema = z.object({
  error: z.string().min(1, "Error message is required"),
  code: z.string().optional(),
  details: z.unknown().optional(),
});
export type StorageError = z.infer<typeof StorageErrorSchema>;

// Success response schema for API
export const StorageSuccessSchema = z.object({
  success: z.boolean().default(true),
  data: z.unknown(),
  message: z.string().optional(),
});
export type StorageSuccess = z.infer<typeof StorageSuccessSchema>;
