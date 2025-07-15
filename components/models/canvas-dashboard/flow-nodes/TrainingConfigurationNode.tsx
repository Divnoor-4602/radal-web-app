import React from "react";
import { TrainingNodeData } from "@/lib/stores/flowStore";

interface TrainingConfigurationNodeProps {
  id: string;
  data: TrainingNodeData;
  selected?: boolean;
  dragging?: boolean;
}

export const TrainingConfigurationNode: React.FC<
  TrainingConfigurationNodeProps
> = ({
  // id, // TODO: Use id when needed
  data,
  selected,
  dragging,
}) => {
  return (
    <div
      className={`px-4 py-2 shadow-md rounded-md bg-white border-2 min-w-[200px] ${
        selected ? "border-border-highlight" : "border-purple-300"
      } ${dragging ? "opacity-70" : ""}`}
    >
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

export default TrainingConfigurationNode;
