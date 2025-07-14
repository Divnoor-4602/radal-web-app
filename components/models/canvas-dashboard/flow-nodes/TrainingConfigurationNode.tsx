import React from "react";
import { TrainingNodeData } from "@/lib/stores/flowStore";

interface TrainingConfigurationNodeProps {
  id: string;
  data: TrainingNodeData;
}

export const TrainingConfigurationNode: React.FC<
  TrainingConfigurationNodeProps
> = ({
  // id, // TODO: Use id when needed
  data,
}) => {
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

export default TrainingConfigurationNode;
