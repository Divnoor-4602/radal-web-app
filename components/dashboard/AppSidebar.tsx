"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Database, Brain, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useFlowStore, { DatasetNodeData } from "@/lib/stores/flowStore";

export function AppSidebar() {
  const resetFlow = useFlowStore((state) => state.resetFlow);
  const nodes = useFlowStore((state) => state.nodes);

  // Check if there's a dataset node with uploaded data
  const hasUploadedDataset = nodes.some(
    (node) =>
      node.type === "dataset" && (node.data as DatasetNodeData).datasetId,
  );

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
  ) => {
    // Prevent dragging model if no dataset exists
    if (nodeType === "model" && !hasUploadedDataset) {
      event.preventDefault();
      return;
    }

    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const isModelDisabled = !hasUploadedDataset;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Flow Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div
                  draggable
                  onDragStart={(event) => handleDragStart(event, "dataset")}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <SidebarMenuButton className="w-full justify-start p-3 h-auto bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 rounded-lg transition-all duration-200">
                    <Database className="h-5 w-5 mr-3 text-blue-600" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-blue-800">
                        Choose Dataset
                      </span>
                      <span className="text-xs text-blue-600">
                        Drag to add dataset node
                      </span>
                    </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div
                  draggable={!isModelDisabled}
                  onDragStart={(event) => handleDragStart(event, "model")}
                  className={`${
                    isModelDisabled
                      ? "cursor-not-allowed"
                      : "cursor-grab active:cursor-grabbing"
                  }`}
                >
                  <SidebarMenuButton
                    className={`w-full justify-start p-3 h-auto border rounded-lg transition-all duration-200 ${
                      isModelDisabled
                        ? "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 opacity-60"
                        : "bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border-purple-200"
                    }`}
                    disabled={isModelDisabled}
                  >
                    <div className="flex items-center w-full">
                      <div className="flex items-center mr-3">
                        {isModelDisabled ? (
                          <AlertCircle className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Brain className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                        <span
                          className={`font-medium ${
                            isModelDisabled
                              ? "text-gray-500"
                              : "text-purple-800"
                          }`}
                        >
                          Select Model
                        </span>
                        <span
                          className={`text-xs ${
                            isModelDisabled
                              ? "text-gray-400"
                              : "text-purple-600"
                          }`}
                        >
                          {isModelDisabled
                            ? "Add dataset first"
                            : "Drag to add model node"}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFlow}
                  className="w-full justify-start"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Flow
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
