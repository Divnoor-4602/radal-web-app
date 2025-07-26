import { ReactFlowProvider } from "@xyflow/react";
import CanvasContent from "@/components/models/canvas-dashboard/CanvasContent";

const CanvasPage = () => {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
};

export default CanvasPage;
