import { z } from "zod";

// Schema that matches the dataset table columns structure
export const DatasetTableRowSchema = z.object({
  id: z.string(),
  dataset: z.string(),
  size: z.string(),
  model: z.string(),
  date: z.string(),
});

export type DatasetTableRow = z.infer<typeof DatasetTableRowSchema>;

// Schema for the raw Convex dataset data
export const ConvexDatasetSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  originalFilename: z.string(),
  fileSize: z.number(),
  rowCount: z.number().optional(),
  columnCount: z.number().optional(),
  headers: z.array(z.string()).optional(),
  createdAt: z.number(),
  storageUrl: z.string().optional(),
});

export type ConvexDataset = z.infer<typeof ConvexDatasetSchema>;

// Utility function to format file sizes
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// Utility function to format dates
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Transform Convex dataset data to table row format
export const transformDatasetToTableRow = (
  dataset: ConvexDataset,
): DatasetTableRow => {
  return {
    id: dataset._id,
    dataset: dataset.title || dataset.originalFilename,
    size: formatFileSize(dataset.fileSize),
    model: "No Model", // Default since datasets aren't linked to specific models yet
    date: formatDate(dataset.createdAt),
  };
};

// Validate and transform array of datasets
export const transformDatasetsToTableRows = (
  datasets: ConvexDataset[],
): DatasetTableRow[] => {
  return datasets.map(transformDatasetToTableRow);
};

// Schema for sample dataset constants
export const SampleDatasetSchema = z.object({
  id: z.string().min(1, "ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  azureUrl: z.string().url("Invalid Azure URL"),
  file: z.string().min(1, "File name is required"),
  status: z.literal("success"),
  rowCount: z.number().positive("Row count must be positive"),
  columnCount: z.number().positive("Column count must be positive"),
  headers: z.array(z.string().min(1)).min(1, "At least one header is required"),
});

export type SampleDataset = z.infer<typeof SampleDatasetSchema>;

// Utility function to validate sample datasets array
export const validateSampleDatasets = (
  datasets: unknown[],
): SampleDataset[] => {
  return datasets.map((dataset, index) => {
    const result = SampleDatasetSchema.safeParse(dataset);
    if (!result.success) {
      throw new Error(
        `Invalid sample dataset at index ${index}: ${result.error.message}`,
      );
    }
    return result.data;
  });
};
