"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import React, { useCallback, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  UploadDatasetNode,
  SelectModelNode,
  TrainingConfigurationNode,
} from "@/components/models/canvas-dashboard/flow-nodes";
import ConnectionLine from "@/components/models/canvas-dashboard/ConnectionLine";
import CustomEdge from "@/components/models/canvas-dashboard/CustomEdge";
// import { Preloaded, usePreloadedQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Preloaded } from "convex/react";

// Node types mapping - memoized outside component for stable reference
const nodeTypes: NodeTypes = {
  dataset: UploadDatasetNode,
  model: SelectModelNode,
  training: TrainingConfigurationNode,
};

// Edge types mapping - memoized outside component for stable reference
const edgeTypes = {
  custom: CustomEdge,
};

// type CanvasContentProps = {
//   modelData?: Preloaded<typeof api.models.getModelById>;
//   datasets?: Preloaded<typeof api.datasets.getDatasetsByProject>;
// };

const CanvasContent = ({}) => {
  const { projectId, modelId } = useParams();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnectStart,
    onReconnect,
    onReconnectEnd,
    addNode,
    isValidConnection,
    resetFlow,
  } = useFlowStore();
  const { screenToFlowPosition } = useReactFlow();

  // Reset flow when project or model changes
  useEffect(() => {
    resetFlow();
  }, [projectId, modelId, resetFlow]);

  // Use preloaded data
  // const modelData = usePreloadedQuery(preloadedModelData);
  // const datasets = usePreloadedQuery(preloadedDatasets);

  // Load the canvas with model data when component mounts
  // useEffect(() => {
  //   if (modelData && datasets) {
  //     loadModelCanvas(modelData);
  //   }
  // }, [modelData, datasets, loadModelCanvas]);

  // Memoize style object to prevent unnecessary re-renders
  const canvasStyle = useMemo(() => ({ backgroundColor: "#090707" }), []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position, projectId as string);
    },
    [screenToFlowPosition, addNode, projectId],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "#090707" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        isValidConnection={isValidConnection}
        edgesReconnectable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnectStart={onReconnectStart}
        onReconnect={onReconnect}
        onReconnectEnd={onReconnectEnd}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={ConnectionLine}
        fitView
        style={canvasStyle}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#444444"
          gap={15}
          size={1}
        />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default CanvasContent;
