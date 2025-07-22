"use client";

import React, { type FC, memo, useMemo } from "react";
import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";
import useFlowStore from "@/lib/stores/flowStore";
import { getConnectionStrokeColor } from "@/lib/utils/canvas.utils";

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

    // Memoize selection styling
    const edgeStyle = useMemo(() => {
      if (selected) {
        return {
          ...style,
          stroke: finalStrokeColor,
          strokeWidth: 2,
        };
      }

      return {
        ...style,
        stroke: finalStrokeColor,
        strokeWidth: 1,
      };
    }, [style, finalStrokeColor, selected]);

    return (
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={edgeStyle}
      />
    );
  },
);

CustomEdge.displayName = "CustomEdge";

export default CustomEdge;
