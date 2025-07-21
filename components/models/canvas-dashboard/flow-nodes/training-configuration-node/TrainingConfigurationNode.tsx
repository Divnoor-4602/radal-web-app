import React from "react";
import { type TrainingNodeData } from "@/lib/validations/node.schema";
import { Sparkles } from "lucide-react";
import CustomPills from "@/components/shared/CustomPills";
import useFlowStore from "@/lib/stores/flowStore";
import SelectQuantization from "./SelectQuantization";
import { availableQuantisations } from "@/constants";
import {
  TBatchSizeSchema,
  TQuantizationSchema,
  TEpochsSchema,
} from "@/lib/validations/training.schema";
import SelectEpochSlider from "./SelectEpochSlider";
import SelectBatchSize from "./SelectBatchSize";
import { Position } from "@xyflow/react";
import CustomHandle from "../../handles/CustomHandle";

type TrainingConfigurationNodeProps = {
  id: string;
  data: TrainingNodeData;
  selected?: boolean;
  dragging?: boolean;
};

export const TrainingConfigurationNode: React.FC<
  TrainingConfigurationNodeProps
> = ({ id, selected, dragging }) => {
  const { nodes, updateNodeData } = useFlowStore();

  // function to handle quantization selection in the state
  const handleQuantizationChange = (
    quantization: TQuantizationSchema,
    type: string,
  ) => {
    if (type === "quantization") {
      updateNodeData(id, { quantization });
    } else if (type === "download") {
      updateNodeData(id, { downloadQuant: quantization });
    }
  };

  // function to handle the batch size selection
  const handleBatchSizeChange = (batchSize: TBatchSizeSchema) => {
    updateNodeData(id, { batchSize });
  };

  // function to handle the epochs selection
  const handleEpochsChange = (epochs: TEpochsSchema) => {
    updateNodeData(id, { epochs });
  };

  // get the current node data
  const currentNode = nodes.find((node) => node.id === id);
  const currentData = currentNode?.data as TrainingNodeData;

  return (
    <>
      <div className="relative">
        {/* CustomHandle on the left side to receive model connections */}
        <CustomHandle
          type="target"
          connectionCount={1}
          position={Position.Left}
          id="training-config-input"
          colorTheme="amber"
          size="md"
          data={{
            nodeId: id,
            dataType: "training",
            payload: {
              format: "training",
              status: "ready",
            },
          }}
        />
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
              <Sparkles className="size-5 text-text-primary" />
              <h2 className="text-base font-medium tracking-tighter text-text-primary">
                {currentData?.title || "Training Configuration"}
              </h2>
            </div>
            {/* Card description */}
            <div className="text-text-muted text-xs mt-4">
              Train with the default settings or customize them, then select the
              model download format.
            </div>
          </div>
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px] my-5" />
          {/* Card content */}
          <div className="flex flex-col mt-5 mb-6.5 px-5 space-y-4">
            {/* Quantization Select */}
            <SelectQuantization
              labelText="Quantization"
              tooltipText="Select the quantization level for your model."
              availableQuantisations={availableQuantisations}
              type="quantization"
              onQuantizationChange={handleQuantizationChange}
              selectedQuantization={currentData?.quantization}
            />
            {/* Epochs Custom Slider */}
            <SelectEpochSlider
              labelText="Epochs"
              tooltipText="Number of training epochs (1-10)"
              selectedEpochs={currentData?.epochs || 1}
              onEpochsChange={handleEpochsChange}
            />
            {/* Batch Size Custom Slider */}
            <SelectBatchSize
              labelText="Batch Size"
              tooltipText="Select the batch size for your model."
              onBatchSizeChange={handleBatchSizeChange}
              selectedBatchSize={currentData?.batchSize}
            />
            {/* Download Quantization Select */}
            <SelectQuantization
              labelText="Download Quantization"
              tooltipText="Select the download quantization level for your model."
              availableQuantisations={availableQuantisations}
              type="download"
              onQuantizationChange={handleQuantizationChange}
              selectedQuantization={currentData?.downloadQuant}
            />
          </div>
          {/* Seperator */}
          <div className="bg-border-default w-full h-[1px]" />
          {/* Status pill */}
          <div className="flex items-center px-5 justify-end py-5">
            <CustomPills
              variant="success"
              size="default"
              className="tracking-tighter text-[8px]"
            >
              Training
            </CustomPills>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrainingConfigurationNode;
