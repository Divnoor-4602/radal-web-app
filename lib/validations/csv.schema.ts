import { z } from "zod";

// File validation schemas
export const CSVFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "text/csv" || file.name.endsWith(".csv"), {
    message: "File must be a CSV file",
  })
  .refine((file) => file.size > 0, {
    message: "File cannot be empty",
  });

// Content validation schemas
// Validate individual CSV cell content - allows empty strings
export const CSVCellSchema = z
  .string()
  .transform((val) => val.trim())
  // Explicitly allow empty strings after trimming
  .refine(() => true, "Cell values must be valid strings");

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

// Validate CSV row structure (exactly 2 columns, allows empty cells)
export const CSVRowSchema = z
  .array(CSVCellSchema)
  .length(2, "Each row must have exactly 2 columns")
  .refine(
    (row) => row.every((cell) => typeof cell === "string"),
    "All cell values must be strings",
  )
  // Explicitly allow rows where one or both columns can be empty
  .refine(() => true, "Row validation passed");

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

// Utility functions for CSV processing
// Parse CSV content into structured data
const parseCSVContent = (
  content: string,
): {
  headers: string[];
  rows: string[][];
  totalRows: number;
  totalColumns: number;
} => {
  const lines = content.split("\n").filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    throw new Error("File is empty");
  }

  const headers = lines[0].split(",").map((col) => col.trim());
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    // Ensure each row has exactly 2 columns, pad with empty string if needed
    while (cells.length < 2) {
      cells.push("");
    }
    // Only take first 2 columns if more than 2 exist
    return cells.slice(0, 2);
  });

  return {
    headers,
    rows,
    totalRows: rows.length,
    totalColumns: headers.length,
  };
};

// Read file content as text
const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };

    reader.readAsText(file);
  });
};

// Validation functions
// Validate CSV file (file properties only)
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

// Validate parsed CSV content
export const validateParsedCSV = (data: unknown) => {
  const result = ParsedCSVSchema.safeParse(data);
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

// Comprehensive validation: file + content
export const validateCSVFileAndContent = async (file: File) => {
  // First validate file properties
  const fileValidation = validateCSVFile(file);
  if (!fileValidation.isValid) {
    return {
      isValid: false,
      errors: fileValidation.errors,
    };
  }

  try {
    // Read and parse file content
    const content = await readFileContent(file);
    const parsedContent = parseCSVContent(content);

    // Validate parsed content structure
    const contentValidation = validateParsedCSV(parsedContent);
    if (!contentValidation.isValid) {
      return {
        isValid: false,
        errors: contentValidation.errors,
      };
    }

    return {
      isValid: true,
      data: {
        file: fileValidation.data,
        content: contentValidation.data,
      },
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        error instanceof Error ? error.message : "Unknown error occurred",
      ],
    };
  }
};

// Type inference
export type CSVFile = z.infer<typeof CSVFileSchema>;
export type CSVCell = z.infer<typeof CSVCellSchema>;
export type CSVHeader = z.infer<typeof CSVHeaderSchema>;
export type CSVRow = z.infer<typeof CSVRowSchema>;
export type ParsedCSV = z.infer<typeof ParsedCSVSchema>;

// Validation result types
export type ValidationResult<T> = {
  isValid: boolean;
  errors?: string[];
  data?: T;
};

export type CSVValidationResult = ValidationResult<{
  file: CSVFile;
  content: ParsedCSV;
}>;
