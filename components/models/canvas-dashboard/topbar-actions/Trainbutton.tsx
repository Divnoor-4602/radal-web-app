"use client";

import React, { useCallback, memo } from "react";
import { BrainCircuit } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  validateTrainingFlow,
  getConnectedTrainingNodes,
  transformFlowToTrainingSchema,
} from "@/lib/utils/train.utils";
import { startTraining } from "@/lib/actions/train.actions";
import { type TrainingSchemaDataServer } from "@/lib/validations/train.server.schema";

// Train button component - memoized to prevent unnecessary re-renders
const TrainButton = memo(() => {
  const params = useParams();

  // Memoize the train click handler with stable reference - access store inside function
  const handleTrainClick = useCallback(async () => {
    try {
      // Access current state inside the function to avoid dependencies on volatile arrays
      const { nodes, edges } = useFlowStore.getState();

      // Validate the training flow
      const validation = validateTrainingFlow(nodes, edges);

      if (!validation.isValid) {
        console.error("Invalid training flow:", validation.errors);
        // TODO: Show user-friendly error message
        return;
      }

      // Collect and validate connected nodes
      const connectedNodes = getConnectedTrainingNodes(nodes, edges);

      if (!connectedNodes.isValid) {
        console.error("Invalid connected nodes:", connectedNodes.errors);
        // TODO: Show user-friendly error message
        return;
      }

      // Transform to training schema format
      const transformResult = transformFlowToTrainingSchema(nodes, edges);
      console.log("Training schema transformation:", transformResult);

      if (!transformResult.success) {
        console.error(
          "Failed to transform training schema:",
          transformResult.errors,
        );
        // TODO: Show user-friendly error message
        return;
      }

      console.log("✅ Successfully transformed to training schema!");
      console.log("Training schema data:", transformResult.data);

      // Ensure we have the transformed data
      if (!transformResult.data) {
        console.error("No transformed data available");
        return;
      }

      // Extract projectId from URL params
      const projectId = params.projectId as string;
      if (!projectId) {
        console.error("Project ID not found in URL params");
        return;
      }

      console.log("🚀 Starting training with:", {
        projectId,
        datasetCount: transformResult.data.datasetNodes.length,
      });

      // Call the server action
      // TODO: Handle loading states and show live updates while training is in progress
      const result = await startTraining({
        trainingData: transformResult.data! as TrainingSchemaDataServer, // Type cast
        projectId,
      });

      console.log("Training result:", result);
    } catch (error) {
      console.error("Training failed:", error);
    }
  }, []); // No dependencies - stable reference

  return (
    <CustomButton
      text="Train"
      icon={<BrainCircuit className="size-4" strokeWidth={1.6} />}
      className="gap-1.5"
      onClick={handleTrainClick}
    />
  );
});

TrainButton.displayName = "TrainButton";

export default TrainButton;
