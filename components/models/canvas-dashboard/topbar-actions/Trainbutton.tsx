"use client";

import React, { useCallback, memo, useState, useMemo } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import CustomButton from "@/components/shared/CustomButton";
import { useParams, usePathname } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  validateTrainingFlow,
  getConnectedTrainingNodes,
  transformFlowToTrainingSchema,
} from "@/lib/utils/train.utils";
import { startTraining } from "@/lib/actions/train.actions";
import { type TrainingSchemaDataServer } from "@/lib/validations/train.server.schema";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Train button component - memoized to prevent unnecessary re-renders
const TrainButton = memo(() => {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isTraining, setIsTraining] = useState(false);

  // Generate flow key (same logic as CanvasContent)
  const { projectId, modelId } = params as {
    projectId: string;
    modelId?: string;
  };
  const flowKey = useMemo(() => {
    if (modelId) {
      return `model-flow-${modelId}`;
    } else if (projectId) {
      const isNewCanvasPage = pathname?.includes("/models/new/canvas");
      if (isNewCanvasPage) {
        return `project-canvas-${projectId}`;
      }
      return `project-flow-${projectId}`;
    }
    return "default-flow";
  }, [projectId, modelId, pathname]);

  // Memoize the train click handler with stable reference - access store inside function
  const handleTrainClick = useCallback(async () => {
    // Prevent multiple simultaneous training requests
    if (isTraining) return;

    setIsTraining(true);

    try {
      // Access current state inside the function to avoid dependencies on volatile arrays
      const { nodes, edges } = useFlowStore.getState();

      // Validate the training flow
      const validation = validateTrainingFlow(nodes, edges);

      if (!validation.isValid) {
        toast.error(
          "Invalid training flow. Please check your model configuration.",
        );
        return;
      }

      // Collect and validate connected nodes
      const connectedNodes = getConnectedTrainingNodes(nodes, edges);

      if (!connectedNodes.isValid) {
        toast.error(
          "Invalid training setup. Please ensure all required nodes are properly connected.",
        );
        return;
      }

      // Transform to training schema format
      const transformResult = transformFlowToTrainingSchema(nodes, edges);

      if (!transformResult.success) {
        toast.error(
          "Failed to prepare training data. Please check your configuration.",
        );
        return;
      }

      // Ensure we have the transformed data
      if (!transformResult.data) {
        toast.error("Training data preparation failed. Please try again.");
        return;
      }

      // Extract projectId from URL params
      const projectId = params.projectId as string;
      if (!projectId) {
        toast.error("Project not found. Please refresh and try again.");
        return;
      }

      // Show loading toast
      toast.loading("Starting model training...");

      // Call the server action

      const result = await startTraining({
        trainingData: transformResult.data! as TrainingSchemaDataServer, // Type cast
        projectId,
      });

      // Dismiss loading toast and show success
      toast.dismiss();

      if (result.success && result.data && result.data.modelId) {
        toast.success("Training started successfully!", {
          description: "This will take approximately 2-3 hours to complete.",
        });

        // Clear the canvas state from both memory and localStorage since training has started
        useFlowStore.getState().clearPersistedState(flowKey);

        router.push(`/projects/${projectId}`);
      }
    } catch (error) {
      console.error("Training failed:", error);
      toast.dismiss(); // Dismiss any loading toast
      toast.error("Training failed to start. Please try again.");
    } finally {
      setIsTraining(false);
    }
  }, [params.projectId, router, isTraining]); // Include params.projectId as dependency

  return (
    <CustomButton
      text={isTraining ? "Training..." : "Train"}
      icon={
        isTraining ? (
          <Loader2 className="size-4 animate-spin" strokeWidth={1.6} />
        ) : (
          <BrainCircuit className="size-4" strokeWidth={1.6} />
        )
      }
      className="gap-1.5"
      onClick={handleTrainClick}
      disabled={isTraining}
    />
  );
});

TrainButton.displayName = "TrainButton";

export default TrainButton;
