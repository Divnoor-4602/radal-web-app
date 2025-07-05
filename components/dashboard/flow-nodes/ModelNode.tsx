"use client";

import { Handle, Position, NodeProps } from "@xyflow/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Brain, AlertCircle, CheckCircle } from "lucide-react";
import { useCallback, useState, useEffect } from "react";
import useFlowStore, { ModelNodeData } from "@/lib/stores/flowStore";
import {
  validateModelSelection,
  type ClientModelSelection,
  type ModelId,
  type Quantization,
} from "@/lib/validations/project.schema";

export default function ModelNode({ id, data }: NodeProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useFlowStore((state) => state.nodes);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Array<{ field: string; message: string }>
  >([]);
  const [isValid, setIsValid] = useState(true);

  // Type assertion for data
  const nodeData = data as ModelNodeData;
  const hasDatasetNode = nodes.some((node) => node.type === "dataset");
  const isDisabled = !hasDatasetNode;

  // Validate model configuration whenever data changes
  useEffect(() => {
    if (isDisabled) {
      setValidationErrors([]);
      setIsValid(true);
      return;
    }

    const modelConfig: ClientModelSelection = {
      title: nodeData.title || "",
      description: nodeData.description || "",
      modelId: nodeData.modelId as ModelId,
      quant: nodeData.quant as Quantization,
    };

    const validation = validateModelSelection(modelConfig);

    if (!validation.isValid) {
      setValidationErrors(validation.errors || []);
      setIsValid(false);
    } else {
      setValidationErrors([]);
      setIsValid(true);
    }
  }, [
    nodeData.title,
    nodeData.description,
    nodeData.modelId,
    nodeData.quant,
    isDisabled,
  ]);

  const updateTitle = useCallback(
    (title: string) => {
      if (isDisabled) return;
      updateNodeData(id, { title });
    },
    [id, updateNodeData, isDisabled],
  );

  const updateDescription = useCallback(
    (description: string) => {
      if (isDisabled) return;
      updateNodeData(id, { description });
    },
    [id, updateNodeData, isDisabled],
  );

  const updateModelId = useCallback(
    (modelId: string) => {
      if (isDisabled) return;
      updateNodeData(id, { modelId });
    },
    [id, updateNodeData, isDisabled],
  );

  const updateQuant = useCallback(
    (quant: string) => {
      if (isDisabled) return;
      updateNodeData(id, { quant });
    },
    [id, updateNodeData, isDisabled],
  );

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />

      <Card
        className={`w-80 border-2 border-transparent bg-clip-padding ${
          isDisabled
            ? "bg-gradient-to-br from-gray-100 to-gray-200 opacity-60"
            : "bg-gradient-to-br from-purple-50 to-pink-50"
        }`}
      >
        <div
          className={`absolute inset-0 rounded-lg p-[2px] ${
            isDisabled
              ? "bg-gradient-to-r from-gray-400 to-gray-500"
              : "bg-gradient-to-r from-purple-500 to-pink-600"
          }`}
        >
          <div className="h-full w-full rounded-md bg-white" />
        </div>

        <div className="relative z-10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              {isDisabled ? (
                <AlertCircle className="h-5 w-5 text-gray-500" />
              ) : nodeData.isTrained ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Brain className="h-5 w-5 text-purple-600" />
              )}
              {nodeData.isTrained ? (
                <div className="text-lg font-semibold text-green-800 flex-1">
                  {nodeData.title}
                </div>
              ) : (
                <Input
                  value={nodeData.title}
                  onChange={(e) => updateTitle(e.target.value)}
                  className="text-lg font-semibold border-none shadow-none p-0 h-auto bg-transparent flex-1"
                  placeholder="Model Title"
                  disabled={isDisabled}
                />
              )}
              {nodeData.isTrained && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Trained
                </div>
              )}
            </div>
            {nodeData.isTrained ? (
              <div className="text-sm text-muted-foreground">
                {nodeData.description}
              </div>
            ) : (
              <Input
                value={nodeData.description}
                onChange={(e) => updateDescription(e.target.value)}
                className="text-sm text-muted-foreground border-none shadow-none p-0 h-auto bg-transparent"
                placeholder="Description"
                disabled={isDisabled}
              />
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {nodeData.isTrained ? (
              // Trained state - read-only view
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      Model successfully trained and ready for use
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Base Model
                    </Label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 flex items-center justify-between">
                      <span>{nodeData.modelId}</span>
                      <Badge variant="secondary" className="text-xs">
                        2.7B
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                      Quantization
                    </Label>
                    <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 flex items-center justify-between">
                      <span>{nodeData.quant.toUpperCase()}</span>
                      <Badge variant="outline" className="text-xs">
                        {nodeData.quant === "int4"
                          ? "Efficient"
                          : nodeData.quant === "int8"
                            ? "Balanced"
                            : "High Quality"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-green-600">Model:</span>
                      <div className="font-medium text-green-800">
                        {nodeData.modelId}
                      </div>
                    </div>
                    <div>
                      <span className="text-green-600">Quantization:</span>
                      <div className="font-medium text-green-800">
                        {nodeData.quant}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Editable state - normal configuration flow
              <>
                {isDisabled && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <p className="text-sm text-yellow-800">
                        Add a dataset node first to configure the model
                      </p>
                    </div>
                  </div>
                )}

                {/* Validation Status */}
                {!isDisabled && (
                  <div className="mb-4">
                    {isValid ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <p className="text-sm text-green-800">
                            Model configuration is valid
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <p className="text-sm font-medium text-red-800">
                            Configuration Errors
                          </p>
                        </div>
                        <ul className="text-sm text-red-700 space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{error.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Model Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Base Model</Label>
                  <Select
                    value={nodeData.modelId}
                    onValueChange={updateModelId}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phi-2">
                        <div className="flex items-center gap-2">
                          <span>Phi-2</span>
                          <Badge variant="secondary" className="text-xs">
                            2.7B
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantization Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quantization</Label>
                  <Select
                    value={nodeData.quant}
                    onValueChange={updateQuant}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select quantization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="int4">
                        <div className="flex items-center gap-2">
                          <span>INT4</span>
                          <Badge variant="outline" className="text-xs">
                            Efficient
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="int8">
                        <div className="flex items-center gap-2">
                          <span>INT8</span>
                          <Badge variant="outline" className="text-xs">
                            Balanced
                          </Badge>
                        </div>
                      </SelectItem>
                      <SelectItem value="fp16">
                        <div className="flex items-center gap-2">
                          <span>FP16</span>
                          <Badge variant="outline" className="text-xs">
                            High Quality
                          </Badge>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Info */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <div className="font-medium">{nodeData.modelId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantization:</span>
                      <div className="font-medium">{nodeData.quant}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </div>
      </Card>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}
