import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { parse } from "csv-parse";
import { Readable } from "stream";
import { Id } from "@/convex/_generated/dataModel";
import {
  validateRawCSVData,
  validateParsedCSV,
  validateCSVHeaders,
} from "@/lib/validations/project.schema";

// Create Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper function to detect if a column is a numeric index column
function isNumericIndexColumn(
  columnData: string[],
  headerName: string,
): boolean {
  // Check if header suggests it's an index (common patterns)
  const indexHeaders = /^(index|id|#|no\.?|num|row|unnamed.*0?)$/i;
  if (indexHeaders.test(headerName.trim())) {
    return true;
  }

  // Check if all values are sequential numbers starting from 0 or 1
  const numericValues = columnData
    .filter((cell) => cell.trim() !== "") // Ignore empty cells
    .map((cell) => {
      const num = parseInt(cell.trim());
      return isNaN(num) ? null : num;
    })
    .filter((num) => num !== null) as number[];

  if (numericValues.length === 0) return false;

  // Check if it's a sequential series starting from 0 or 1
  const sortedValues = [...numericValues].sort((a, b) => a - b);
  const isSequential = sortedValues.every(
    (val, idx) => val === sortedValues[0] + idx,
  );

  return isSequential && (sortedValues[0] === 0 || sortedValues[0] === 1);
}

// Helper function for comprehensive text preprocessing
function preprocessText(text: string): string {
  if (typeof text !== "string") {
    return String(text || "");
  }

  return (
    text
      // Remove leading/trailing whitespace
      .trim()
      // Replace multiple whitespace with single space
      .replace(/\s+/g, " ")
      // Remove line breaks and replace with space
      .replace(/\r?\n|\r/g, " ")
      // Remove tab characters
      .replace(/\t/g, " ")
      // Remove extra spaces after preprocessing
      .replace(/\s+/g, " ")
      // Handle common null representations
      .replace(
        /^(null|NULL|None|NONE|n\/a|N\/A|na|NA|undefined|UNDEFINED)$/i,
        "",
      )
      // Remove leading/trailing quotes if they wrap the entire string
      .replace(/^["'](.*)["']$/, "$1")
      // Final trim
      .trim()
  );
}

// Helper function to normalize empty values
function normalizeEmptyValue(value: string): string {
  const processed = preprocessText(value);
  // Convert various empty representations to empty string
  if (
    processed === "" ||
    processed === "-" ||
    processed === "—" ||
    processed === "–"
  ) {
    return "";
  }
  return processed;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectIdStr = formData.get("projectId") as string;
    const userIdStr = formData.get("userId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;

    if (!file || !projectIdStr || !userIdStr || !title) {
      return NextResponse.json(
        { error: "Missing required fields: file, projectId, userId, title" },
        { status: 400 },
      );
    }

    // Cast IDs to proper types
    const projectId = projectIdStr as Id<"projects">;
    const userId = userIdStr as Id<"users">;

    // Validate file type
    if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Invalid file type. Only CSV files are allowed." },
        { status: 400 },
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 },
      );
    }

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
      return NextResponse.json(
        { error: `CSV parsing error: ${parseError}` },
        { status: 400 },
      );
    }

    // Validate raw CSV data structure
    const rawDataValidation = validateRawCSVData(rows);
    if (!rawDataValidation.isValid) {
      return NextResponse.json(
        {
          error: "Invalid CSV structure",
          details:
            rawDataValidation.errors?.map((e) => e.message).join(", ") ||
            "Unknown validation error",
        },
        { status: 400 },
      );
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

    // Clean and preprocess data
    const cleanedRows = originalDataRows.map((row) => {
      // Extract only the columns we want to keep
      const filteredRow = columnsToKeep.map((colIndex) => row[colIndex] || "");

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
      return NextResponse.json(
        {
          error: "Invalid column structure",
          details:
            headerValidation.errors?.join(", ") || "Header validation failed",
          hint: "Your CSV must have exactly 2 columns after removing index columns",
        },
        { status: 400 },
      );
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
      return NextResponse.json(
        {
          error: "CSV validation failed",
          details:
            csvValidation.errors
              ?.map((e) => `${e.field}: ${e.message}`)
              .join(", ") || "Validation failed",
        },
        { status: 400 },
      );
    }

    // Additional business logic validation
    if (cleanedHeaders.length !== 2) {
      return NextResponse.json(
        {
          error: `Invalid column count: Expected exactly 2 columns, but found ${cleanedHeaders.length}`,
          details: `Columns found: ${cleanedHeaders.join(", ")}`,
          originalColumns: originalHeaders.length,
          removedColumns: originalHeaders.length - cleanedHeaders.length,
        },
        { status: 400 },
      );
    }

    // Validate each row has exactly 2 columns
    const invalidRows = cleanedRows.filter((row) => row.length !== 2);
    if (invalidRows.length > 0) {
      return NextResponse.json(
        {
          error: `Found ${invalidRows.length} rows with incorrect column count`,
          details: "All rows must have exactly 2 columns",
        },
        { status: 400 },
      );
    }

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

    // Generate upload URL from Convex
    const uploadUrl = await convex.mutation(api.datasets.generateUploadUrl, {});

    // Upload the cleaned CSV to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/csv",
      },
      body: cleanedCsv,
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 },
      );
    }

    const { storageId } = await uploadResponse.json();

    // Save dataset metadata to Convex
    const datasetId = await convex.mutation(api.datasets.saveDataset, {
      projectId,
      storageId,
      title,
      description,
      originalFilename: file.name,
      fileSize: Buffer.byteLength(cleanedCsv, "utf8"),
      mimeType: "text/csv",
      userId,
    });

    // Update the dataset with processed information
    await convex.mutation(api.datasets.updateDatasetStats, {
      datasetId,
      rows: cleanedRows.length,
      columns: cleanedHeaders.length,
      headers: cleanedHeaders,
      userId,
    });

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

    return NextResponse.json({
      success: true,
      datasetId,
      storageId,
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
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
