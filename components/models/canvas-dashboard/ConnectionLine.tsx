"use client";

import React, { type FC } from "react";
import {
  getBezierPath,
  type ConnectionLineComponentProps,
  Position,
  type Node,
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

    // Improved node detection - use provided nodes first, then fallback to position-based search
    let sourceNode: Node | null = fromNode || null;
    let targetNode: Node | null = toNode || null;

    console.log("Initial nodes:", {
      fromNode: fromNode?.type,
      toNode: toNode?.type,
      fromPosition,
      toPosition,
    });

    // If nodes not provided, try to find them by position with better tolerance
    if (!sourceNode) {
      const foundNode = nodes.find((node) => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        // More accurate position matching - consider node dimensions
        const tolerance = 100;
        return (
          Math.abs(nodeX - (fromX - 200)) < tolerance &&
          Math.abs(nodeY - (fromY - 25)) < tolerance
        );
      });
      sourceNode = foundNode || null;
      console.log(
        "Found source node by position:",
        sourceNode?.type,
        sourceNode?.id,
      );
    }

    if (!targetNode) {
      const foundNode = nodes.find((node) => {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        const tolerance = 100;
        return (
          Math.abs(nodeX - (toX - 200)) < tolerance &&
          Math.abs(nodeY - (toY - 25)) < tolerance
        );
      });
      targetNode = foundNode || null;
      console.log(
        "Found target node by position:",
        targetNode?.type,
        targetNode?.id,
      );
    }

    console.log("Final node detection:", {
      sourceNodeType: sourceNode?.type,
      targetNodeType: targetNode?.type,
      fromPosition,
      isRightPosition: fromPosition === Position.Right,
      isLeftPosition: fromPosition === Position.Left,
    });

    // Check for amber handle connections - both directions
    // 1. FROM model node's right side (amber output handle)
    if (sourceNode?.type === "model" && fromPosition === Position.Right) {
      console.log(
        "Detected model node with right position (amber output) - checking for existing connections",
      );

      // Only if not violating one-to-one rule
      const modelHasTrainingConnection = edges.some(
        (edge) =>
          edge.source === sourceNode.id &&
          nodes.find((node) => node.id === edge.target)?.type === "training",
      );

      console.log("Model has training connection:", modelHasTrainingConnection);

      if (!modelHasTrainingConnection) {
        console.log("Returning AMBER color for model output!");
        return "#E17100"; // Amber color for model's amber output handle
      }
    }

    // 2. FROM training node's left side (amber input handle)
    if (sourceNode?.type === "training" && fromPosition === Position.Left) {
      console.log(
        "Detected training node with left position (amber input) - returning amber",
      );
      return "#E17100"; // Amber color for training's amber input handle
    }

    // 3. Validation for model -> training connections (when both nodes detected)
    if (sourceNode?.type === "model" && targetNode?.type === "training") {
      console.log(
        "Model to training connection detected - validating constraints",
      );

      // Check if connection is coming from the amber handle (right side of model node)
      const isFromAmberHandle = fromPosition === Position.Right;

      console.log("Is from amber handle:", isFromAmberHandle);

      if (isFromAmberHandle) {
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

        console.log("Connection validation:", {
          modelHasTrainingConnection,
          trainingHasModelConnection,
        });

        // Show red if one-to-one rule would be violated
        if (modelHasTrainingConnection || trainingHasModelConnection) {
          console.log("Returning RED for violation");
          return "#dc2626"; // red-700 for violation
        }

        console.log("Returning AMBER for valid model->training");
        return "#E17100"; // Amber color matching the amber handle
      }
    }

    // Connection from Dataset to SelectModel (purple) - default
    if (sourceNode?.type === "dataset" && targetNode?.type === "model") {
      console.log("Dataset to model connection - returning PURPLE");
      return "#8142D7"; // Purple color matching purple handles
    }

    // Default purple for any other valid connections
    console.log("Returning default PURPLE");
    return "#8142D7";
  };

  const strokeColor = getStrokeColor();

  console.log(strokeColor);

  return (
    <g>
      {/* Connection line path */}
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={1}
        strokeDasharray="4 4"
        strokeLinecap="round"
        d={edgePath}
        className="animated"
      />
      {/* Animated dot that moves along the path */}
      <circle
        r="3"
        fill={strokeColor}
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
