"use client";

import React, { type FC } from "react";
import {
  getBezierPath,
  type ConnectionLineComponentProps,
} from "@xyflow/react";
import { getConnectionStrokeColor } from "@/lib/utils";

type ExtendedConnectionLineProps = ConnectionLineComponentProps & {
  fromHandle?: { id?: string };
  toHandle?: { id?: string };
};

const ConnectionLine: FC<ConnectionLineComponentProps> = (props) => {
  const { fromX, fromY, toX, toY, fromPosition, toPosition, connectionStatus } =
    props;

  // Handle objects (may not be in official types yet)
  const { fromHandle, toHandle } = props as ExtendedConnectionLineProps;

  // Generate a smooth bezier path
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: toX,
    targetY: toY,
    targetPosition: toPosition,
  });

  // Get stroke color using utility function
  const strokeColor = getConnectionStrokeColor({
    connectionStatus: connectionStatus === null ? undefined : connectionStatus,
    fromHandleId: fromHandle?.id,
    toHandleId: toHandle?.id,
  });

  return (
    <g>
      {/* invisible path */}
      {/* <path
        fill="none"
        stroke="transparent"
        strokeWidth={15}
        strokeLinecap="round"
        d={edgePath}
        className="react-flow__connection-line-path"
      /> */}

      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={1}
        strokeDasharray="4 4"
        strokeLinecap="round"
        className="animated"
        d={edgePath}
        style={{
          filter: "drop-shadow(0 1px 3px rgba(0, 0, 0, 0.3))",
          opacity: 0.9,
        }}
      />
    </g>
  );
};

export default ConnectionLine;
