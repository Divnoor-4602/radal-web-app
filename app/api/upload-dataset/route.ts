import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { Id } from "@/convex/_generated/dataModel";
import { randomUUID } from "crypto";
import {
  validateCSVHeaders,
  validateParsedCSV,
} from "@/lib/validations/csv.schema";
import {
  DatasetUploadSchema,
  StorageResultSchema,
} from "@/lib/validations/storage.schema";
import { createStorageService } from "@/lib/azure-storage";
import { RateLimiterMemory } from "rate-limiter-flexible";
import {
  isNumericIndexColumn,
  preprocessText,
  normalizeEmptyValue,
} from "./utils";

// Create Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Create Azure storage service
const storageService = createStorageService();

// Rate limiter: 20 uploads per user per hour
const uploadRateLimiter = new RateLimiterMemory({
  points: 20, // 20 uploads
  duration: 60 * 60, // per hour
});

// Helper function to convert async iterator to stream
function iteratorToStream(iterator: AsyncGenerator<Uint8Array, void, unknown>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

const encoder = new TextEncoder();

// Helper function to create streaming state update
function createStateUpdate(
  state: string,
  message?: string,
  error?: string,
  data?: Record<string, unknown>,
) {
  const update = {
    state,
    message,
    error,
    data,
    timestamp: Date.now(),
  };

  console.log("State update:", state, message || "");

  return encoder.encode(`data: ${JSON.stringify(update)}\n\n`);
}

export async function POST(request: NextRequest) {
  // Create async generator for streaming updates
  async function* uploadProcessor() {
    try {
      // get the currently logged in user from the clerk middleware session
      const { userId: clerkUserId } = await auth();

      // if the user is not authenticated, return a 401 error
      if (!clerkUserId) {
        yield createStateUpdate(
          "error",
          undefined,
          "Unauthorized - User is not authenticated",
        );
        return;
      }

      // get the user from the convex database using the Clerk ID
      const convexUser = await convex.query(api.users.getByClerkId, {
        clerkId: clerkUserId,
      });
      if (!convexUser) {
        yield createStateUpdate(
          "error",
          undefined,
          "User not found in database",
        );
        return;
      }

      // Send initial uploading state
      yield createStateUpdate("uploading", "Starting upload process...");

      // Send validating state
      yield createStateUpdate(
        "validating",
        "Validating request and permissions...",
      );

      // Parse the form data
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const projectIdStr = formData.get("projectId") as string;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;

      if (!file || !projectIdStr || !title) {
        yield createStateUpdate(
          "error",
          undefined,
          "Missing required fields: file, projectId, title",
        );
        return;
      }

      // Cast project ID to proper type
      const projectId = projectIdStr as Id<"projects">;

      // Confirm that the project is owned by the requesting user
      const project = await convex.query(
        api.projects.getProjectByIdWithClerkId,
        {
          projectId,
          clerkId: clerkUserId,
        },
      );

      if (!project) {
        yield createStateUpdate(
          "error",
          undefined,
          "Project not found or access denied",
        );
        return;
      }

      // --- RATE LIMITER: 20 uploads per user per hour ---
      try {
        await uploadRateLimiter.consume(clerkUserId);
      } catch {
        yield createStateUpdate(
          "error",
          undefined,
          "Too many uploads. Please wait before uploading more datasets.",
        );
        return;
      }

      // Validate file type
      if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
        yield createStateUpdate(
          "error",
          undefined,
          "Invalid file type. Only CSV files are allowed.",
        );
        return;
      }

      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        yield createStateUpdate(
          "error",
          undefined,
          "File size exceeds 50MB limit",
        );
        return;
      }

      // Transition to cleaning state
      yield createStateUpdate(
        "cleaning",
        "Processing and cleaning CSV data...",
      );

      // Parse and validate CSV content
      const fileText = await file.text();
      const rows: string[][] = [];
      let parseError: string | null = null;

      // Parse CSV
      const parser = parse({
        columns: false,
        skip_empty_lines: true,
        trim: true,
      });

      parser.on("readable", function () {
        let record;
        while ((record = parser.read()) !== null) {
          rows.push(record);
        }
      });

      parser.on("error", function (err) {
        parseError = err.message;
      });

      // Convert string to stream for parser
      const stream = Readable.from([fileText]);
      stream.pipe(parser);

      // Wait for parsing to complete
      await new Promise((resolve, reject) => {
        parser.on("end", resolve);
        parser.on("error", reject);
      });

      if (parseError) {
        yield createStateUpdate(
          "error",
          undefined,
          `CSV parsing error: ${parseError}`,
        );
        return;
      }

      // Validate basic CSV structure
      if (rows.length < 2) {
        yield createStateUpdate(
          "error",
          undefined,
          "CSV must have at least a header row and one data row",
        );
        return;
      }

      const originalHeaders = rows[0];
      const originalDataRows = rows.slice(1);

      // Identify and remove numeric index columns
      const columnsToKeep: number[] = [];
      const headersToKeep: string[] = [];

      for (let colIndex = 0; colIndex < originalHeaders.length; colIndex++) {
        const header = originalHeaders[colIndex];
        const columnData = originalDataRows.map((row) => row[colIndex] || "");

        // Check if this is a numeric index column
        if (!isNumericIndexColumn(columnData, header)) {
          columnsToKeep.push(colIndex);
          headersToKeep.push(header);
        }
      }

      // Transition to normalising state
      yield createStateUpdate(
        "normalising",
        "Normalizing and preprocessing data...",
      );

      // Clean and preprocess data
      const cleanedRows = originalDataRows.map((row) => {
        // Extract only the columns we want to keep
        const filteredRow = columnsToKeep.map(
          (colIndex) => row[colIndex] || "",
        );

        // Ensure row has the same number of columns as filtered headers
        const normalizedRow = [...filteredRow];
        while (normalizedRow.length < headersToKeep.length) {
          normalizedRow.push("");
        }

        // Apply text preprocessing to each cell
        return normalizedRow
          .slice(0, headersToKeep.length)
          .map((cell) => normalizeEmptyValue(cell));
      });

      // Also clean the headers
      const cleanedHeaders = headersToKeep.map((header) =>
        preprocessText(header),
      );

      // Validate cleaned headers (must be exactly 2 columns)
      const headerValidation = validateCSVHeaders(cleanedHeaders);
      if (!headerValidation.isValid) {
        yield createStateUpdate(
          "error",
          undefined,
          `Invalid column structure: ${headerValidation.errors?.join(", ") || "Header validation failed"}. Your CSV must have exactly 2 columns after removing index columns.`,
        );
        return;
      }

      // Validate complete parsed CSV structure
      const parsedCSVData = {
        headers: cleanedHeaders,
        rows: cleanedRows,
        totalRows: cleanedRows.length,
        totalColumns: cleanedHeaders.length,
      };

      const csvValidation = validateParsedCSV(parsedCSVData);
      if (!csvValidation.isValid) {
        yield createStateUpdate(
          "error",
          undefined,
          `CSV validation failed: ${csvValidation.errors?.join(", ") || "Validation failed"}`,
        );
        return;
      }

      // Transition to transforming state
      yield createStateUpdate(
        "transforming",
        "Applying final transformations...",
      );

      // Additional business logic validation
      if (cleanedHeaders.length !== 2) {
        yield createStateUpdate(
          "error",
          undefined,
          `Invalid column count: Expected exactly 2 columns, but found ${cleanedHeaders.length}. Columns found: ${cleanedHeaders.join(", ")}`,
        );
        return;
      }

      // Validate each row has exactly 2 columns
      const invalidRows = cleanedRows.filter((row) => row.length !== 2);
      if (invalidRows.length > 0) {
        yield createStateUpdate(
          "error",
          undefined,
          `Found ${invalidRows.length} rows with incorrect column count. All rows must have exactly 2 columns.`,
        );
        return;
      }

      // Generate unique dataset ID
      const datasetId = randomUUID();

      // Create cleaned CSV content
      const cleanedCsv = [
        cleanedHeaders.join(","),
        ...cleanedRows.map((row) =>
          row
            .map((cell) =>
              cell.includes(",") || cell.includes('"') || cell.includes("\n")
                ? `"${cell.replace(/"/g, '""')}"`
                : cell,
            )
            .join(","),
        ),
      ].join("\n");

      // Transition to saving state
      yield createStateUpdate("saving", "Saving dataset to storage...");

      // Prepare Azure storage upload data
      const datasetUploadData = DatasetUploadSchema.parse({
        userId: convexUser._id, // Use authenticated user ID
        projectId,
        datasetId,
        filename: file.name,
        file: Buffer.from(cleanedCsv, "utf8"),
        metadata: {
          title,
          description,
          rows: cleanedRows.length,
          columns: cleanedHeaders.length,
          headers: cleanedHeaders,
        },
      });

      // Upload to Azure Blob Storage
      const storageResult =
        await storageService.uploadDataset(datasetUploadData);

      // Validate storage result
      const validatedStorageResult = StorageResultSchema.parse(storageResult);

      // --- Begin atomicity block ---
      let convexDatasetId;
      try {
        // Save dataset metadata to Convex
        convexDatasetId = await convex.mutation(api.datasets.saveDataset, {
          projectId,
          storageId: validatedStorageResult.blobPath, // Azure blob path
          azureUrl: validatedStorageResult.url, // Public Azure URL
          title,
          description,
          originalFilename: file.name,
          fileSize: Buffer.byteLength(cleanedCsv, "utf8"),
          mimeType: "text/csv",
          userId: convexUser._id, // Use authenticated user ID
        });

        // Update the dataset with processed information
        await convex.mutation(api.datasets.updateDatasetStats, {
          datasetId: convexDatasetId,
          rows: cleanedRows.length,
          columns: cleanedHeaders.length,
          headers: cleanedHeaders,
          userId: convexUser._id, // Use authenticated user ID
        });
      } catch {
        // Cleanup: delete the uploaded blob if Convex mutation fails
        try {
          await storageService.deleteDataset(
            convexUser._id,
            projectId,
            datasetId,
          );
        } catch (cleanupErr) {
          // Optionally log cleanup failure
          console.error(
            "Failed to cleanup Azure blob after Convex error:",
            cleanupErr,
          );
        }
        yield createStateUpdate(
          "error",
          undefined,
          "Internal server error during dataset registration. Upload was rolled back.",
        );
        return;
      }
      // --- End atomicity block ---

      // Calculate preprocessing summary
      const removedColumns = originalHeaders.length - cleanedHeaders.length;
      const processingStats = {
        originalColumns: originalHeaders.length,
        finalColumns: cleanedHeaders.length,
        removedColumns,
        removedIndexColumns: removedColumns > 0,
        totalRows: cleanedRows.length,
        validation: {
          structureValid: true,
          columnCountValid: cleanedHeaders.length === 2,
          headerNamesValid: cleanedHeaders.every((h) => h.trim().length > 0),
          uniqueHeaders: new Set(cleanedHeaders).size === cleanedHeaders.length,
        },
      };

      // Send final success state with data
      const uploadSuccessData = {
        datasetId: convexDatasetId,
        storageId: validatedStorageResult.blobPath,
        azureUrl: validatedStorageResult.url,
        stats: {
          rows: cleanedRows.length,
          columns: cleanedHeaders.length,
          headers: cleanedHeaders,
        },
        preprocessing: processingStats,
        validation: {
          message: "CSV structure validated successfully",
          columnCount: cleanedHeaders.length,
          expectedColumns: 2,
          headers: cleanedHeaders,
        },
      };

      yield createStateUpdate(
        "uploaded",
        "Dataset uploaded successfully!",
        undefined,
        uploadSuccessData,
      );
    } catch (error) {
      console.error("Upload error:", error);

      // Handle specific Azure storage errors
      if (error instanceof Error && error.message.includes("Azure")) {
        yield createStateUpdate(
          "error",
          undefined,
          "Azure storage error: " + error.message,
        );
      } else {
        yield createStateUpdate("error", undefined, "Internal server error");
      }
    }
  }

  // Return the streaming response directly to the client
  const iterator = uploadProcessor();
  const stream = iteratorToStream(iterator);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
