"use client";

import React, { type FC } from "react";
import {
  getBezierPath,
  type ConnectionLineComponentProps,
} from "@xyflow/react";
import useFlowStore from "@/lib/stores/flowStore";

const ConnectionLine: FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
  fromNode,
  toNode,
}) => {
  const { nodes, edges } = useFlowStore();

  // Generate a smooth bezier path
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  // Determine the line color based on connection type and handle colors
  const getStrokeColor = () => {
    // Error state always red
    if (connectionStatus === "invalid") return "#dc2626"; // red-700

    // Find source and target nodes
    const sourceNode =
      fromNode ||
      nodes.find(
        (node) =>
          Math.abs(node.position.x - (fromX - 200)) < 50 &&
          Math.abs(node.position.y - (fromY - 50)) < 50,
      );
    const targetNode =
      toNode ||
      nodes.find(
        (node) =>
          Math.abs(node.position.x - (toX - 200)) < 50 &&
          Math.abs(node.position.y - (toY - 50)) < 50,
      );

    // Connection from SelectModelNode to TrainingConfigurationNode (amber)
    if (sourceNode?.type === "model" && targetNode?.type === "training") {
      // Check if source model already has a training connection
      const modelHasTrainingConnection = edges.some(
        (edge) =>
          edge.source === sourceNode.id &&
          nodes.find((node) => node.id === edge.target)?.type === "training",
      );

      // Check if target training already has a model connection
      const trainingHasModelConnection = edges.some(
        (edge) =>
          edge.target === targetNode.id &&
          nodes.find((node) => node.id === edge.source)?.type === "model",
      );

      // Show red if one-to-one rule would be violated
      if (modelHasTrainingConnection || trainingHasModelConnection) {
        return "#dc2626"; // red-700 for violation
      }

      return "#E17100"; // Amber color matching the amber handle
    }

    // Connection from Dataset to SelectModel (purple) - default
    if (sourceNode?.type === "dataset" && targetNode?.type === "model") {
      return "#8142D7"; // Purple color matching purple handles
    }

    // Default purple for any other valid connections
    return "#8142D7";
  };

  return (
    <g>
      {/* Connection line path */}
      <path
        fill="none"
        stroke={getStrokeColor()}
        strokeWidth={1}
        strokeDasharray="4 4"
        strokeLinecap="round"
        d={edgePath}
        className="animated"
      />
      {/* Animated dot that moves along the path */}
      <circle
        r="3"
        fill={getStrokeColor()}
        style={{
          filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
        }}
      >
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </g>
  );
};

export default ConnectionLine;
