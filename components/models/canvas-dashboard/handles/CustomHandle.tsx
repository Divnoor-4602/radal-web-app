"use client";

import { memo, CSSProperties } from "react";
import { Handle, Position, useNodeConnections } from "@xyflow/react";

// Data passed in the handle
export type HandleData = {
  nodeId: string;
  dataType: "dataset" | "model" | "training";
  payload?: {
    format?: string;
    size?: number;
    status?: "ready" | "processing" | "error";
  };
};

// Color theme variants
export type HandleColorTheme = "purple" | "amber";

// Size variants
export type HandleSize = "sm" | "md" | "lg";

// Type definitions using type aliases (per user preference)
type CustomHandleProps = {
  data?: HandleData;
  connectionCount?: number;
  position?: Position;
  type?: "source" | "target";
  id?: string;
  colorTheme?: HandleColorTheme;
  size?: HandleSize;
  customColor?: string;
  style?: CSSProperties;
  className?: string;
};

// Color theme configurations
const COLOR_THEMES = {
  purple: {
    background: "#8142D7",
    border: "#bfdbfe",
    boxShadow: "rgba(129, 66, 215, 0.3)",
  },
  amber: {
    background: "#E17100",
    border: "#FEF3C6",
    boxShadow: "rgba(217, 119, 6, 0.3)",
  },
};

// Size configurations
const SIZE_CONFIGS = {
  sm: { width: 8, height: 8 },
  md: { width: 12, height: 12 },
  lg: { width: 16, height: 16 },
};

const CustomHandle = memo<CustomHandleProps>(
  ({
    data,
    connectionCount = 0,
    position = Position.Right,
    type = "source",
    id = "custom-handle",
    colorTheme = "purple",
    size = "md",
    customColor,
    style = {},
    className = "",
  }) => {
    // Get color theme configuration
    const themeConfig = COLOR_THEMES[colorTheme];
    const sizeConfig = SIZE_CONFIGS[size];

    // Build handle style
    const handleStyle: CSSProperties = {
      ...sizeConfig,
      background: customColor || themeConfig.background,
      border: `1px solid ${themeConfig.border}`,
      borderRadius: "50%",
      transition: "all 0.2s ease-in-out",
      zIndex: 1000,
      boxShadow: `0 0 0 0 ${themeConfig.boxShadow}`,
      ...style, // Allow custom style overrides
    };

    const connections = useNodeConnections({
      handleType: type,
    });

    // Build CSS classes
    const handleClasses = `
      custom-handle 
      custom-handle-drop-shadow 
      custom-handle-glow 
      ${className}
    `.trim();

    return (
      <Handle
        type={type}
        position={position}
        id={id}
        style={handleStyle}
        isConnectable={connections.length < connectionCount}
        className={handleClasses}
        data-handle-data={data ? JSON.stringify(data) : undefined}
      />
    );
  },
);

CustomHandle.displayName = "CustomHandle";

export default CustomHandle;
