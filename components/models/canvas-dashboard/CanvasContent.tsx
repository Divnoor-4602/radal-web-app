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
import CustomEdge from "@/components/models/canvas-dashboard/CustomEdge";

// Node types mapping
const nodeTypes: NodeTypes = {
  dataset: UploadDatasetNode,
  model: SelectModelNode,
  training: TrainingConfigurationNode,
};

// Edge types mapping
const edgeTypes = {
  custom: CustomEdge,
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

  // validation logic - allow connections between compatible node types
  const isValidConnection = useCallback(
    (connection: Edge | Connection) => {
      console.log(connection);
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      // Check if both nodes exist
      if (!sourceNode || !targetNode) return false;

      console.log(sourceNode, targetNode);

      // Define valid connection patterns
      const validConnections = [
        { source: "dataset", target: "model" },
        { source: "model", target: "training" },
      ];

      // Check if this connection type is valid
      const isValidType = validConnections.some(
        (validConn) =>
          validConn.source === sourceNode.type &&
          validConn.target === targetNode.type,
      );

      if (!isValidType) return false;

      // For model -> training connections, enforce one-to-one rule
      if (sourceNode.type === "model" && targetNode.type === "training") {
        // Check if source model already has a training connection
        const modelHasTrainingConnection = edges.some(
          (edge) =>
            edge.source === connection.source &&
            nodes.find((node) => node.id === edge.target)?.type === "training",
        );

        // Check if target training already has a model connection
        const trainingHasModelConnection = edges.some(
          (edge) =>
            edge.target === connection.target &&
            nodes.find((node) => node.id === edge.source)?.type === "model",
        );

        // Reject if either already has a connection
        if (modelHasTrainingConnection || trainingHasModelConnection) {
          return false;
        }
      }

      return true;
    },
    [nodes, edges],
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
        edgeTypes={edgeTypes}
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
