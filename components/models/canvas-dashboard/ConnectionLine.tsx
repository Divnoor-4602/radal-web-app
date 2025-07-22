"use client";

import React, { type FC, memo, useMemo } from "react";
import {
  getBezierPath,
  type ConnectionLineComponentProps,
} from "@xyflow/react";
import { getConnectionStrokeColor } from "@/lib/utils";

type ExtendedConnectionLineProps = ConnectionLineComponentProps & {
  fromHandle?: { id?: string };
  toHandle?: { id?: string };
};

const ConnectionLine: FC<ConnectionLineComponentProps> = memo((props) => {
  const { fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus } =
    props;

  // Handle objects (may not be in official types yet)
  const { fromHandle, toHandle } = props as ExtendedConnectionLineProps;

  // Memoize the expensive bezier path calculation
  const edgePath = useMemo(() => {
    const [path] = getBezierPath({
      sourceX: fromX,
      sourceY: fromY,
      sourcePosition: fromPosition,
      targetX: toX,
      targetY: toY,
      targetPosition: toPosition,
    });
    return path;
  }, [fromX, fromY, fromPosition, toX, toY, toPosition]);

  // Memoize stroke color calculation
  const strokeColor = useMemo(() => {
    return getConnectionStrokeColor({
      connectionStatus:
        connectionStatus === null ? undefined : connectionStatus,
      fromHandleId: fromHandle?.id,
      toHandleId: toHandle?.id,
    });
  }, [connectionStatus, fromHandle?.id, toHandle?.id]);

  // Memoize style object to prevent recreation
  const pathStyle = useMemo(
    () => ({
      filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))",
      opacity: 0.9,
    }),
    [],
  );

  return (
    <g>
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={1}
        strokeDasharray="4 4"
        strokeLinecap="round"
        className="animated"
        d={edgePath}
        style={pathStyle}
      />
    </g>
  );
});

ConnectionLine.displayName = "ConnectionLine";

export default ConnectionLine;
