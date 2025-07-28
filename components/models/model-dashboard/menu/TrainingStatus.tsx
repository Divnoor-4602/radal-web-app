import React from "react";

type TrainingStatusProps = {
  status?: "pending" | "training" | "converting" | "ready" | "failed";
  isLoading: boolean;
};

const TrainingStatus = ({ status, isLoading }: TrainingStatusProps) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-[#1C1717] border border-border-default rounded-[10px] px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse" />
        Loading...
      </div>
    );
  }

  // Handle no status (model not found)
  if (!status) {
    return (
      <div className="bg-[#1C1717] border border-border-default rounded-[10px] px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center">
        <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
        No Model
      </div>
    );
  }

  // Define status configurations with live state colors
  const statusConfig = {
    pending: {
      color: "bg-blue-500",
      text: "Pending",
      animate: true,
    },
    training: {
      color: "bg-yellow-400",
      text: "Training",
      animate: true,
    },
    converting: {
      color: "bg-purple-500",
      text: "Converting",
      animate: true,
    },
    ready: {
      color: "bg-green-500",
      text: "Ready",
      animate: false,
    },
    failed: {
      color: "bg-red-500",
      text: "Failed",
      animate: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-[#1C1717] border border-border-default rounded-[10px] px-4 py-1.5 text-sm font-medium tracking-tight flex items-center justify-center">
      <div
        className={`w-2 h-2 ${config.color} rounded-full mr-2 ${config.animate ? "animate-pulse" : ""}`}
      />
      {config.text}
    </div>
  );
};

export default TrainingStatus;
