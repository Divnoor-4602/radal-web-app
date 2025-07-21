"use client";

import React, { type FC } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import useFlowStore from "@/lib/stores/flowStore";

const CustomEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  source,
  target,
}) => {
  const { nodes, edges } = useFlowStore();

  // Generate a smooth bezier path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine stroke color based on connection type and handle
  const getStrokeColor = () => {
    // Find source and target nodes
    const sourceNode = nodes.find((node) => node.id === source);
    const targetNode = nodes.find((node) => node.id === target);

    // Find the current edge to get handle information
    const currentEdge = edges.find((edge) => edge.id === id);
    const sourceHandle = currentEdge?.sourceHandle;

    // Check for amber handle connections (model -> training via amber handle)
    if (sourceNode?.type === "model" && targetNode?.type === "training") {
      // If coming from the amber handle (select-model-output), use amber color
      if (sourceHandle === "select-model-output") {
        return "#E17100"; // Amber color matching the amber handle
      }
    }

    // Connection from Dataset to SelectModel (purple) - default
    if (sourceNode?.type === "dataset" && targetNode?.type === "model") {
      return "#8142D7"; // Purple color matching purple handles
    }

    // Default purple for any other connections
    return "#8142D7";
  };

  const strokeColor = getStrokeColor();

  return (
    <g>
      {/* Connection line path */}
      <path
        id={id}
        fill="none"
        strokeWidth={1}
        strokeDasharray="4 4"
        strokeLinecap="round"
        d={edgePath}
        markerEnd={markerEnd}
        className="animated"
        style={{
          ...style,
          stroke: strokeColor, // Our calculated color
        }}
        stroke={strokeColor} // Force stroke attribute
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

export default CustomEdge;
