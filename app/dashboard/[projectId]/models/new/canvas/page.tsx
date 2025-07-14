"use client";

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  NodeTypes,
  BackgroundVariant,
} from "@xyflow/react";
import React, { useCallback } from "react";
import useFlowStore, {
  DatasetNodeData,
  ModelNodeData,
  TrainingNodeData,
} from "@/lib/stores/flowStore";
import { BrainCog, Info } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Upload dataset node
const UploadDatasetNode = ({ data }: { data: DatasetNodeData }) => {
  return (
    <div className="relative">
      {/* Background div with highlight border */}
      <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
      {/* Main card with precise positioning */}
      <div className="relative pt-5 pb-2 bg-gradient-to-t from-bg-100 to-bg-400 w-full min-w-[380px] rounded-2xl border border-border-default custom-project-card-drop-shadow px-4 to-[120%] from-[-15%] mt-[1px]">
        {/* Card header */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-medium tracking-tighter text-text-primary">
            {data.title}
          </h2>
        </div>
        {/* Card content */}
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-text-muted text-sm">{data.description}</p>
          {data.datasetId && (
            <div className="text-xs text-text-inactive">
              ID: {data.datasetId}
            </div>
          )}
          {data.stats && (
            <div className="text-xs text-text-inactive">
              Rows: {data.stats.rows} | Columns: {data.stats.columns}
            </div>
          )}
          {data.isTrained && (
            <div className="text-xs text-green-500 font-medium">✅ Trained</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Select model node
const SelectModelNode = ({ data }: { data: ModelNodeData }) => {
  return (
    <>
      <div className="relative">
        {/* Background div with highlight border */}
        <div className="absolute inset-0 rounded-2xl border border-border-highlight"></div>
        {/* Main card with precise positioning */}
        <div className="relative py-4.5 bg-gradient-to-t from-bg-100 to-bg-400 w-full max-w-[400px] rounded-2xl border border-border-default custom-project-card-drop-shadow to-[120%] from-[-15%] mt-[1px]">
          {/* Card header */}
          <div className="px-5">
            <div className="flex items-center gap-3">
              {/* icon */}
              <BrainCog className="size-5 text-text-primary" />
              <h2 className="text-base font-medium tracking-tighter text-text-primary">
                Model Selection
              </h2>
            </div>
            {/* Card description */}
            <div className="text-text-muted text-xs mt-4">
              Pick a base model and quantization level. This will be the
              starting point for your fine-tunes.
            </div>
          </div>
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px] my-5" />
          {/* Card content */}
          <div className="flex flex-col mt-5 mb-4 px-5">
            {/* Model selector  */}
            <div className="flex flex-col gap-2">
              {/* label and tooltip */}
              <div className="flex items-center gap-2">
                <Label className="text-text-primary text-sm ml-1">
                  Model Provider
                </Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="size-3 text-gray-500" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="bg-bg-100"
                    arrowClassName="bg-bg-100 fill-bg-100"
                  >
                    <p>Select the model provider for your fine-tune.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select>
                <SelectTrigger className="w-full bg-[#1C1717] border-border-default focus:ring-0 focus:ring-offset-0 focus:outline-none data-[state=open]:ring-0 data-[state=open]:ring-offset-0 [&>svg]:text-[#666666]">
                  <SelectValue
                    placeholder="Select a model"
                    className="text-sm tracking-tight text-[#666666] placeholder:text-[#666666]"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="microsoft/phi-2">
                    Microsoft Phi-2
                  </SelectItem>
                  <SelectItem value="microsoft/phi-3">
                    Microsoft Phi-3
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Hugging face link for the model */}
          </div>
        </div>
      </div>
    </>
  );
};

// Training configuration node
const TrainingConfigurationNode = ({ data }: { data: TrainingNodeData }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-purple-300 min-w-[200px]">
      <div className="flex">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-purple-500">
          ⚙️
        </div>
        <div className="ml-2">
          <div className="text-lg font-bold">{data.title}</div>
          <div className="text-gray-500 text-sm">{data.description}</div>
          {data.epochs && (
            <div className="text-xs text-gray-400">
              Epochs: {data.epochs}, LR: {data.learningRate}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Node types mapping
const nodeTypes: NodeTypes = {
  dataset: UploadDatasetNode,
  model: SelectModelNode,
  training: TrainingConfigurationNode,
};

const CanvasContent = () => {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowStore();
  const { screenToFlowPosition } = useReactFlow();

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

      addNode(type, position);
    },
    [screenToFlowPosition, addNode],
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
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        style={{ backgroundColor: "#090707" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#444444"
          gap={15}
          size={1}
        />
        <Controls />
      </ReactFlow>
    </div>
  );
};

const CanvasPage = () => {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
};

export default CanvasPage;
