import { z } from "zod";

// model detail schema
export const ModelDetailSchema = z.object({
  display_name: z.string().min(1, "Display name is required"),
  model_id: z.string().min(1, "Model ID is required"),
  description: z.string().min(1, "Description is required"),
  parameters: z.string().min(1, "Parameters is required"),
  provider: z.string().min(1, "Provider is required"),
  providerIcon: z.any(), // StaticImageData type
  tags: z.array(z.string()),
});

export type TModelDetail = z.infer<typeof ModelDetailSchema>;
