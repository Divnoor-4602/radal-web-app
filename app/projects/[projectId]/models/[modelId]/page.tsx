import CanvasContent from "@/components/models/canvas-dashboard/CanvasContent";
import { ReactFlowProvider } from "@xyflow/react";
import React from "react";

const ModelPage = () => {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
};

export default ModelPage;
