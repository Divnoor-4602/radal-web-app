// Helper function to detect if a column is a numeric index column
export function isNumericIndexColumn(
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
export function preprocessText(text: string): string {
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
export function normalizeEmptyValue(value: string): string {
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

// Helper function to convert async iterator to stream
export function iteratorToStream(
  iterator: AsyncGenerator<Uint8Array, void, unknown>,
) {
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

// Helper function to create streaming state update
export function createStateUpdate(
  state: string,
  message?: string,
  error?: string,
  data?: Record<string, unknown>,
) {
  const encoder = new TextEncoder();
  const update = {
    state,
    message,
    error,
    data,
    timestamp: Date.now(),
  };

  return encoder.encode(`data: ${JSON.stringify(update)}\n\n`);
}
