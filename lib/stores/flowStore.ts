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
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { nanoid } from "nanoid";
import { availableModels } from "@/constants";
import {
  type DatasetNodeData,
  type ModelNodeData,
  type TrainingNodeData,
  type FlowNodeData,
} from "@/lib/validations/node.schema";
import { isConnectionCompatible } from "@/lib/utils/canvas.utils";

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
  edgeReconnectSuccessful: boolean;
  isReconnecting: boolean;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onReconnectStart: () => void;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
  onReconnectEnd: (event: MouseEvent | TouchEvent, edge: Edge) => void;
  addNode: (
    type: string,
    position: { x: number; y: number },
    projectId?: string,
  ) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  resetFlow: () => void;
  loadExistingFlow: (projectGraph: ProjectGraph) => void;
  isValidConnection: (connection: Edge | Connection) => boolean;
}

const useFlowStore = createWithEqualityFn<FlowState>(
  (set, get) => ({
    nodes: [],
    edges: [],
    edgeReconnectSuccessful: false,
    isReconnecting: false,

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
      // Create edge with handle information - let CustomEdge component handle all colors
      const newEdge: Edge = {
        id: nanoid(),
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: "custom",
        animated: true,
        // No style - let CustomEdge handle colors based on handles
      };

      set({
        edges: [...get().edges, newEdge],
      });
    },

    onReconnectStart: () => {
      set({ edgeReconnectSuccessful: false, isReconnecting: true });
    },

    onReconnect: (oldEdge: Edge, newConnection: Connection) => {
      // Validate the new connection
      const { nodes } = get();
      const sourceNode = nodes.find((node) => node.id === newConnection.source);
      const targetNode = nodes.find((node) => node.id === newConnection.target);

      // Check if both nodes exist and connection is compatible
      const isValid =
        sourceNode && targetNode && isConnectionCompatible(newConnection);

      if (isValid) {
        set({ edgeReconnectSuccessful: true });

        // Create the new edge manually with all properties preserved
        const newEdge: Edge = {
          ...oldEdge,
          source: newConnection.source!,
          target: newConnection.target!,
          sourceHandle: newConnection.sourceHandle,
          targetHandle: newConnection.targetHandle,
        };

        // Remove the old edge and add the new edge
        const updatedEdges = get()
          .edges.filter((e) => e.id !== oldEdge.id)
          .concat(newEdge);
        set({ edges: updatedEdges });
      } else {
        set({ edgeReconnectSuccessful: false });
      }
    },

    onReconnectEnd: (event: MouseEvent | TouchEvent, edge: Edge) => {
      const { edgeReconnectSuccessful } = get();

      if (!edgeReconnectSuccessful) {
        // Delete the edge if reconnection wasn't successful
        set({
          edges: get().edges.filter((e) => e.id !== edge.id),
        });
      }

      set({ edgeReconnectSuccessful: false, isReconnecting: false });
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

      // Ensure no more than one training config can exist on the canvas

      // Check if trying to add a training node when one already exists
      if (type === "training") {
        const existingTrainingNode = currentNodes.find(
          (node) => node.type === "training",
        );
        if (existingTrainingNode) {
          // Don't add another training node - only one is allowed
          return;
        }
      }

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
            sourceHandle: "upload-dataset-output", // Dataset output handle
            targetHandle: "select-model-input", // Model purple input handle
            type: "custom",
            animated: true,
            // No style - let CustomEdge handle colors
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
              sourceHandle: "select-model-output", // Amber output handle
              targetHandle: "training-config-input", // Training input handle
              type: "custom",
              animated: true,
              // No style - let CustomEdge handle colors
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

    isValidConnection: (connection: Edge | Connection) => {
      const { nodes } = get();
      const sourceNode = nodes.find((node) => node.id === connection.source);
      const targetNode = nodes.find((node) => node.id === connection.target);

      // Check if both nodes exist
      if (!sourceNode || !targetNode) return false;

      // Check if connection is compatible based on business rules
      return isConnectionCompatible(connection);
    },
  }),
  shallow,
);

export default useFlowStore;
