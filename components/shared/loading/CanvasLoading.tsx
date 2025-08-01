import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const CanvasLoading = () => {
  return (
    <div className="flex h-full bg-white">
      {/* Model Sidebar skeleton */}
      <div className="w-64 border-r border-border-default bg-white">
        <div className="p-4">
          <Skeleton className="w-32 h-8 bg-bg-100 mb-6" />
          <div className="space-y-3">
            <Skeleton className="w-full h-10 bg-bg-100" />
            <Skeleton className="w-full h-10 bg-bg-100" />
            <Skeleton className="w-full h-10 bg-bg-100" />
            <Skeleton className="w-3/4 h-10 bg-bg-100" />
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Model Topbar skeleton */}
        <div className="h-16 border-b border-border-default bg-white flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-48 h-8 bg-bg-100" />
            <Skeleton className="w-24 h-6 bg-bg-100" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="w-20 h-9 bg-bg-100 rounded-md" />
            <Skeleton className="w-20 h-9 bg-bg-100 rounded-md" />
            <Skeleton className="w-20 h-9 bg-bg-100 rounded-md" />
          </div>
        </div>

        {/* Canvas area skeleton */}
        <div className="flex-1 min-h-0 bg-[#090707] relative">
          {/* Canvas loading animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-6">
              {/* Animated dots */}
              <div className="flex items-center justify-center space-x-2">
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>

              {/* Loading text */}
              <div className="text-white/80 space-y-2">
                <p className="text-lg font-medium">Loading Canvas</p>
                <p className="text-sm text-white/60">
                  Initializing your workflow...
                </p>
              </div>
            </div>
          </div>

          {/* Canvas controls skeleton - positioned like real controls */}
          <div className="absolute bottom-4 left-4">
            <div className="flex flex-col space-y-2">
              <Skeleton className="w-8 h-8 bg-white/20 rounded" />
              <Skeleton className="w-8 h-8 bg-white/20 rounded" />
              <Skeleton className="w-8 h-8 bg-white/20 rounded" />
              <Skeleton className="w-8 h-8 bg-white/20 rounded" />
            </div>
          </div>

          {/* Background pattern hint */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #444444 1px, transparent 1px)",
                backgroundSize: "15px 15px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasLoading;
