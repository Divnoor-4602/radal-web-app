"use client";

import React, { type FC } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import useFlowStore from "@/lib/stores/flowStore";
import { getConnectionStrokeColor } from "@/lib/utils";

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
  selected,
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

  // Get stroke color using utility function
  const sourceNode = nodes.find((node) => node.id === source);
  const targetNode = nodes.find((node) => node.id === target);
  const currentEdge = edges.find((edge) => edge.id === id);

  const finalStrokeColor = getConnectionStrokeColor({
    sourceNodeType: sourceNode?.type,
    targetNodeType: targetNode?.type,
    sourceHandleId: currentEdge?.sourceHandle || undefined,
    targetHandleId: currentEdge?.targetHandle || undefined,
    isSelected: selected,
  });

  return (
    <g>
      {/* Invisible interaction path - larger hit area for selection and reconnection */}
      {/* <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        stroke="transparent"
        strokeWidth={20}
        style={{
          cursor: "pointer",
          pointerEvents: "all",
        }}
      /> */}

      {/* Visible edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={finalStrokeColor}
        strokeWidth={1} // Back to 1px
        strokeDasharray="4 4"
        strokeLinecap="round"
        markerEnd={markerEnd}
        style={{
          ...style,
        }}
      />

      {/* Animated dot */}
      <circle
        r="3"
        fill={finalStrokeColor}
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))",
          opacity: 0.95,
          pointerEvents: "none",
        }}
      >
        <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
      </circle>
    </g>
  );
};

export default CustomEdge;
