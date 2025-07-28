// Zod schema validation for training nodes and objects

import z from "zod";

// Quantization schema
export const QuantizationSchema = z.enum(["int4", "int8"], {
  errorMap: () => ({ message: "Please select a valid quantization option" }),
});

// Epochs schema
export const EpochsSchema = z.number().min(1).max(5, {
  message: "Epochs must be between 1 and 5",
});

// Batch size schema -> always defaults to 4
export const BatchSizeSchema = z.literal("4").default("4");

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
