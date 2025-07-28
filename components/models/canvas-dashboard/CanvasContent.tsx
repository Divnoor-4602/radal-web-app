"use client";

import {
  Background,
  Controls,
  ReactFlow,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
  ReactFlowInstance,
} from "@xyflow/react";
import React, {
  useCallback,
  useMemo,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, usePathname } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  UploadDatasetNode,
  SelectModelNode,
  TrainingConfigurationNode,
} from "@/components/models/canvas-dashboard/flow-nodes";
import ConnectionLine from "@/components/models/canvas-dashboard/ConnectionLine";
import CustomEdge from "@/components/models/canvas-dashboard/CustomEdge";
// import { Preloaded, usePreloadedQuery } from "convex/react";
// import { api } from "@/convex/_generated/api";
// import { Preloaded } from "convex/react";

// Node types mapping - memoized outside component for stable reference
const nodeTypes: NodeTypes = {
  dataset: UploadDatasetNode,
  model: SelectModelNode,
  training: TrainingConfigurationNode,
};

// Edge types mapping - memoized outside component for stable reference
const edgeTypes = {
  custom: CustomEdge,
};

// type CanvasContentProps = {
//   modelData?: Preloaded<typeof api.models.getModelById>;
//   datasets?: Preloaded<typeof api.datasets.getDatasetsByProject>;
// };

const CanvasContent = ({}) => {
  const { projectId, modelId } = useParams();
  const pathname = usePathname();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onReconnectStart,
    onReconnect,
    onReconnectEnd,
    addNode,
    isValidConnection,
    resetFlow,
    restoreFlow,
  } = useFlowStore();
  const { screenToFlowPosition, setViewport } = useReactFlow();

  // Track if this is the first mount
  const isFirstMount = useRef(true);
  // Track if we've already auto-restored for this flow key
  const hasAutoRestored = useRef<string | null>(null);
  // Track if we're currently resetting to prevent premature auto-restore
  const [isResetting, setIsResetting] = useState(false);

  // Generate flow key based on project and model IDs
  const flowKey = useMemo(() => {
    if (modelId) {
      return `model-flow-${modelId}`;
    } else if (projectId) {
      // Check if we're on the new canvas page
      const isNewCanvasPage = pathname?.includes("/models/new/canvas");
      if (isNewCanvasPage) {
        return `project-canvas-${projectId}`;
      }
      return `project-flow-${projectId}`;
    }
    return "default-flow";
  }, [projectId, modelId, pathname]);

  console.log("flowKey", flowKey);
  console.log("pathname", pathname);
  console.log("modelId", modelId);
  console.log("projectId", projectId);

  // Reset flow only when project or model IDs actually change
  useEffect(() => {
    // Skip reset on first mount (page load), but reset on subsequent changes
    if (isFirstMount.current) {
      isFirstMount.current = false;
      // Reset auto-restore tracking when switching contexts
      hasAutoRestored.current = null;
      setIsResetting(false);
    } else {
      console.log("🔄 Resetting flow for project/model change");
      setIsResetting(true);
      resetFlow();
      // Reset auto-restore tracking when switching contexts
      hasAutoRestored.current = null;

      // Mark reset as complete after a short delay
      setTimeout(() => {
        setIsResetting(false);
      }, 10);
    }
  }, [projectId, modelId, resetFlow]);

  // Auto-restore when React Flow instance is ready
  useEffect(() => {
    if (
      rfInstance &&
      flowKey &&
      hasAutoRestored.current !== flowKey &&
      !isResetting
    ) {
      try {
        const savedFlow = localStorage.getItem(flowKey);
        if (savedFlow) {
          const flow = JSON.parse(savedFlow);
          if (flow && (flow.nodes?.length > 0 || flow.edges?.length > 0)) {
            // Restore nodes and edges via store
            const restored = restoreFlow(flowKey);

            // Restore viewport if restoration was successful
            if (restored && flow.viewport && setViewport) {
              const { x = 0, y = 0, zoom = 1 } = flow.viewport;
              // Small delay to ensure React Flow is ready
              setTimeout(() => {
                setViewport({ x, y, zoom });
              }, 50);
            }

            if (restored) {
              console.log(
                `🔄 Auto-restored flow and viewport for key: ${flowKey}`,
              );
              hasAutoRestored.current = flowKey;
            }
          }
        }
      } catch (error) {
        console.error("❌ Failed to auto-restore flow:", error);
      }
    }
  }, [rfInstance, flowKey, restoreFlow, setViewport, isResetting]);

  // Enhanced save function that includes viewport information
  const onSave = useCallback(() => {
    if (rfInstance && flowKey) {
      const flow = rfInstance.toObject();
      try {
        localStorage.setItem(flowKey, JSON.stringify(flow));
        console.log(`✅ Flow saved to localStorage with key: ${flowKey}`);
      } catch (error) {
        console.error("❌ Failed to save flow to localStorage:", error);
      }
    }
  }, [rfInstance, flowKey]);

  // Enhanced restore function that includes viewport restoration
  const onRestore = useCallback(() => {
    if (!flowKey) return;

    try {
      const savedFlow = localStorage.getItem(flowKey);
      if (!savedFlow) {
        console.log(`📭 No saved flow found for key: ${flowKey}`);
        return;
      }

      const flow = JSON.parse(savedFlow);
      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport || {};

        // Use the store's restoreFlow function for nodes and edges
        const restored = restoreFlow(flowKey);

        // Set viewport if restoration was successful
        if (restored && setViewport) {
          setViewport({ x, y, zoom });
        }

        console.log(`✅ Flow and viewport restored for key: ${flowKey}`);
      }
    } catch (error) {
      console.error("❌ Failed to restore flow:", error);
    }
  }, [flowKey, restoreFlow, setViewport]);

  // Use preloaded data
  // const modelData = usePreloadedQuery(preloadedModelData);
  // const datasets = usePreloadedQuery(preloadedDatasets);

  // Load the canvas with model data when component mounts
  // useEffect(() => {
  //   if (modelData && datasets) {
  //     loadModelCanvas(modelData);
  //   }
  // }, [modelData, datasets, loadModelCanvas]);

  // Memoize style object to prevent unnecessary re-renders
  const canvasStyle = useMemo(() => ({ backgroundColor: "#090707" }), []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position, projectId as string);
    },
    [screenToFlowPosition, addNode, projectId],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div style={{ height: "100%", width: "100%", backgroundColor: "#090707" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        isValidConnection={isValidConnection}
        edgesReconnectable={true}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnectStart={onReconnectStart}
        onReconnect={onReconnect}
        onReconnectEnd={onReconnectEnd}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setRfInstance}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineComponent={ConnectionLine}
        fitView
        style={canvasStyle}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#444444"
          gap={15}
          size={1}
        />
        <Controls />

        {/* Save/Restore Controls Panel */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={onSave}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            disabled={!rfInstance}
          >
            Save
          </button>
          <button
            onClick={onRestore}
            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
          >
            Restore
          </button>
        </div>
      </ReactFlow>
    </div>
  );
};

export default CanvasContent;
