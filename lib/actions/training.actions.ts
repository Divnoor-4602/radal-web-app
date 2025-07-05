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

// Initialize Convex client for server-side operations
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

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

export async function submitTrainingGraphTest(
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
    const userId = formData.get("userId") as string;

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

    // Step E: Update Convex project with validated graph
    await convex.mutation(api.projects.updateProjectGraph, {
      projectId: submissionData.projectId as Id<"projects">,
      graph: trainingGraph,
      status: "valid",
    });

    // Step F: Simulate successful FastAPI response (TEST MODE)
    console.log("🧪 TEST MODE: Simulating successful FastAPI response");

    // Step G: Update project status to training first
    await convex.mutation(api.projects.updateProjectStatus, {
      projectId: submissionData.projectId as Id<"projects">,
      status: "training",
      jobId: `test-job-${Date.now()}`,
    });

    // Simulate a small delay like a real API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock successful completion - update status to ready
    await convex.mutation(api.projects.updateProjectStatus, {
      projectId: submissionData.projectId as Id<"projects">,
      status: "ready",
      jobId: `test-job-${Date.now()}`,
    });

    // Create a model record for the trained model
    await convex.mutation(api.models.createModel, {
      projectId: submissionData.projectId as Id<"projects">,
      userId: userId as Id<"users">,
      title: submissionData.modelNode.title,
      description: submissionData.modelNode.description,
      modelId: submissionData.modelNode.modelId,
      quant: submissionData.modelNode.quant,
      status: "ready",
    });

    // Revalidate both the dashboard and create-model pages
    revalidatePath(`/dashboard/${submissionData.projectId}`);
    revalidatePath(`/dashboard/${submissionData.projectId}/create-model`);

    return {
      success: true,
      message: "Training completed successfully! (Test Mode)",
      projectId: submissionData.projectId,
      jobId: `test-job-${Date.now()}`,
      redirectTo: `/dashboard/${submissionData.projectId}`,
    };
  } catch (error) {
    console.error("Training submission test error:", error);
    return {
      success: false,
      message: "An unexpected error occurred in test mode",
    };
  }
}
