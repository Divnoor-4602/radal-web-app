import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  Connection,
} from "@xyflow/react";
import { create } from "zustand";
import { nanoid } from "nanoid";
import { availableModels } from "@/constants";
import {
  type DatasetNodeData,
  type ModelNodeData,
  type TrainingNodeData,
  type FlowNodeData,
} from "@/lib/validations/node.schema";

export interface ProjectGraphNode {
  id: string;
  type: string;
  props?: {
    model_id?: string;
    quant?: string;
    uris?: string[];
  };
}

export interface ProjectGraphEdge {
  from: string;
  to: string;
}

export interface ProjectGraph {
  nodes: ProjectGraphNode[];
  edges: ProjectGraphEdge[];
}

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (
    type: string,
    position: { x: number; y: number },
    projectId?: string,
  ) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  resetFlow: () => void;
  loadExistingFlow: (projectGraph: ProjectGraph) => void;
}

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection: Connection) => {
    // Don't set any style here - let CustomEdge component handle all colors
    const newEdge: Edge = {
      id: nanoid(),
      source: connection.source!,
      target: connection.target!,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
      type: "custom",
      animated: true,
      // Remove style completely - let CustomEdge handle colors
    };

    set({
      edges: [...get().edges, newEdge],
    });
  },

  addNode: (
    type: string,
    position: { x: number; y: number },
    projectId?: string,
  ) => {
    const id = nanoid();
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    let data: FlowNodeData;

    if (type === "dataset") {
      data = {
        title: "Upload Dataset",
        description: "Upload your CSV to be used for tuning the model",
        file: undefined,
        azureUrl: undefined,
        storageId: undefined,
        projectId: projectId || "",
        status: "idle",
      } as DatasetNodeData;
    } else if (type === "model") {
      data = {
        title: "Model Selection",
        description: "Pick a base model and quantization level",
        availableModels: availableModels,
        selectedModel: undefined,
        isTrained: false,
      } as ModelNodeData;
    } else if (type === "training") {
      data = {
        title: "Training Configuration",
        description: "Configure training parameters",
        epochs: 5,
        batchSize: "512",
        quantization: "int8",
        downloadQuant: "int8",
      } as TrainingNodeData;
    } else {
      return;
    }

    const newNode: Node = {
      id,
      type,
      position,
      data,
    };

    const newNodes = [...currentNodes, newNode];
    let newEdges = [...currentEdges];

    // Auto-connect nodes in sequence: dataset -> model -> training
    if (type === "model") {
      const datasetNodes = currentNodes.filter(
        (node) => node.type === "dataset",
      );
      datasetNodes.forEach((datasetNode) => {
        const edge: Edge = {
          id: nanoid(),
          source: datasetNode.id,
          target: id,
          type: "custom",
          animated: true,
          style: { stroke: "#8142D7", strokeWidth: 2 },
        };
        newEdges = [...newEdges, edge];
      });
    } else if (type === "training") {
      const modelNode = currentNodes.find((node) => node.type === "model");
      if (modelNode) {
        // Check if this model already has a training connection (one-to-one rule)
        const modelHasTrainingConnection = currentEdges.some(
          (edge) =>
            edge.source === modelNode.id &&
            currentNodes.find((node) => node.id === edge.target)?.type ===
              "training",
        );

        // Only create connection if model doesn't already have a training connection
        if (!modelHasTrainingConnection) {
          const edge: Edge = {
            id: nanoid(),
            source: modelNode.id,
            target: id,
            type: "custom",
            animated: true,
            style: { stroke: "#E17100", strokeWidth: 1 }, // Amber for model->training connections
          };
          newEdges = [...newEdges, edge];
        }
      }
    }

    set({
      nodes: newNodes,
      edges: newEdges,
    });
  },

  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node,
      ),
    });
  },

  resetFlow: () => {
    set({
      nodes: [],
      edges: [],
    });
  },

  loadExistingFlow: (projectGraph: ProjectGraph) => {
    const loadedNodes: Node[] = [];
    const loadedEdges: Edge[] = [];

    // Convert project graph nodes to ReactFlow nodes
    projectGraph.nodes.forEach((graphNode, index) => {
      if (graphNode.type === "Dataset") {
        const datasetNode: Node = {
          id: graphNode.id || `dataset-${index}`,
          type: "dataset",
          position: { x: 100 + index * 300, y: 100 },
          data: {
            title: "Dataset (Trained)",
            description: "Previously uploaded training data",
            file: undefined,
            azureUrl: undefined,
            storageId: undefined,
            projectId: undefined,
            status: "success",
            // Mark as trained/readonly
            isTrained: true,
          } as DatasetNodeData,
        };
        loadedNodes.push(datasetNode);
      } else if (graphNode.type === "BaseModel") {
        // Find the model from available models
        const selectedModel = Object.values(availableModels).find(
          (model) => model.model_id === graphNode.props?.model_id,
        );

        const modelNode: Node = {
          id: graphNode.id || `model-${index}`,
          type: "model",
          position: { x: 400 + index * 300, y: 100 },
          data: {
            title: "Base Model (Trained)",
            description: "Previously configured model",
            availableModels: availableModels,
            selectedModel: selectedModel,
            // Mark as trained/readonly
            isTrained: true,
          } as ModelNodeData,
        };
        loadedNodes.push(modelNode);
      }
    });

    // Convert project graph edges to ReactFlow edges
    projectGraph.edges.forEach((graphEdge, index) => {
      const edge: Edge = {
        id: `edge-${index}`,
        source: graphEdge.from,
        target: graphEdge.to,
        type: "custom",
        animated: true,
        style: { stroke: "#8142D7", strokeWidth: 2 },
      };
      loadedEdges.push(edge);
    });

    set({
      nodes: loadedNodes,
      edges: loadedEdges,
    });
  },
}));

export default useFlowStore;
