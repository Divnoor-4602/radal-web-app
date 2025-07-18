import { AzureBlobStorageService } from "./azure-blob";
import { StorageConfig } from "@/lib/validations/storage.schema";

// Export types and classes
export * from "@/lib/validations/storage.schema";
export * from "./azure-blob";

// Create a configured storage service instance
export const createStorageService = (
  config?: Partial<StorageConfig>,
): AzureBlobStorageService => {
  const defaultConfig: StorageConfig = {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || "datasets",
  };

  const finalConfig = { ...defaultConfig, ...config };

  if (!finalConfig.connectionString) {
    throw new Error(
      "Azure Storage connection string is required. Set AZURE_STORAGE_CONNECTION_STRING environment variable.",
    );
  }

  return new AzureBlobStorageService(finalConfig);
};

// Default instance for easy use
export const storageService = createStorageService();
