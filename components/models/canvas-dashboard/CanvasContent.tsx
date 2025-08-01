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
import React, { useCallback, useMemo, useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import useFlowStore from "@/lib/stores/flowStore";
import {
  UploadDatasetNode,
  SelectModelNode,
  TrainingConfigurationNode,
} from "@/components/models/canvas-dashboard/flow-nodes";
import ConnectionLine from "@/components/models/canvas-dashboard/ConnectionLine";
import CustomEdge from "@/components/models/canvas-dashboard/CustomEdge";
import { generateFlowKey } from "@/lib/utils/canvas.utils";
import "@xyflow/react/dist/style.css";
import Image from "next/image";
import { Lock } from "lucide-react";

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

type CanvasContentProps = {
  modelGraphData?: {
    nodes: unknown[];
    edges: unknown[];
    viewport: { x: number; y: number; zoom: number };
  } | null;
  isReadOnly?: boolean;
};

const CanvasContent = ({
  modelGraphData,
  isReadOnly = false,
}: CanvasContentProps) => {
  const { projectId, modelId } = useParams();
  const pathname = usePathname();
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);
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
    setAutoSaveContext,
  } = useFlowStore();
  const { screenToFlowPosition, setViewport } = useReactFlow();

  // Generate flow key based on project and model IDs
  const flowKey = useMemo(
    () => generateFlowKey(projectId, modelId, pathname),
    [projectId, modelId, pathname],
  );

  // Set up auto-save context when React Flow instance is ready
  useEffect(() => {
    if (rfInstance && flowKey && projectId && projectId !== "undefined") {
      setAutoSaveContext(flowKey, rfInstance);
      // Set loading to false once ReactFlow is fully initialized
      setIsCanvasLoading(false);
    }
  }, [rfInstance, flowKey, projectId, setAutoSaveContext]);

  // Reset flow when project or model IDs change
  useEffect(() => {
    // Only proceed with valid projectId to prevent SSR issues
    if (projectId && projectId !== "undefined") {
      resetFlow();
    } else {
      console.log("⏳ Reset waiting for valid projectId, current:", projectId);
    }
  }, [projectId, modelId, resetFlow, flowKey]);

  // Load model graph data or restore from localStorage
  useEffect(() => {
    // Add validation for production SSR issues - ensure we have valid params
    const hasValidParams = projectId && projectId !== "undefined" && pathname;

    if (rfInstance && hasValidParams) {
      if (isReadOnly && modelGraphData) {
        // Load from database for read-only mode
        try {
          const { nodes, edges, viewport } = modelGraphData;
          if (nodes?.length || edges?.length) {
            // Create a mock localStorage entry with the model graph data
            const mockFlow = {
              nodes: nodes.map((node: unknown) => ({
                ...(node as Record<string, unknown>),
                data: {
                  ...((node as Record<string, unknown>).data as Record<
                    string,
                    unknown
                  >),
                  isTrained: true, // Mark as trained for read-only view
                },
              })),
              edges: edges || [],
              viewport: viewport || { x: 0, y: 0, zoom: 1 },
            };

            // Temporarily store in localStorage for restoreFlow to use
            const tempKey = `temp-model-${modelId}`;
            localStorage.setItem(tempKey, JSON.stringify(mockFlow));

            // Use existing restoreFlow function
            const restored = restoreFlow(tempKey);

            // Clean up temporary entry
            localStorage.removeItem(tempKey);

            // Set viewport if restoration was successful
            if (restored && viewport && setViewport) {
              setTimeout(() => {
                setViewport(viewport);
              }, 100);
            }
          }
        } catch (error) {
          console.error("Failed to load model graph data:", error);
        }
      } else if (!isReadOnly && flowKey) {
        // Load from localStorage for edit mode
        try {
          const savedFlow = localStorage.getItem(flowKey);
          if (!savedFlow) return;

          const flow = JSON.parse(savedFlow);
          if (!flow || (!flow.nodes?.length && !flow.edges?.length)) return;

          // Restore nodes and edges via store
          const restored = restoreFlow(flowKey);

          // Restore viewport if restoration was successful
          if (restored && flow.viewport && setViewport) {
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setTimeout(() => {
              setViewport({ x, y, zoom });
            }, 50);
          }
        } catch (error) {
          console.error("Failed to auto-restore flow:", error);
        }
      }
    }
  }, [
    rfInstance,
    flowKey,
    restoreFlow,
    setViewport,
    projectId,
    pathname,
    isReadOnly,
    modelGraphData,
    resetFlow,
    modelId,
  ]);

  // Memoize style object to prevent unnecessary re-renders
  const canvasStyle = useMemo(() => ({ backgroundColor: "#090707" }), []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      if (isReadOnly) return; // Disable drop in read-only mode

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
    [screenToFlowPosition, addNode, projectId, isReadOnly],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      if (isReadOnly) return; // Disable drag over in read-only mode

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    [isReadOnly],
  );

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#090707",
        position: "relative",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        isValidConnection={isReadOnly ? () => false : isValidConnection}
        edgesReconnectable={!isReadOnly}
        nodesDraggable={!isReadOnly}
        nodesConnectable={!isReadOnly}
        elementsSelectable={!isReadOnly}
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
        proOptions={{ hideAttribution: true }}
        style={canvasStyle}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#444444"
          gap={15}
          size={1}
        />
        <Controls className="!bg-black" />
      </ReactFlow>

      {/* Read-only overlay */}
      {isReadOnly && !isCanvasLoading && (
        <div className="absolute top-4 right-4 bg-bg-300 text-white px-3 py-2 rounded-lg flex items-center gap-2 z-40">
          <Lock className="size-3" />
          <span className="text-xs font-medium">Locked Model</span>
        </div>
      )}

      {/* Canvas loading overlay */}
      {isCanvasLoading && (
        <div className="absolute inset-0 bg-[#090707] flex items-center justify-center z-50">
          <div className="text-center space-y-4 flex flex-col items-center justify-center">
            <Image
              src="/radal-logo.png"
              alt="Radal Logo"
              priority
              width={40}
              height={40}
              className="object-contain animate-pulse mb-4"
            />
            {/* Loading text */}
            <div className="space-y-2">
              <p className="text-lg text-text-primary font-medium">
                {isReadOnly ? "Loading Trained Model" : "Getting Radal Ready"}
              </p>
              <p className="text-sm text-text-inactive">
                {isReadOnly
                  ? "Reconstructing your workflow..."
                  : "Initializing your workflow..."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasContent;
