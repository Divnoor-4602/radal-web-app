"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import React, { useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  UploadDatasetNode,
  SelectModelNode,
  TrainingConfigurationNode,
} from "@/components/models/canvas-dashboard/flow-nodes";
import ConnectionLine from "@/components/models/canvas-dashboard/ConnectionLine";
import CustomEdge from "@/components/models/canvas-dashboard/CustomEdge";

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

const CanvasContent = () => {
  const { projectId } = useParams();
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
  } = useFlowStore();
  const { screenToFlowPosition } = useReactFlow();

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
