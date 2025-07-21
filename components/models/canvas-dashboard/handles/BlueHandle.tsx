"use client";

import { memo, CSSProperties } from "react";
import { Handle, Position, useNodeConnections } from "@xyflow/react";

// Data passed in the blue handle
export type BlueHandleData = {
  nodeId: string;
  dataType: "dataset" | "model" | "training";
  payload?: {
    format?: string;
    size?: number;
    status?: "ready" | "processing" | "error";
  };
};

// Type definitions using type aliases (per user preference)
type BlueHandleProps = {
  data?: BlueHandleData;
  connectionCount?: number;
  position?: Position;
  type?: "source" | "target";
  id?: string;
  style?: CSSProperties;
};

// Default styling for the blue handle
const DEFAULT_BLUE_HANDLE_STYLE: CSSProperties = {
  width: 12,
  height: 12,
  background: "#732BF4", // Updated fill color
  border: "1px solid #bfdbfe", // 1px border with blue-200
  borderRadius: "50%",
  transition: "all 0.2s ease-in-out",
  zIndex: 1000,
  boxShadow: "0 0 0 0 rgba(115, 43, 244, 0.3)",
};

const BlueHandle = memo<BlueHandleProps>(
  ({
    connectionCount = 0,
    position = Position.Right,
    type = "source",
    id = "blue-handle",
    style = {},
  }) => {
    // Merge custom styles with default styles
    const mergedStyle = {
      ...DEFAULT_BLUE_HANDLE_STYLE,
      ...style,
    };

    const connections = useNodeConnections({
      handleType: type,
    });

    console.log(connections);

    return (
      <Handle
        type={type}
        position={position}
        id={id}
        style={mergedStyle}
        isConnectable={connections.length < connectionCount}
        className={`blue-handle blue-handle-drop-shadow blue-handle-glow`}
      />
    );
  },
);

BlueHandle.displayName = "BlueHandle";

export default BlueHandle;
