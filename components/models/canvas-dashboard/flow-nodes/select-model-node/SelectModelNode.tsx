"use client";

import React, { memo } from "react";
import { type ModelNodeData } from "@/lib/validations/node.schema";
import { type TModelDetail } from "@/lib/validations/model.schema";
import { Brain, BrainCog } from "lucide-react";
import Image from "next/image";
import CustomPills from "@/components/shared/CustomPills";
import SelectModel from "./SelectModel";
import useFlowStore from "@/lib/stores/flowStore";
import { Position } from "@xyflow/react";
import CustomHandle from "../../handles/CustomHandle";
import { useNodeConnections, useNodesData } from "@xyflow/react";

type TSelectModelNodeProps = {
  id: string;
  data: ModelNodeData;
  selected?: boolean;
  dragging?: boolean;
};

export const SelectModelNode: React.FC<TSelectModelNodeProps> = memo(
  ({ id, selected, dragging }) => {
    const { nodes, updateNodeData } = useFlowStore();

    // get the node connections for the model input handle
    const inputNodeConnections = useNodeConnections({
      handleType: "target",
      handleId: "select-model-input",
    });

    // get the node data for the model input handle
    const inputNodeData = useNodesData(inputNodeConnections[0]?.source);

    console.log("inputNodeConnections", inputNodeConnections);
    console.log("inputNodeData", inputNodeData);

    // get the current node data from the nodes
    const currentNode = nodes.find((node) => node.id === id);
    const currentData = currentNode?.data as ModelNodeData;

    const handleModelChange = (modelId: string) => {
      // Find the full model object from available models
      const selectedModelObj = Object.values(
        currentData?.availableModels || {},
      ).find((model) => model.model_id === modelId);

      if (selectedModelObj) {
        updateNodeData(id, { selectedModel: selectedModelObj });
      }
    };

    const selectedModelDetails: TModelDetail | undefined =
      currentData?.selectedModel;

    return (
      <>
        <div className="relative">
          {/* Main card */}
          {/* CustomHandle on the left side input: upload dataset nodes */}
          <CustomHandle
            type="target"
            connectionCount={10}
            position={Position.Left}
            id="select-model-input"
            colorTheme="purple"
            size="md"
            data={{
              nodeId: id,
              dataType: "model",
              payload: {
                format: "model",
                status: currentData?.selectedModel ? "ready" : "processing",
              },
            }}
          />
          {/* CustomHandle on the right side */}
          <CustomHandle
            type="source"
            connectionCount={1}
            position={Position.Right}
            id="select-model-output"
            colorTheme="amber"
            size="md"
          />
          <div
            className={`relative pt-4.5 bg-gradient-to-t from-bg-100 to-bg-400 w-full max-w-[400px] rounded-2xl border custom-project-card-drop-shadow to-[120%] from-[-15%] ${
              selected ? "border-border-highlight" : "border-border-default"
            } ${dragging ? "opacity-70" : ""}`}
          >
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
            <div className="flex flex-col mt-5 mb-6.5 px-5">
              {/* Model selector  */}
              <SelectModel
                selectedModelId={currentData?.selectedModel?.model_id || ""}
                onModelChange={handleModelChange}
                availableModels={currentData?.availableModels || {}}
              />
              {/* Hugging face link for the model */}
              <div className="flex items-center gap-1 mt-6 ml-1">
                <Image
                  src="/images/hf-logo.png"
                  alt="Hugging Face"
                  width={24}
                  height={24}
                  priority
                  className={`${!currentData?.selectedModel ? "image-muted" : ""}`}
                />
                <div
                  className={`text-sm tracking-tighter font-medium ${
                    !currentData?.selectedModel
                      ? "text-text-inactive"
                      : "text-text-primary"
                  }`}
                >
                  View on Hugging Face
                </div>
              </div>
            </div>
            {/* Seperator */}
            <div className="bg-border-default w-full h-[1px]" />
            {/* custom pill div or state showing div */}
            <div className="flex items-center px-5 justify-end py-5">
              {selectedModelDetails ? (
                <CustomPills
                  variant="success"
                  icon={
                    <Image
                      src={selectedModelDetails.providerIcon}
                      alt={selectedModelDetails.provider}
                      width={12}
                      height={12}
                    />
                  }
                  iconPosition="left"
                  size="default"
                  className="tracking-tighter"
                >
                  {selectedModelDetails.display_name}
                </CustomPills>
              ) : (
                <CustomPills
                  variant="info"
                  icon={<Brain strokeWidth={1.5} className="size-4" />}
                  iconPosition="right"
                  size="default"
                  className="tracking-tighter"
                >
                  Select model
                </CustomPills>
              )}
            </div>
          </div>
        </div>
      </>
    );
  },
);

SelectModelNode.displayName = "SelectModelNode";

export default SelectModelNode;
