// Zod schema validation for training nodes and objects

import z from "zod";

// Quantization schema
export const QuantizationSchema = z.enum(["int4", "int8"], {
  errorMap: () => ({ message: "Please select a valid quantization option" }),
});

// Epochs schema
export const EpochsSchema = z.number().min(1).max(10, {
  message: "Epochs must be between 1 and 10",
});

// Batch size schema
// Batch size validation (1, 2, 4, 8)
export const BatchSizeSchema = z.union(
  [z.literal(1), z.literal(2), z.literal(4), z.literal(8)],
  {
    errorMap: () => ({ message: "Batch size must be 1, 2, 4, or 8" }),
  },
);

// Download quant schema
export const DownloadQuantSchema = z.enum(["int4", "int8"], {
  errorMap: () => ({
    message: "Please select a valid download quantization option",
  }),
});

// Training configuration schema
export const TrainingConfigSchema = z.object({
  epochs: EpochsSchema,
  batchSize: BatchSizeSchema,
  downloadQuant: DownloadQuantSchema,
});

// Training configuration type
export type TTrainingConfig = z.infer<typeof TrainingConfigSchema>;
export type TQuantizationSchema = z.infer<typeof QuantizationSchema>;
export type TEpochsSchema = z.infer<typeof EpochsSchema>;
export type TBatchSizeSchema = z.infer<typeof BatchSizeSchema>;
export type TDownloadQuantSchema = z.infer<typeof DownloadQuantSchema>;
