"use client";

import React, { type FC, memo, useMemo } from "react";
import { getBezierPath, type EdgeProps } from "@xyflow/react";
import useFlowStore from "@/lib/stores/flowStore";
import { getConnectionStrokeColor } from "@/lib/utils";

// Optimized CustomEdge component following React Flow performance guidelines
const CustomEdge: FC<EdgeProps> = memo(
  ({
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
    // Use separate selectors to avoid object recreation issues
    const sourceNode = useFlowStore((state) =>
      state.nodes.find((node) => node.id === source),
    );
    const targetNode = useFlowStore((state) =>
      state.nodes.find((node) => node.id === target),
    );
    const currentEdge = useFlowStore((state) =>
      state.edges.find((edge) => edge.id === id),
    );

    // Memoize the expensive bezier path calculation
    const edgePath = useMemo(() => {
      const [path] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });
      return path;
    }, [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition]);

    // Memoize stroke color calculation
    const finalStrokeColor = useMemo(() => {
      return getConnectionStrokeColor({
        sourceNodeType: sourceNode?.type,
        targetNodeType: targetNode?.type,
        sourceHandleId: currentEdge?.sourceHandle || undefined,
        targetHandleId: currentEdge?.targetHandle || undefined,
        isSelected: selected,
      });
    }, [
      sourceNode?.type,
      targetNode?.type,
      currentEdge?.sourceHandle,
      currentEdge?.targetHandle,
      selected,
    ]);

    // Memoize the circle style to prevent object recreation
    const circleStyle = useMemo(
      () => ({
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))",
        opacity: 0.95,
        pointerEvents: "none" as const,
      }),
      [],
    );

    return (
      <g>
        {/* Visible edge path */}
        <path
          id={id}
          d={edgePath}
          fill="none"
          stroke={finalStrokeColor}
          strokeWidth={1}
          strokeDasharray="4 4"
          strokeLinecap="round"
          markerEnd={markerEnd}
          style={style}
        />

        {/* Animated dot */}
        <circle r="3" fill={finalStrokeColor} style={circleStyle}>
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      </g>
    );
  },
);

CustomEdge.displayName = "CustomEdge";

export default CustomEdge;
