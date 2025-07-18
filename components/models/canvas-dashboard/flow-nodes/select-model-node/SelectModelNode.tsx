"use client";

import React from "react";
import { ModelNodeData } from "@/lib/stores/flowStore";
import { Brain, BrainCog } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import CustomPills from "@/components/shared/CustomPills";
import SelectModel from "./SelectModel";
import useFlowStore from "@/lib/stores/flowStore";

type TSelectModelNodeProps = {
  id: string;
  data: ModelNodeData;
  selected?: boolean;
  dragging?: boolean;
};

// selected model types
type TSelectedModel = {
  display_name: string;
  model_id: string;
  description: string;
  parameters: string;
  provider: string;
  providerIcon: StaticImageData;
};

export const SelectModelNode: React.FC<TSelectModelNodeProps> = ({
  id,
  data,
  selected,
  dragging,
}) => {
  const { updateNodeData } = useFlowStore();

  const handleModelChange = (modelId: string) => {
    updateNodeData(id, { selectedModelId: modelId });
  };

  const selectedModelDetails: TSelectedModel | undefined =
    data.selectedModelId && data.selectedModelId !== ""
      ? Object.values(data.availableModels || {}).find(
          (model) => model.model_id === data.selectedModelId,
        ) || undefined
      : undefined;

  return (
    <>
      <div className="relative">
        {/* Main card */}
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
              selectedModelId={data.selectedModelId || ""}
              onModelChange={handleModelChange}
              availableModels={data.availableModels || {}}
            />
            {/* Hugging face link for the model */}
            <div className="flex items-center gap-1 mt-6 ml-1">
              <Image
                src="/images/hf-logo.png"
                alt="Hugging Face"
                width={24}
                height={24}
                priority
                className={`${data.selectedModelId === "" ? "image-muted" : ""}`}
              />
              <div
                className={`text-sm tracking-tighter font-medium ${
                  data.selectedModelId === ""
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
};

export default SelectModelNode;
