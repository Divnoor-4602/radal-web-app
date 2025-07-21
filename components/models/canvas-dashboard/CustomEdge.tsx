"use client";

import React, { type FC } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";

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
}) => {
  // Generate a smooth bezier path
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Use consistent purple color matching your handles
  const strokeColor = "#8142D7";

  return (
    <g>
      {/* Connection line path */}
      <path
        id={id}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
        d={edgePath}
        markerEnd={markerEnd}
        className="animated"
        style={style}
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
