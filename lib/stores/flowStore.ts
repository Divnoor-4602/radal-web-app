import {
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
} from "@xyflow/react";
import { create } from "zustand";
import { nanoid } from "nanoid";
import { availableModels } from "@/constants";

export interface DatasetNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  files?: File[] | string[];
  datasetId?: string;
  storageId?: string;
  projectId?: string;
  stats?: {
    rows: number;
    columns: number;
    headers: string[];
  };
  preprocessing?: {
    originalColumns: number;
    finalColumns: number;
    removedColumns: number;
    removedIndexColumns: boolean;
    totalRows: number;
  };
  isTrained?: boolean;
}

export interface ModelNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  modelId: string;
  quant: string;
  projectId?: string;
  isTrained?: boolean;
  availableModels?: typeof availableModels;
  selectedModelId?: string;
}

export interface TrainingNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  epochs?: number;
  learningRate?: number;
  batchSize?: number;
  projectId?: string;
  isTrained?: boolean;
}

export type FlowNodeData = DatasetNodeData | ModelNodeData | TrainingNodeData;

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
    set({
      edges: addEdge(connection, get().edges),
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
        files: [],
        datasetId: `dataset_${Date.now()}`,
        projectId: projectId || "",
        stats: {
          rows: 0,
          columns: 0,
          headers: [],
        },
        preprocessing: {
          originalColumns: 0,
          finalColumns: 0,
          removedColumns: 0,
          removedIndexColumns: false,
          totalRows: 0,
        },
        isTrained: false,
      } as DatasetNodeData;
    } else if (type === "model") {
      data = {
        title: "Model Selection",
        description: "Pick a base model and quantization level",
        modelId: "phi-2",
        quant: "int4",
        availableModels: availableModels,
        selectedModelId: "",
      } as ModelNodeData;
    } else if (type === "training") {
      data = {
        title: "Training Configuration",
        description: "Configure training parameters",
        epochs: 3,
        learningRate: 0.001,
        batchSize: 4,
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
      const datasetNode = currentNodes.find((node) => node.type === "dataset");
      if (datasetNode) {
        const edge: Edge = {
          id: nanoid(),
          source: datasetNode.id,
          target: id,
          animated: true,
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        };
        newEdges = [...newEdges, edge];
      }
    } else if (type === "training") {
      const modelNode = currentNodes.find((node) => node.type === "model");
      if (modelNode) {
        const edge: Edge = {
          id: nanoid(),
          source: modelNode.id,
          target: id,
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
        };
        newEdges = [...newEdges, edge];
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
            files: [],
            // Mark as trained/readonly
            isTrained: true,
          } as DatasetNodeData,
        };
        loadedNodes.push(datasetNode);
      } else if (graphNode.type === "BaseModel") {
        const modelNode: Node = {
          id: graphNode.id || `model-${index}`,
          type: "model",
          position: { x: 400 + index * 300, y: 100 },
          data: {
            title: "Base Model (Trained)",
            description: "Previously configured model",
            modelId: graphNode.props?.model_id || "phi-2",
            quant: graphNode.props?.quant || "int4",
            availableModels: availableModels,
            selectedModelId: graphNode.props?.model_id || "phi-2",
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
        animated: true,
        style: { stroke: "#10b981", strokeWidth: 3 }, // Green for trained
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
