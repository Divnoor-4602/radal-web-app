import {
  BlobServiceClient,
  ContainerClient,
  BlockBlobClient,
  BlobSASPermissions,
} from "@azure/storage-blob";
import {
  DatasetUpload,
  StorageResult,
  DatasetMetadata,
  StorageConfig,
  BlobInfo,
  BlobType,
} from "@/lib/validations/storage.schema";

export class AzureBlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private containerName: string;

  constructor(config: StorageConfig) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      config.connectionString,
    );
    this.containerName = config.containerName;
    this.containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
  }

  /**
   * Generate blob path following the folder structure:
   * users/{userId}/projects/{projectId}/datasets/{datasetId}/{sanitizedFilename}_{timestamp}.{ext}
   */
  private generateBlobPath(
    userId: string,
    projectId: string,
    datasetId: string,
    type: BlobType,
    extension?: string,
    originalFilename?: string,
  ): string {
    if (type === "METADATA") {
      return `users/${userId}/projects/${projectId}/datasets/${datasetId}/metadata.json`;
    }

    // For data files, create unique filename with original name + timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace(/T/, "_")
      .slice(0, 19);

    if (originalFilename) {
      // Sanitize the original filename (remove special characters, keep only alphanumeric, dots, hyphens, underscores)
      const sanitizedName = originalFilename
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[^a-zA-Z0-9._-]/g, "_") // Replace special chars with underscore
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/^_|_$/g, ""); // Remove leading/trailing underscores

      const ext = extension || "csv";
      return `users/${userId}/projects/${projectId}/datasets/${datasetId}/${sanitizedName}_${timestamp}.${ext}`;
    }

    // Fallback to type-based naming with timestamp
    const ext = extension || "csv";
    return `users/${userId}/projects/${projectId}/datasets/${datasetId}/${type}_${timestamp}.${ext}`;
  }

  /**
   * Upload a dataset file to Azure Blob Storage
   */
  async uploadDataset(upload: DatasetUpload): Promise<StorageResult> {
    try {
      // Ensure container exists with public read access
      await this.containerClient.createIfNotExists({
        access: "blob", // Makes blobs publicly readable
      });

      // Generate blob path
      const fileExtension = upload.filename.split(".").pop() || "csv";
      const blobPath = this.generateBlobPath(
        upload.userId,
        upload.projectId,
        upload.datasetId,
        "ORIGINAL",
        fileExtension,
        upload.filename,
      );

      // Get blob client
      const blockBlobClient: BlockBlobClient =
        this.containerClient.getBlockBlobClient(blobPath);

      // Prepare metadata
      const metadata: DatasetMetadata = {
        originalFilename: upload.filename,
        fileSize:
          upload.file instanceof File ? upload.file.size : upload.file.length,
        mimeType: upload.file instanceof File ? upload.file.type : "text/csv",
        uploadedAt: new Date().toISOString(),
        userId: upload.userId,
        projectId: upload.projectId,
        datasetId: upload.datasetId,
        ...upload.metadata,
      };

      // Upload file
      if (upload.file instanceof File) {
        const arrayBuffer = await upload.file.arrayBuffer();
        await blockBlobClient.uploadData(arrayBuffer, {
          blobHTTPHeaders: {
            blobContentType: upload.file.type || "text/csv",
          },
          metadata: this.flattenMetadata(metadata),
        });
      } else {
        await blockBlobClient.uploadData(upload.file, {
          blobHTTPHeaders: {
            blobContentType: "text/csv",
          },
          metadata: this.flattenMetadata(metadata),
        });
      }

      // Also upload metadata as separate JSON file
      await this.uploadMetadata(
        upload.userId,
        upload.projectId,
        upload.datasetId,
        metadata,
      );

      return {
        url: blockBlobClient.url, // This is now a public URL
        blobPath,
        metadata,
        uploadedAt: metadata.uploadedAt,
      };
    } catch (error) {
      console.error("Error uploading to Azure Blob Storage:", error);
      throw new Error(
        `Failed to upload dataset: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Upload metadata as a separate JSON file
   */
  async uploadMetadata(
    userId: string,
    projectId: string,
    datasetId: string,
    metadata: DatasetMetadata,
  ): Promise<void> {
    const metadataBlobPath = this.generateBlobPath(
      userId,
      projectId,
      datasetId,
      "METADATA",
    );

    const metadataBlobClient =
      this.containerClient.getBlockBlobClient(metadataBlobPath);

    await metadataBlobClient.uploadData(
      Buffer.from(JSON.stringify(metadata, null, 2)),
      {
        blobHTTPHeaders: {
          blobContentType: "application/json",
        },
      },
    );
  }

  /**
   * Download a dataset file from Azure Blob Storage
   */
  async downloadDataset(blobPath: string): Promise<Buffer> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
      const downloadResponse = await blockBlobClient.download(0);

      if (!downloadResponse.readableStreamBody) {
        throw new Error("Failed to download blob: No readable stream");
      }

      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody) {
        chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error) {
      console.error("Error downloading from Azure Blob Storage:", error);
      throw new Error(
        `Failed to download dataset: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Delete a dataset and all its associated files
   */
  async deleteDataset(
    userId: string,
    projectId: string,
    datasetId: string,
  ): Promise<void> {
    try {
      const basePath = `users/${userId}/projects/${projectId}/datasets/${datasetId}/`;

      // List all blobs with this prefix
      const blobs = this.containerClient.listBlobsFlat({ prefix: basePath });

      // Delete all blobs
      for await (const blob of blobs) {
        await this.containerClient.deleteBlob(blob.name);
      }
    } catch (error) {
      console.error("Error deleting from Azure Blob Storage:", error);
      throw new Error(
        `Failed to delete dataset: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get a direct public URL for a dataset (no SAS token needed)
   */
  getPublicDatasetUrl(blobPath: string): string {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);
    return blockBlobClient.url;
  }

  /**
   * Get a public URL for a dataset (with SAS token for temporary access)
   * @deprecated Use getPublicDatasetUrl() instead for public containers
   */
  async getDatasetUrl(
    blobPath: string,
    expiresInMinutes: number = 60,
  ): Promise<string> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobPath);

      // Generate SAS URL for temporary access
      const permissions = new BlobSASPermissions();
      permissions.read = true;

      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions,
        expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      });

      return sasUrl;
    } catch (error) {
      console.error("Error generating URL for Azure Blob:", error);
      throw new Error(
        `Failed to generate URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get dataset metadata
   */
  async getDatasetMetadata(
    userId: string,
    projectId: string,
    datasetId: string,
  ): Promise<DatasetMetadata | null> {
    try {
      const metadataBlobPath = this.generateBlobPath(
        userId,
        projectId,
        datasetId,
        "METADATA",
      );
      const buffer = await this.downloadDataset(metadataBlobPath);
      return JSON.parse(buffer.toString()) as DatasetMetadata;
    } catch (error) {
      console.error("Error getting metadata:", error);
      return null;
    }
  }

  /**
   * List all datasets for a project
   */
  async listProjectDatasets(
    userId: string,
    projectId: string,
  ): Promise<BlobInfo[]> {
    try {
      const prefix = `users/${userId}/projects/${projectId}/datasets/`;
      const blobs = this.containerClient.listBlobsFlat({
        prefix,
        includeMetadata: true,
      });

      const blobInfos: BlobInfo[] = [];
      for await (const blob of blobs) {
        // Exclude metadata files (which end with metadata.json)
        if (
          !blob.name.endsWith("/metadata.json") &&
          !blob.name.includes("/metadata.")
        ) {
          const blockBlobClient = this.containerClient.getBlockBlobClient(
            blob.name,
          );
          blobInfos.push({
            name: blob.name,
            url: blockBlobClient.url,
            lastModified: blob.properties.lastModified || new Date(),
            contentLength: blob.properties.contentLength || 0,
            contentType: blob.properties.contentType || "text/csv",
            metadata: blob.metadata || {},
          });
        }
      }

      return blobInfos;
    } catch (error) {
      console.error("Error listing project datasets:", error);
      throw new Error(
        `Failed to list datasets: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Check if a dataset exists (checks if any data files exist in the dataset folder)
   */
  async datasetExists(
    userId: string,
    projectId: string,
    datasetId: string,
  ): Promise<boolean> {
    try {
      const prefix = `users/${userId}/projects/${projectId}/datasets/${datasetId}/`;
      const blobs = this.containerClient.listBlobsFlat({ prefix });

      // Check if any non-metadata files exist
      for await (const blob of blobs) {
        if (
          !blob.name.endsWith("/metadata.json") &&
          !blob.name.includes("/metadata.")
        ) {
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Helper method to flatten metadata for Azure blob storage
   * Azure metadata values must be strings
   */
  private flattenMetadata(
    metadata: Record<string, unknown>,
  ): Record<string, string> {
    const flattened: Record<string, string> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === "object" && value !== null) {
        flattened[key] = JSON.stringify(value);
      } else {
        flattened[key] = String(value);
      }
    }

    return flattened;
  }
}
