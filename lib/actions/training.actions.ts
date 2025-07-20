"use server";

import { revalidatePath } from "next/cache";
import {
  validateClientTrainingSubmission,
  validateTrainingGraph,
  type ClientTrainingSubmission,
  type TrainingGraph,
  type TrainingSubmissionResponse,
} from "@/lib/validations/project.schema";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Node, Edge } from "@xyflow/react";
import { nanoid } from "nanoid";

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function startTraining(nodes: Node[], _edges: Edge[]) {
  try {
    // Generate a random training ID
    const trainingId = nanoid();
    const projectName = "acme";

    // Find nodes by type
    const datasetNode = nodes.find((node) => node.type === "dataset");
    const modelNode = nodes.find((node) => node.type === "model");
    const trainingNode = nodes.find((node) => node.type === "training");

    // Build the training schema
    const trainingSchema = {
      training_id: trainingId,
      project_name: projectName,
      node_schema: {
        schema_version: 1,
        nodes: {
          ...(datasetNode && {
            d1: {
              id: "d1",
              type: "Dataset",
              props: {
                uris: datasetNode.data.azureUrl
                  ? [datasetNode.data.azureUrl]
                  : [],
              },
            },
          }),
          ...(modelNode && {
            b1: {
              id: "b1",
              type: "BaseModel",
              props: {
                model_id:
                  (modelNode.data.selectedModel as { model_id: string })
                    ?.model_id || "",
              },
            },
          }),
          ...(trainingNode && {
            t1: {
              id: "t1",
              type: "Train",
              props: {
                epochs: trainingNode.data.epochs || 1,
                batch_size: parseInt(String(trainingNode.data.batchSize)) || 4,
                train_quant: trainingNode.data.quantization || "int8",
                download_quant: trainingNode.data.downloadQuant || "int4",
              },
            },
          }),
        },
        edges: [
          { from: "d1", to: "b1" },
          { from: "b1", to: "t1" },
        ],
        meta: {
          created_by: "user_xyz",
        },
      },
    };

    console.log(
      "Generated Training Schema:",
      JSON.stringify(trainingSchema, null, 2),
    );

    // Send the training schema to FastAPI
    const FASTAPI_URL = "https://519f715ecedf.ngrok-free.app";

    try {
      console.log("Sending request to:", `https://api.radal.ai/train`);
      const response = await fetch(`https://api.radal.ai/train`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Required for ngrok
          "User-Agent": "NextJS-Server",
        },
        body: JSON.stringify(trainingSchema),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      const apiResult = await response.json();

      if (!response.ok) {
        console.error("FastAPI error:", apiResult);
        return {
          success: false,
          message: "FastAPI training submission failed",
          error: apiResult.error || "Unknown FastAPI error",
          schema: trainingSchema,
        };
      }

      console.log("FastAPI Response:", apiResult);

      return {
        success: true,
        message: "Training started successfully!",
        schema: trainingSchema,
        fastApiResponse: apiResult,
        jobId: apiResult.job_id,
      };
    } catch (fetchError) {
      console.error("FastAPI communication error:", fetchError);
      return {
        success: false,
        message: "Failed to communicate with training service",
        error:
          fetchError instanceof Error ? fetchError.message : "Network error",
        schema: trainingSchema,
      };
    }
  } catch (error) {
    console.error("Error generating training schema:", error);
    return {
      success: false,
      message: "Failed to generate training schema",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function submitTrainingGraph(
  prevState: TrainingSubmissionResponse | null,
  formData: FormData,
): Promise<TrainingSubmissionResponse> {
  try {
    // Extract and parse form data
    const rawData = {
      projectId: formData.get("projectId") as string,
      clerkId: formData.get("clerkId") as string,
      jwtToken: formData.get("jwtToken") as string,
      datasetNode: JSON.parse(formData.get("datasetNode") as string),
      modelNode: JSON.parse(formData.get("modelNode") as string),
    };

    // Step A: Validate client-side data
    const clientValidation = validateClientTrainingSubmission(rawData);
    if (!clientValidation.isValid) {
      return {
        success: false,
        message: "Validation failed",
        errors: clientValidation.errors,
      };
    }

    const submissionData = clientValidation.data as ClientTrainingSubmission;

    // Step B: Get dataset storage URL from Convex
    const datasetStorageUrl = await convex.query(api.datasets.getStorageUrl, {
      datasetId: submissionData.datasetNode.datasetId as Id<"datasets">,
    });

    if (!datasetStorageUrl) {
      return {
        success: false,
        message: "Failed to retrieve dataset storage URL",
      };
    }

    // Step C: Build the complete training graph
    const nowIso = new Date().toISOString();
    const userId = formData.get("userId") as string; // This should come from auth

    const trainingGraph: TrainingGraph = {
      schema_version: 1,
      nodes: [
        {
          id: "n-dataset-01",
          type: "Dataset",
          props: {
            uris: [datasetStorageUrl],
          },
        },
        {
          id: "n-basemodel-01",
          type: "BaseModel",
          props: {
            model_id: submissionData.modelNode.modelId,
            quant: submissionData.modelNode.quant,
          },
        },
      ],
      edges: [
        {
          from: "n-dataset-01",
          to: "n-basemodel-01",
        },
      ],
      meta: {
        created_by: userId,
        created_at: nowIso,
        clerk_id: submissionData.clerkId,
        jwt_token: submissionData.jwtToken,
      },
    };

    // Step D: Validate the complete training graph
    const graphValidation = validateTrainingGraph(trainingGraph);
    if (!graphValidation.isValid) {
      return {
        success: false,
        message: "Training graph validation failed",
        errors: graphValidation.errors,
      };
    }

    // Step E: Update Convex project (optimistic update)
    const originalProject = await convex.query(api.projects.getProjectById, {
      projectId: submissionData.projectId as Id<"projects">,
    });

    if (!originalProject) {
      return {
        success: false,
        message: "Project not found",
      };
    }

    // Update project with the graph
    await convex.mutation(api.projects.updateProjectGraph, {
      projectId: submissionData.projectId as Id<"projects">,
      graph: trainingGraph,
      status: "valid",
    });

    // Step F: Call FastAPI for deep validation (dummy endpoint for now)
    const FASTAPI_URL = process.env.FASTAPI_URL || "https://api.radal.dev";

    try {
      const response = await fetch(`${FASTAPI_URL}/deep_validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer dummy-token`, // Replace with actual auth
        },
        body: JSON.stringify(trainingGraph),
      });

      const apiResult = await response.json();

      if (!response.ok || !apiResult.ok) {
        // Rollback Convex changes on FastAPI failure - create a valid fallback graph
        const rollbackGraph = {
          schema_version: originalProject.graph.schema_version || 1,
          nodes: originalProject.graph.nodes || [],
          edges: originalProject.graph.edges || [],
          meta: originalProject.graph.meta || {
            created_by: userId,
            created_at: nowIso,
            clerk_id: submissionData.clerkId,
            jwt_token: submissionData.jwtToken,
          },
        };

        await convex.mutation(api.projects.updateProjectGraph, {
          projectId: submissionData.projectId as Id<"projects">,
          graph: rollbackGraph,
          status: originalProject.status,
        });

        return {
          success: false,
          message: apiResult.error || "FastAPI validation failed",
        };
      }

      // Step G: Update project status to training
      await convex.mutation(api.projects.updateProjectStatus, {
        projectId: submissionData.projectId as Id<"projects">,
        status: "training",
        jobId: apiResult.job_id,
      });

      // Revalidate the project page
      revalidatePath(`/dashboard/${submissionData.projectId}`);

      return {
        success: true,
        message: "Training started successfully!",
        projectId: submissionData.projectId,
        jobId: apiResult.job_id,
      };
    } catch (error) {
      console.error("FastAPI communication error:", error);
      // Rollback Convex changes on network failure - create a valid fallback graph
      const rollbackGraph = {
        schema_version: originalProject.graph.schema_version || 1,
        nodes: originalProject.graph.nodes || [],
        edges: originalProject.graph.edges || [],
        meta: originalProject.graph.meta || {
          created_by: userId,
          created_at: nowIso,
          clerk_id: submissionData.clerkId,
          jwt_token: submissionData.jwtToken,
        },
      };

      await convex.mutation(api.projects.updateProjectGraph, {
        projectId: submissionData.projectId as Id<"projects">,
        graph: rollbackGraph,
        status: originalProject.status,
      });

      return {
        success: false,
        message: "Failed to communicate with training service",
      };
    }
  } catch (error) {
    console.error("Training submission error:", error);
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
}
