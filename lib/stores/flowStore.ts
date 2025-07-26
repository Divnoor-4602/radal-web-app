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
import { persist, createJSONStorage } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { nanoid } from "nanoid";
import { availableModels } from "@/constants";
import {
  type DatasetNodeData,
  type ModelNodeData,
  type TrainingNodeData,
  type FlowNodeData,
} from "@/lib/validations/node.schema";
import {
  isConnectionCompatible,
  isDuplicateConnection,
} from "@/lib/utils/canvas.utils";

// Configuration for smart persistence
// Since we only persist structural changes now, debouncing can be shorter
const PERSISTENCE_DEBOUNCE_MS = 150;

// Create a smart storage wrapper that debounces writes intelligently
const createSmartStorage = () => {
  let writeTimeout: NodeJS.Timeout | null = null;
  let lastSavedState: string | null = null;

  return {
    getItem: (name: string): string | null => {
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    },

    setItem: (name: string, value: string): void => {
      // Clear existing timeout
      if (writeTimeout) {
        clearTimeout(writeTimeout);
      }

      // Check if this is actually a different state
      if (value === lastSavedState) {
        return; // No change, skip save
      }

      // Since we only persist structural changes, use consistent debouncing
      writeTimeout = setTimeout(() => {
        try {
          localStorage.setItem(name, value);
          lastSavedState = value;
        } catch (error) {
          console.error("❌ Failed to persist to localStorage:", error);
        }
      }, PERSISTENCE_DEBOUNCE_MS);
    },

    removeItem: (name: string): void => {
      localStorage.removeItem(name);
      lastSavedState = null;
    },
  };
};

// Helper function to validate node type compatibility
function validateNodeTypeCompatibility(
  sourceNodeType: string,
  targetNodeType: string,
  sourceHandle: string,
  targetHandle: string,
): boolean {
  // Dataset → Model connections
  if (sourceNodeType === "dataset" && targetNodeType === "model") {
    return (
      sourceHandle === "upload-dataset-output" &&
      targetHandle === "select-model-input"
    );
  }

  // Model → Training connections
  if (sourceNodeType === "model" && targetNodeType === "training") {
    return (
      sourceHandle === "select-model-output" &&
      targetHandle === "training-config-input"
    );
  }

  // All other combinations are invalid
  return false;
}

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
  lastBackendSync: number; // Track when we last synced to backend
  isBackendSyncing: boolean; // Track sync status
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
  addConnection: (
    sourceNodeId: string,
    targetNodeId: string,
    sourceHandle: string,
    targetHandle: string,
  ) => boolean;
  deleteConnection: (args: {
    connectionId?: string;
    sourceNodeId?: string;
    targetNodeId?: string;
  }) => boolean;
  syncToBackend: (projectId?: string) => Promise<boolean>; // Manual sync trigger
}

const useFlowStore = createWithEqualityFn<FlowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      edgeReconnectSuccessful: false,
      isReconnecting: false,
      lastBackendSync: 0,
      isBackendSyncing: false,

      onNodesChange: (changes: NodeChange[]) => {
        const newNodes = applyNodeChanges(changes, get().nodes);

        // Apply changes immediately for smooth UX
        set({ nodes: newNodes });
      },

      onEdgesChange: (changes: EdgeChange[]) => {
        const newEdges = applyEdgeChanges(changes, get().edges);

        // Apply changes immediately
        set({ edges: newEdges });
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
        const sourceNode = nodes.find(
          (node) => node.id === newConnection.source,
        );
        const targetNode = nodes.find(
          (node) => node.id === newConnection.target,
        );

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
            title: "Dataset Upload",
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
        const { nodes, edges, isReconnecting } = get();
        const sourceNode = nodes.find((node) => node.id === connection.source);
        const targetNode = nodes.find((node) => node.id === connection.target);

        // Check if both nodes exist
        if (!sourceNode || !targetNode) return false;

        // Check if connection is compatible based on business rules
        if (!isConnectionCompatible(connection)) return false;

        // During reconnection, we need to be more permissive about duplicates
        // because the old edge still exists in the edges array
        if (!isReconnecting) {
          // Normal connection - check for duplicates
          if (isDuplicateConnection(connection, edges)) return false;
        }
        // During reconnection, skip duplicate check since onReconnect handles it

        return true;
      },

      addConnection: (
        sourceNodeId: string,
        targetNodeId: string,
        sourceHandle: string,
        targetHandle: string,
      ) => {
        const { nodes, edges } = get();

        // Validate nodes exist
        const sourceNode = nodes.find((node) => node.id === sourceNodeId);
        const targetNode = nodes.find((node) => node.id === targetNodeId);

        if (!sourceNode || !targetNode) {
          console.error("❌ Source or target node not found", {
            sourceNodeId,
            targetNodeId,
          });
          return false;
        }

        // Ensure node types are defined
        if (!sourceNode.type || !targetNode.type) {
          console.error("❌ Node types are undefined", {
            sourceNodeType: sourceNode.type,
            targetNodeType: targetNode.type,
          });
          return false;
        }

        // Validate node types match handle expectations
        if (
          !validateNodeTypeCompatibility(
            sourceNode.type,
            targetNode.type,
            sourceHandle,
            targetHandle,
          )
        ) {
          console.error("❌ Node types don't match handle combination", {
            sourceType: sourceNode.type,
            targetType: targetNode.type,
            sourceHandle,
            targetHandle,
          });
          return false;
        }

        // Create connection object for validation
        const connection = {
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle,
          targetHandle,
        };

        // Use existing canvas validation utilities
        if (!isConnectionCompatible(connection)) {
          console.error(
            "❌ Connection not compatible with business rules",
            connection,
          );
          return false;
        }

        if (isDuplicateConnection(connection, edges)) {
          console.error("❌ Connection already exists", connection);
          return false;
        }

        // Create new edge with proper styling
        const newEdge: Edge = {
          id: nanoid(),
          source: sourceNodeId,
          target: targetNodeId,
          sourceHandle,
          targetHandle,
          type: "custom",
          animated: true,
          // Let CustomEdge component handle colors based on handles
        };

        set({
          edges: [...edges, newEdge],
        });

        console.log(
          `✅ Added connection: ${sourceNode.type}(${sourceHandle}) → ${targetNode.type}(${targetHandle})`,
        );
        return true;
      },

      deleteConnection: (args: {
        connectionId?: string;
        sourceNodeId?: string;
        targetNodeId?: string;
      }) => {
        const { edges } = get();

        let connectionToDelete;

        if (args.connectionId) {
          // Delete by specific connection ID
          connectionToDelete = edges.find(
            (edge) => edge.id === args.connectionId,
          );
          if (!connectionToDelete) {
            console.error("❌ Connection not found", {
              connectionId: args.connectionId,
            });
            return false;
          }
        } else if (args.sourceNodeId && args.targetNodeId) {
          // Delete by source and target node IDs
          connectionToDelete = edges.find(
            (edge) =>
              edge.source === args.sourceNodeId &&
              edge.target === args.targetNodeId,
          );
          if (!connectionToDelete) {
            console.error("❌ Connection not found between nodes", {
              sourceNodeId: args.sourceNodeId,
              targetNodeId: args.targetNodeId,
            });
            return false;
          }
        } else {
          console.error(
            "❌ Must provide either connectionId or both sourceNodeId and targetNodeId",
          );
          return false;
        }

        // Remove the connection
        set({
          edges: edges.filter((edge) => edge.id !== connectionToDelete.id),
        });

        console.log(
          `✅ Deleted connection: ${connectionToDelete.source} → ${connectionToDelete.target} (ID: ${connectionToDelete.id})`,
        );
        return true;
      },

      syncToBackend: async (projectId?: string) => {
        const { isBackendSyncing, nodes, edges } = get();

        if (isBackendSyncing) {
          return false;
        }

        if (!projectId) {
          return false;
        }

        try {
          set({ isBackendSyncing: true });

          // Transform flow state to backend format
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const trainingGraph = {
            schema_version: 1,
            nodes: nodes.reduce(
              (acc, node) => {
                acc[node.id] = {
                  id: node.id,
                  type: node.type,
                  position: node.position,
                  data: node.data,
                };
                return acc;
              },
              {} as Record<string, unknown>,
            ),
            edges: edges.map((edge) => ({
              id: edge.id,
              source: edge.source,
              target: edge.target,
              sourceHandle: edge.sourceHandle,
              targetHandle: edge.targetHandle,
            })),
          };

          // TODO: Call the Convex updateModelTrainingGraph function
          // This would require accessing the Convex client from the store

          set({
            lastBackendSync: Date.now(),
            isBackendSyncing: false,
          });

          return true;
        } catch (error) {
          console.error("❌ Backend sync failed:", error);
          set({ isBackendSyncing: false });
          return false;
        }
      },
    }),
    {
      name: "flow-storage",
      storage: createJSONStorage(() => createSmartStorage()),
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
      // Add additional optimization
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("❌ Flow state rehydration failed:", error);
          }
        };
      },
    },
  ),
  shallow,
);

export default useFlowStore;
