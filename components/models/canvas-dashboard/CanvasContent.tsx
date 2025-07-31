"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
  ReactFlowInstance,
} from "@xyflow/react";
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  UploadDatasetNode,
  SelectModelNode,
  TrainingConfigurationNode,
} from "@/components/models/canvas-dashboard/flow-nodes";
import ConnectionLine from "@/components/models/canvas-dashboard/ConnectionLine";
import CustomEdge from "@/components/models/canvas-dashboard/CustomEdge";
import { generateFlowKey } from "@/lib/utils/canvas.utils";
import "@xyflow/react/dist/style.css";

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

const CanvasContent = ({}) => {
  const { projectId, modelId } = useParams();
  const pathname = usePathname();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
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
    restoreFlow,
    setAutoSaveContext,
  } = useFlowStore();
  const { screenToFlowPosition, setViewport } = useReactFlow();

  // Generate flow key based on project and model IDs
  const flowKey = useMemo(
    () => generateFlowKey(projectId, modelId, pathname),
    [projectId, modelId, pathname],
  );

  // Set up auto-save context when React Flow instance is ready
  useEffect(() => {
    if (rfInstance && flowKey && projectId && projectId !== "undefined") {
      setAutoSaveContext(flowKey, rfInstance);
    }
  }, [rfInstance, flowKey, projectId, setAutoSaveContext]);

  // Reset flow when project or model IDs change
  useEffect(() => {
    // Only proceed with valid projectId to prevent SSR issues
    if (projectId && projectId !== "undefined") {
      resetFlow();
    } else {
      console.log("⏳ Reset waiting for valid projectId, current:", projectId);
    }
  }, [projectId, modelId, resetFlow, flowKey]);

  // Simple auto-restore when React Flow instance is ready
  useEffect(() => {
    // Add validation for production SSR issues - ensure we have valid params
    const hasValidParams = projectId && projectId !== "undefined" && pathname;

    if (rfInstance && flowKey && hasValidParams) {
      try {
        const savedFlow = localStorage.getItem(flowKey);
        if (!savedFlow) return;

        const flow = JSON.parse(savedFlow);
        if (!flow || (!flow.nodes?.length && !flow.edges?.length)) return;

        // Restore nodes and edges via store
        const restored = restoreFlow(flowKey);

        // Restore viewport if restoration was successful
        if (restored && flow.viewport && setViewport) {
          const { x = 0, y = 0, zoom = 1 } = flow.viewport;
          setTimeout(() => {
            setViewport({ x, y, zoom });
          }, 50);
        }
      } catch (error) {
        console.error("Failed to auto-restore flow:", error);
      }
    }
  }, [rfInstance, flowKey, restoreFlow, setViewport, projectId, pathname]);

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
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={ConnectionLine}
        fitView
        proOptions={{ hideAttribution: true }}
        style={canvasStyle}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#444444"
          gap={15}
          size={1}
        />
        <Controls className="!bg-black" />
      </ReactFlow>
    </div>
  );
};

export default CanvasContent;
