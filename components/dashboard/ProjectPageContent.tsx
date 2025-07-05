"use client";

import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Settings, Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import FlowEditor from "@/components/dashboard/FlowEditor";
import useFlowStore, {
  DatasetNodeData,
  ModelNodeData,
} from "@/lib/stores/flowStore";
import { submitTrainingGraphTest } from "@/lib/actions/training.actions";
import { toast } from "sonner";

export function ProjectPageContent({ projectId }: { projectId: string }) {
  const router = useRouter();

  // Fetch real project data
  const project = useQuery(api.projects.getProjectById, {
    projectId: projectId as Id<"projects">,
  });

  // Get current user for training submission
  const currentUser = useQuery(api.users.current);

  // Get JWT token from Clerk auth
  const { getToken } = useAuth();

  // Access flow store for current node states
  const nodes = useFlowStore((state) => state.nodes);
  const loadExistingFlow = useFlowStore((state) => state.loadExistingFlow);
  const resetFlow = useFlowStore((state) => state.resetFlow);

  // Training submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasLoadedExistingFlow, setHasLoadedExistingFlow] = useState(false);

  // Check if project has existing trained nodes
  const hasExistingNodes =
    project?.graph?.nodes && project.graph.nodes.length > 0;
  const isModelTrained = project?.status === "ready";
  const isTrainingInProgress = project?.status === "training";

  // Load existing flow when project data is available
  useEffect(() => {
    if (project && hasExistingNodes && !hasLoadedExistingFlow) {
      console.log("Loading existing flow with nodes:", project.graph.nodes);
      loadExistingFlow({
        nodes: project.graph.nodes,
        edges: project.graph.edges || [],
      });
      setHasLoadedExistingFlow(true);
    } else if (project && !hasExistingNodes && !hasLoadedExistingFlow) {
      // Reset flow for projects without existing nodes
      resetFlow();
      setHasLoadedExistingFlow(true);
    }
  }, [
    project,
    hasExistingNodes,
    hasLoadedExistingFlow,
    loadExistingFlow,
    resetFlow,
  ]);

  // Get badge variant based on status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "valid":
        return "outline";
      case "training":
        return "default";
      case "ready":
        return "default";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Check current flow configuration status
  const datasetNode = nodes.find((node) => node.type === "dataset");
  const modelNode = nodes.find((node) => node.type === "model");

  const datasetData = datasetNode?.data as DatasetNodeData | undefined;
  const modelData = modelNode?.data as ModelNodeData | undefined;

  // Check if nodes are ready for training
  const hasValidDataset = datasetData?.datasetId !== undefined;
  const hasValidModel = modelData?.modelId && modelData?.quant;
  const canStartTraining =
    hasValidDataset &&
    hasValidModel &&
    currentUser &&
    !isTrainingInProgress &&
    !isModelTrained;

  // Handle training submission
  const handleStartTraining = async () => {
    if (!canStartTraining || !datasetData || !modelData || !currentUser) {
      toast.error("Configuration incomplete", {
        description:
          "Please ensure both dataset and model are properly configured",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get JWT token from Clerk
      const jwtToken = await getToken();

      const formData = new FormData();
      formData.append("projectId", projectId);
      formData.append("userId", currentUser._id);
      formData.append("clerkId", currentUser.clerkId);
      formData.append("jwtToken", jwtToken || "");
      formData.append(
        "datasetNode",
        JSON.stringify({
          id: datasetNode?.id || "dataset-node",
          datasetId: datasetData.datasetId,
          storageId: datasetData.storageId || datasetData.datasetId, // Use datasetId as fallback
          title: datasetData.title,
          description: datasetData.description,
        }),
      );
      formData.append(
        "modelNode",
        JSON.stringify({
          id: modelNode?.id || "model-node",
          modelId: modelData.modelId,
          quant: modelData.quant,
          title: modelData.title,
          description: modelData.description,
        }),
      );

      const result = await submitTrainingGraphTest(null, formData);

      if (result?.success) {
        toast.success("Training completed!", {
          description: result.message,
          duration: 5000,
        });

        // Redirect to dashboard after successful training
        if (result.redirectTo) {
          setTimeout(() => {
            router.push(result.redirectTo!);
          }, 2000); // Give user time to see the success message
        }
      } else {
        toast.error("Training failed", {
          description: result?.message || "Unknown error occurred",
        });
      }
    } catch (error) {
      console.error("Training submission error:", error);
      toast.error("Training failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (project === undefined) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <SidebarTrigger />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>

              {/* Loading skeleton */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </div>

                <div className="h-96 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // Project not found
  if (project === null) {
    return (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <SidebarTrigger />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Button>
              </div>

              <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Project Not Found
                </h1>
                <p className="text-gray-500 mb-6">
                  The project you&apos;re looking for doesn&apos;t exist or you
                  don&apos;t have access to it.
                </p>
                <Button onClick={() => router.push("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Header with trigger and back button */}
            <div className="flex items-center gap-4 p-6 pb-4 border-b">
              <SidebarTrigger />
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>

              {/* Project Header */}
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold">{project.name}</h1>
                      {isModelTrained && hasExistingNodes && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Model Trained
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    {isModelTrained && hasExistingNodes && (
                      <p className="text-xs text-green-600 mt-1">
                        This project has a trained model. The configuration
                        below shows the previous training setup.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                    <Button
                      className="flex items-center gap-2"
                      disabled={!canStartTraining || isSubmitting}
                      onClick={handleStartTraining}
                      variant={isModelTrained ? "secondary" : "default"}
                    >
                      {isTrainingInProgress || isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isSubmitting
                            ? "Starting Training..."
                            : "Training..."}
                        </>
                      ) : isModelTrained ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Model Trained
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Start Training
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Flow Editor - takes up remaining space */}
            <div className="flex-1 overflow-hidden">
              <FlowEditor />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
