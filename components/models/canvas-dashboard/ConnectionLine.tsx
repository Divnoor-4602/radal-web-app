"use client";

import React, { type FC } from "react";
import {
  getBezierPath,
  type ConnectionLineComponentProps,
} from "@xyflow/react";

const ConnectionLine: FC<ConnectionLineComponentProps> = ({
  fromX,
  fromY,
  toX,
  toY,
  fromPosition,
  toPosition,
  connectionStatus,
}) => {
  // Generate a smooth bezier path
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  // Determine the line color based on connection status
  const getStrokeColor = () => {
    if (connectionStatus === "valid") return "#732BF4"; // Purple theme matching your handles
    if (connectionStatus === "invalid") return "#ef4444"; // Red for invalid connections
    return "#732BF4"; // Default purple
  };

  console.log(connectionStatus);

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
        cx={toX}
        cy={toY}
        fill="#fff"
        r={3}
        stroke={getStrokeColor()}
        strokeWidth={1.5}
      />
    </g>
  );
};

export default ConnectionLine;
