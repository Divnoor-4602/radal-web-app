import { z } from "zod";

// Create project schema
export const CreateProjectSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name must be less than 100 characters")
    .regex(/^\S*$/, "Project name cannot contain spaces"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
});

export type TCreateProject = z.infer<typeof CreateProjectSchema>;
