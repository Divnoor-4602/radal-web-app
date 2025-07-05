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

export interface DatasetNodeData extends Record<string, unknown> {
  title: string;
  description: string;
  files?: File[] | string[];
  datasetId?: string;
  storageId?: string;
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
  isTrained?: boolean;
}

export type FlowNodeData = DatasetNodeData | ModelNodeData;

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
  addNode: (type: string, position: { x: number; y: number }) => void;
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

  addNode: (type: string, position: { x: number; y: number }) => {
    const id = nanoid();
    const currentNodes = get().nodes;
    const currentEdges = get().edges;
    let data: FlowNodeData;

    if (type === "dataset") {
      data = {
        title: "Dataset",
        description: "Upload your training data",
        files: [],
      } as DatasetNodeData;
    } else if (type === "model") {
      data = {
        title: "Base Model",
        description: "Select your base model for training",
        modelId: "phi-2",
        quant: "int4",
      } as ModelNodeData;
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

    // Auto-connect dataset to model when model is added
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
