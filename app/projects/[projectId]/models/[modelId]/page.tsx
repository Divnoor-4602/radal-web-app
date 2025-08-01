"use client";

import CanvasContent from "@/components/models/canvas-dashboard/CanvasContent";
import { ReactFlowProvider } from "@xyflow/react";
import React from "react";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";

const ModelPage = () => {
  const { modelId } = useParams<{ modelId: string }>();
  const { isAuthenticated } = useConvexAuth();

  // Fetch model graph data
  const modelGraphData = useQuery(
    api.modelGraphs.getModelGraphByModelId,
    isAuthenticated && modelId ? { modelId: modelId as Id<"models"> } : "skip",
  );

  // Determine if this should be read-only (has saved model graph data)
  const isReadOnly = !!modelGraphData;

  return (
    <ReactFlowProvider>
      <CanvasContent modelGraphData={modelGraphData} isReadOnly={isReadOnly} />
    </ReactFlowProvider>
  );
};

export default ModelPage;
