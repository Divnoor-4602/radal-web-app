"use server";

import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { Id } from "@/convex/_generated/dataModel";
import {
  validateStartTrainingInput,
  type StartTrainingInput,
} from "@/lib/validations/train.server.schema";
import {
  buildFinalTrainingSchema,
  generateCreatedByIdentifier,
  validateFinalSchema,
  type FinalSchemaOutput,
  extractModelCreationData,
} from "@/lib/utils/train.utils";
import { validateModelCreationData } from "@/lib/validations/train.server.schema";
import { RateLimiterMemory } from "rate-limiter-flexible";

// Create Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Rate limiter: 5 training requests per user per hour (more restrictive for resource-intensive operations)
const trainingRateLimiter = new RateLimiterMemory({
  points: 5, // 5 training requests
  duration: 60 * 60, // per hour
});

export const startTraining = async (input: StartTrainingInput) => {
  try {
    // 1. Authentication - Get the currently logged in user from Clerk middleware session
    const { userId: clerkUserId } = await auth();

    // If the user is not authenticated, return a 401 error
    if (!clerkUserId) {
      return {
        success: false,
        message: "Unauthorized - User is not authenticated",
        error: "AUTH_REQUIRED",
      };
    }

    // 2. Rate Limiting - Check training request limits per user
    try {
      await trainingRateLimiter.consume(clerkUserId);
    } catch {
      return {
        success: false,
        message:
          "Too many training requests. Please wait before starting more training sessions.",
        error: "RATE_LIMIT_EXCEEDED",
      };
    }

    // 3. Get the user from the Convex database using the Clerk ID
    const convexUser = await convex.query(api.users.getByClerkId, {
      clerkId: clerkUserId,
    });

    if (!convexUser) {
      return {
        success: false,
        message: "User not found in database",
        error: "USER_NOT_FOUND",
      };
    }

    // 4. Whitelist Check - Verify user is whitelisted for training
    if (!convexUser.isWhitelisted) {
      return {
        success: false,
        message:
          "Access denied - You are not whitelisted for training. Please join our waitlist.",
        error: "NOT_WHITELISTED",
      };
    }

    // 5. Validate the input data structure
    const inputValidation = validateStartTrainingInput(input);
    if (!inputValidation.isValid) {
      return {
        success: false,
        message: "Invalid training data structure",
        error: "VALIDATION_ERROR",
        details: inputValidation.errors,
      };
    }

    const validatedData = inputValidation.data!; // Safe because we checked isValid
    const { trainingData, projectId } = validatedData;

    console.log("✓ Rate limiting passed");

    // 6. Authorization - Verify project ownership and permissions
    const project = await convex.query(api.projects.getProjectByIdWithClerkId, {
      projectId: projectId as Id<"projects">,
      clerkId: clerkUserId,
    });

    if (!project) {
      return {
        success: false,
        message: "Project not found or access denied",
        error: "PROJECT_ACCESS_DENIED",
      };
    }

    console.log("✓ Authorization successful");

    // 7. Extract and validate model creation data
    const modelCreationResult = extractModelCreationData(trainingData);
    if (!modelCreationResult.success) {
      return {
        success: false,
        message: "Failed to extract model creation data",
        error: "MODEL_DATA_EXTRACTION_ERROR",
        details: modelCreationResult.errors,
      };
    }

    const modelCreationData = modelCreationResult.data!;
    console.log("✓ Model data extracted");

    // Validate the extracted data
    const validationResult = validateModelCreationData(modelCreationData);
    if (!validationResult.isValid) {
      return {
        success: false,
        message: "Invalid model creation data",
        error: "MODEL_DATA_VALIDATION_ERROR",
        details: validationResult.errors,
      };
    }
    console.log("✓ Model data validated");

    // 8. Find dataset IDs by Azure URLs
    const datasetIds: Id<"datasets">[] = [];
    const azureUrls = trainingData.datasetNodes.map((d) => d.azureUrl!);

    try {
      const projectDatasets = await convex.query(
        api.datasets.getDatasetsByProject,
        {
          projectId: project._id,
        },
      );

      for (const azureUrl of azureUrls) {
        const matchingDataset = projectDatasets.find(
          (d) => d.azureUrl === azureUrl,
        );
        if (matchingDataset) {
          datasetIds.push(matchingDataset._id);
        } else {
          return {
            success: false,
            message: `Dataset not found for Azure URL: ${azureUrl}`,
            error: "DATASET_NOT_FOUND",
          };
        }
      }
    } catch {
      return {
        success: false,
        message: "Failed to find datasets in database",
        error: "DATASET_LOOKUP_ERROR",
      };
    }
    console.log(`✓ Found ${datasetIds.length} datasets`);

    // 9. Create model record
    let modelId: Id<"models">;
    try {
      modelId = await convex.mutation(api.models.createModel, {
        projectId: project._id,
        userId: convexUser._id,
        title: modelCreationData.title,
        baseModelDetails: modelCreationData.baseModelDetails,
        datasetIds,
        trainingConfig: modelCreationData.trainingConfig,
        trainingGraph: modelCreationData.trainingGraph,
        status: "pending", // row created
      });
    } catch {
      return {
        success: false,
        message: "Failed to create model record",
        error: "MODEL_CREATION_ERROR",
      };
    }
    console.log(`✓ Model record created: ${modelId}`);

    // 10. Transform to final schema using the model record ID as training_id
    // 10. Transform to final schema using the model record ID as training_id
    const finalSchemaResult = buildFinalTrainingSchema(trainingData, {
      trainingId: modelId, // Use the newly created model ID as training_id
      projectName: project.name,
      createdBy: generateCreatedByIdentifier(convexUser._id),
    });

    if (!finalSchemaResult.success) {
      return {
        success: false,
        message: "Failed to transform training schema",
        error: "SCHEMA_TRANSFORMATION_ERROR",
        details: finalSchemaResult.errors,
      };
    }

    const finalSchema: FinalSchemaOutput = finalSchemaResult.data!;

    console.log("Final schema:", JSON.stringify(finalSchema, null, 2));

    // Validate final schema integrity
    const schemaValidation = validateFinalSchema(finalSchema);
    if (!schemaValidation.isValid) {
      return {
        success: false,
        message: "Invalid final training schema structure",
        error: "FINAL_SCHEMA_VALIDATION_ERROR",
        details: schemaValidation.errors,
      };
    }
    console.log("✓ Final schema validated");

    // 11. Send to FastAPI endpoint
    const fastApiEndpoint = process.env.FASTAPI_ENDPOINT;
    if (!fastApiEndpoint) {
      // Update model status to failed due to missing endpoint
      await convex.mutation(api.models.updateModelStatus, {
        modelId,
        status: "failed",
        errorMessage: "FastAPI endpoint not configured",
      });

      return {
        success: false,
        message: "FastAPI endpoint not configured",
        error: "FASTAPI_ENDPOINT_MISSING",
      };
    }
    console.log(`✓ Sending to FastAPI: ${fastApiEndpoint}`);

    try {
      const response = await fetch(`${fastApiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "NextJS-Server",
        },
        body: JSON.stringify(finalSchema),
      });

      const apiResult = await response.json();

      if (!response.ok) {
        // Update model status to failed
        await convex.mutation(api.models.updateModelStatus, {
          modelId,
          status: "failed",
          errorMessage: `FastAPI error: ${apiResult.error || "Unknown error"}`,
        });
        console.log(`✗ FastAPI error: ${apiResult.error || "Unknown error"}`);

        return {
          success: false,
          message: "Training submission failed",
          error: "FASTAPI_SUBMISSION_ERROR",
          details: [apiResult.error || "Unknown FastAPI error"],
        };
      }

      // Update model status to training on success
      await convex.mutation(api.models.updateModelStatus, {
        modelId,
        status: "training",
      });
      console.log("✓ Training started successfully");

      return {
        success: true,
        message: "Training started successfully",
        data: {
          userId: convexUser!._id,
          project: {
            id: project!._id,
            name: project!.name,
          },
          modelId: modelId,
          finalSchema,
          fastApiResponse: apiResult,
        },
      };
    } catch (fetchError) {
      // Update model status to failed due to network/fetch error
      await convex.mutation(api.models.updateModelStatus, {
        modelId,
        status: "failed",
        errorMessage: `Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown network error"}`,
      });
      console.log(
        `✗ Network error: ${fetchError instanceof Error ? fetchError.message : "Unknown network error"}`,
      );

      return {
        success: false,
        message: "Failed to connect to training service",
        error: "FASTAPI_CONNECTION_ERROR",
        details: [
          fetchError instanceof Error
            ? fetchError.message
            : "Unknown network error",
        ],
      };
    }
  } catch (error) {
    console.error("Authentication/Authorization error:", error);
    return {
      success: false,
      message: "Internal server error during authentication",
      error: "INTERNAL_ERROR",
    };
  }
};
