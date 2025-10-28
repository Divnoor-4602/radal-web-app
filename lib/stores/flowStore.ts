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
  ReactFlowInstance,
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
import {
  isConnectionCompatible,
  isDuplicateConnection,
  isMeaningfulNodeChange,
  isMeaningfulEdgeChange,
} from "@/lib/utils/canvas.utils";
import { toast } from "sonner";

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
  // Auto-save infrastructure
  autoSaveEnabled: boolean;
  currentFlowKey: string | null;
  rfInstance: ReactFlowInstance | null;
  lastAutoSave: number;
  triggerAutoSave: () => void;
  setAutoSaveContext: (
    flowKey: string,
    rfInstance: ReactFlowInstance | null,
  ) => void;
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
  ) => string | undefined;
  deleteNode: (nodeId: string) => void;
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
  saveFlow: (flowKey: string) => void;
  restoreFlow: (flowKey: string) => boolean;
  clearPersistedState: (flowKey?: string) => void;
  loadModelCanvas: (modelData: {
    _id: string;
    trainingGraph?: {
      schema_version?: number;
      nodes: Record<string, unknown>;
      edges: unknown[];
    };
    baseModelDetails: {
      modelId: string;
      displayName: string;
      provider: string;
      parameters: string;
    };
    datasetIds: string[];
    trainingConfig: {
      epochs: number;
      batch_size: number;
      train_quant: string;
      download_quant: string;
    };
  }) => void; // New function for loading model canvas data
}

const useFlowStore = createWithEqualityFn<FlowState>()(
  (set, get) => ({
    nodes: [],
    edges: [],
    edgeReconnectSuccessful: false,
    isReconnecting: false,
    lastBackendSync: 0,
    isBackendSyncing: false,
    // Auto-save properties
    autoSaveEnabled: true,
    currentFlowKey: null,
    rfInstance: null,
    lastAutoSave: 0,

    triggerAutoSave: () => {
      const { currentFlowKey, rfInstance, autoSaveEnabled, nodes, edges } =
        get();

      if (!autoSaveEnabled || !currentFlowKey) {
        return;
      }

      try {
        // Use store state directly for immediate saves, fallback to rfInstance for viewport
        let flow;
        if (rfInstance) {
          const rfFlow = rfInstance.toObject();
          flow = {
            nodes,
            edges,
            viewport: rfFlow.viewport || { x: 0, y: 0, zoom: 1 },
          };
        } else {
          // Fallback when rfInstance is not available
          flow = {
            nodes,
            edges,
            viewport: { x: 0, y: 0, zoom: 1 },
          };
        }

        localStorage.setItem(currentFlowKey, JSON.stringify(flow));
        const timestamp = Date.now();
        set({ lastAutoSave: timestamp });
      } catch (error) {
        toast.error("Failed to save canvas");
        console.error("Auto-save failed:", error);
      }
    },

    setAutoSaveContext: (
      flowKey: string,
      rfInstance: ReactFlowInstance | null,
    ) => {
      set({
        currentFlowKey: flowKey,
        rfInstance,
        autoSaveEnabled: true,
      });
    },

    onNodesChange: (changes: NodeChange[]) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:onNodesChange calls");
        console.log("flowStore:onNodesChange", {
          changesCount: changes.length,
        });
      }
      const newNodes = applyNodeChanges(changes, get().nodes);
      set({ nodes: newNodes });

      // Trigger auto-save only on meaningful changes
      if (isMeaningfulNodeChange(changes)) {
        get().triggerAutoSave();
      }
    },

    onEdgesChange: (changes: EdgeChange[]) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:onEdgesChange calls");
        console.log("flowStore:onEdgesChange", {
          changesCount: changes.length,
        });
      }
      const newEdges = applyEdgeChanges(changes, get().edges);
      set({ edges: newEdges });

      // Trigger auto-save only on meaningful changes
      if (isMeaningfulEdgeChange(changes)) {
        get().triggerAutoSave();
      }
    },

    onConnect: (connection: Connection) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:onConnect calls");
        console.log("flowStore:onConnect", {
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        });
      }
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

      // Trigger auto-save for new connections
      get().triggerAutoSave();
    },

    onReconnectStart: () => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:onReconnectStart calls");
      }
      set({ edgeReconnectSuccessful: false, isReconnecting: true });
    },

    onReconnect: (oldEdge: Edge, newConnection: Connection) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:onReconnect calls");
        console.log("flowStore:onReconnect", {
          oldEdgeId: oldEdge.id,
          source: newConnection.source,
          target: newConnection.target,
          sourceHandle: newConnection.sourceHandle,
          targetHandle: newConnection.targetHandle,
        });
      }
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
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:onReconnectEnd calls");
        console.log("flowStore:onReconnectEnd", { edgeId: edge.id });
      }
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
    ): string | undefined => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:addNode calls");
        console.log("flowStore:addNode", { type, position, projectId });
      }
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
          toast.error("Only one training node is allowed");
          // Don't add another training node - only one is allowed
          return undefined;
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
          activeTab: "upload",
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
          epochs: 1,
          batchSize: "4",
          quantization: "int8",
          downloadQuant: "int8",
        } as TrainingNodeData;
      } else {
        return undefined;
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

      // Trigger auto-save for new node addition
      get().triggerAutoSave();

      return id; // Return the generated node ID
    },

    deleteNode: (nodeId: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:deleteNode calls");
        console.log("flowStore:deleteNode", { nodeId });
      }
      const { nodes, edges } = get();

      // Remove the node from nodes array
      const filteredNodes = nodes.filter((node) => node.id !== nodeId);

      // Remove all edges connected to this node (both as source and target)
      const filteredEdges = edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      );

      set({
        nodes: filteredNodes,
        edges: filteredEdges,
      });

      // Trigger auto-save for node deletion
      get().triggerAutoSave();
    },

    updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:updateNodeData calls");
        // Only log keys to avoid large payloads
        console.log("flowStore:updateNodeData", {
          nodeId,
          keys: Object.keys(data),
        });
      }
      set({
        nodes: get().nodes.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } }
            : node,
        ),
      });

      // Trigger auto-save for node data updates
      get().triggerAutoSave();
    },

    resetFlow: () => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:resetFlow calls");
      }
      set({
        nodes: [],
        edges: [],
        lastAutoSave: 0, // Reset auto-save timestamp for new projects
      });
    },

    clearPersistedState: (flowKey?: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:clearPersistedState calls");
        console.log("flowStore:clearPersistedState", { flowKey });
      }
      // Clear in-memory state
      set({
        nodes: [],
        edges: [],
        edgeReconnectSuccessful: false,
        isReconnecting: false,
        lastAutoSave: 0, // Reset auto-save timestamp
      });

      // Clear localStorage
      if (flowKey) {
        try {
          localStorage.removeItem(flowKey);
        } catch (error) {
          toast.error("Failed to clear saved data");
          console.error("Failed to clear persisted state:", error);
        }
      }
    },

    saveFlow: (flowKey: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:saveFlow calls");
        console.log("flowStore:saveFlow", { flowKey });
      }
      const { nodes, edges } = get();

      // Create a flow object similar to React Flow's toObject() method
      const flow = {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 }, // Will be updated by the component with actual viewport
      };

      try {
        localStorage.setItem(flowKey, JSON.stringify(flow));
      } catch (error) {
        toast.error("Failed to save canvas");
        console.error("Failed to save flow to localStorage:", error);
      }
    },

    restoreFlow: (flowKey: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:restoreFlow calls");
        console.log("flowStore:restoreFlow", { flowKey });
      }
      try {
        const savedFlow = localStorage.getItem(flowKey);
        if (!savedFlow) {
          return false;
        }

        const flow = JSON.parse(savedFlow);
        if (flow) {
          set({
            nodes: flow.nodes || [],
            edges: flow.edges || [],
          });
          return true;
        }
        return false;
      } catch (error) {
        toast.error("Failed to restore canvas");
        console.error("Failed to restore flow from localStorage:", error);
        return false;
      }
    },

    loadExistingFlow: (projectGraph: ProjectGraph) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:loadExistingFlow calls");
        console.log("flowStore:loadExistingFlow", {
          nodes: projectGraph.nodes.length,
          edges: projectGraph.edges.length,
        });
      }
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
              activeTab: "upload",
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
          style: { stroke: "#8142D7", strokeWidth: 2, strokeLinecap: "round" },
        };
        loadedEdges.push(edge);
      });

      set({
        nodes: loadedNodes,
        edges: loadedEdges,
      });
    },

    isValidConnection: (connection: Edge | Connection) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:isValidConnection calls");
      }
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
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:addConnection calls");
        console.log("flowStore:addConnection", {
          sourceNodeId,
          targetNodeId,
          sourceHandle,
          targetHandle,
        });
      }
      const { nodes, edges } = get();

      // Validate nodes exist
      const sourceNode = nodes.find((node) => node.id === sourceNodeId);
      const targetNode = nodes.find((node) => node.id === targetNodeId);

      if (!sourceNode || !targetNode) {
        toast.error("Invalid connection: nodes not found");
        return false;
      }

      // Ensure node types are defined
      if (!sourceNode.type || !targetNode.type) {
        toast.error("Invalid connection: node types undefined");
        return false;
      }

      // Validate node types match handle expectations
      if (
        !isConnectionCompatible({
          sourceHandle,
          targetHandle,
        })
      ) {
        toast.error("Invalid connection type");
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
        toast.error("Connection not allowed");
        return false;
      }

      if (isDuplicateConnection(connection, edges)) {
        // Don't show error toast for duplicate connections since this can happen
        // in auto-connection scenarios where the system already created the connection
        console.log("Connection already exists, skipping duplicate");
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

      return true;
    },

    deleteConnection: (args: {
      connectionId?: string;
      sourceNodeId?: string;
      targetNodeId?: string;
    }) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:deleteConnection calls");
        console.log("flowStore:deleteConnection", args);
      }
      const { edges } = get();

      let connectionToDelete;

      if (args.connectionId) {
        // Delete by specific connection ID
        connectionToDelete = edges.find(
          (edge) => edge.id === args.connectionId,
        );
        if (!connectionToDelete) {
          toast.error("Connection not found");
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
          toast.error("Connection not found");
          return false;
        }
      } else {
        toast.error("Invalid delete parameters");
        return false;
      }

      // Remove the connection
      set({
        edges: edges.filter((edge) => edge.id !== connectionToDelete.id),
      });

      return true;
    },

    syncToBackend: async (projectId?: string) => {
      if (process.env.NODE_ENV !== "production") {
        console.count("flowStore:syncToBackend calls");
        console.log("flowStore:syncToBackend", { projectId });
      }
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
        toast.error("Failed to sync with server");
        console.error("Backend sync failed:", error);
        set({ isBackendSyncing: false });
        return false;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loadModelCanvas: (_modelData: {
      _id: string;
      trainingGraph?: {
        schema_version?: number;
        nodes: Record<string, unknown>;
        edges: unknown[];
      };
      baseModelDetails: {
        modelId: string;
        displayName: string;
        provider: string;
        parameters: string;
      };
      datasetIds: string[];
      trainingConfig: {
        epochs: number;
        batch_size: number;
        train_quant: string;
        download_quant: string;
      };
    }) => {
      // For now, reset to empty canvas - we'll build a better approach
      set({
        nodes: [],
        edges: [],
        lastAutoSave: 0, // Reset auto-save timestamp for new model
      });
    },
  }),
  shallow,
);

export default useFlowStore;
