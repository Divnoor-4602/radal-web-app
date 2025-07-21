"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
  Connection,
  Edge,
} from "@xyflow/react";
import React, { useCallback } from "react";
import { useParams } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  UploadDatasetNode,
  SelectModelNode,
  TrainingConfigurationNode,
} from "@/components/models/canvas-dashboard/flow-nodes";
import ConnectionLine from "@/components/models/canvas-dashboard/ConnectionLine";

// Node types mapping
const nodeTypes: NodeTypes = {
  dataset: UploadDatasetNode,
  model: SelectModelNode,
  training: TrainingConfigurationNode,
};

const CanvasContent = () => {
  const { projectId } = useParams();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();
  const { screenToFlowPosition } = useReactFlow();

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

  // validation logic - allow blue handles (dataset and model nodes) to connect
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      console.log(connection);
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      // Check if both nodes exist
      if (!sourceNode || !targetNode) return false;

      // Get node types that can connect (nodes with blue handles)
      const allowedNodeTypes = ["dataset", "model"];

      console.log(sourceNode, targetNode);

      // Allow connection only if both nodes are allowed types
      return (
        allowedNodeTypes.includes(sourceNode.type || "") &&
        allowedNodeTypes.includes(targetNode.type || "")
      );
    },
    [nodes],
  );

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "#090707" }}>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: { ...node.data, projectId },
        }))}
        edges={edges}
        isValidConnection={isValidConnection}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        connectionLineComponent={ConnectionLine}
        fitView
        style={{ backgroundColor: "#090707" }}
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
