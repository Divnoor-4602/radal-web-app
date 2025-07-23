// Zod Schema Validation for Copilot Server Action
// Following zod-validation-rules for runtime validation and type safety

import { z } from "zod";
import {
  DatasetNodeDataSchema,
  ModelNodeDataSchema,
  TrainingNodeDataSchema,
} from "./node.schema";
import {
  QuantizationSchema,
  BatchSizeSchema,
  EpochsSchema,
  DownloadQuantSchema,
} from "./training.schema";

// =============================================================================
// CORE MESSAGE SCHEMAS
// =============================================================================

/**
 * Schema for individual chat messages
 * Validates user/assistant messages in the conversation
 */
export const MessageSchema = z.object({
  role: z.enum(["user", "assistant"], {
    errorMap: () => ({ message: "Role must be either 'user' or 'assistant'" }),
  }),
  content: z.string().min(1, "Message content cannot be empty"),
  toolInvocations: z.array(z.any()).optional(), // Tool calls from AI
});

/**
 * Schema for the complete conversation history
 */
export const ConversationSchema = z.array(MessageSchema).min(1, {
  message: "Conversation must contain at least one message",
});

// =============================================================================
// GRAPH STATE SCHEMAS
// =============================================================================

/**
 * Position schema for node coordinates
 */
export const PositionSchema = z.object({
  x: z.number({
    required_error: "X coordinate is required",
    invalid_type_error: "X coordinate must be a number",
  }),
  y: z.number({
    required_error: "Y coordinate is required",
    invalid_type_error: "Y coordinate must be a number",
  }),
});

/**
 * Schema for graph nodes in the ML pipeline
 * Validates the complete node structure with type-specific data
 */
export const GraphNodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),
  type: z.enum(["dataset", "model", "training"], {
    errorMap: () => ({
      message: "Node type must be 'dataset', 'model', or 'training'",
    }),
  }),
  position: PositionSchema,
  data: z.union(
    [DatasetNodeDataSchema, ModelNodeDataSchema, TrainingNodeDataSchema],
    {
      errorMap: () => ({ message: "Invalid node data structure" }),
    },
  ),
});

/**
 * Schema for graph edges connecting nodes
 */
export const GraphEdgeSchema = z.object({
  id: z.string().min(1, "Edge ID is required"),
  source: z.string().min(1, "Source node ID is required"),
  target: z.string().min(1, "Target node ID is required"),
});

/**
 * Schema for the complete graph state
 * Validates the entire ML pipeline configuration
 */
export const GraphStateSchema = z
  .object({
    nodes: z.array(GraphNodeSchema).max(50, {
      message: "Maximum 50 nodes allowed per graph",
    }),
    edges: z.array(GraphEdgeSchema).max(100, {
      message: "Maximum 100 edges allowed per graph",
    }),
  })
  .refine(
    (data) => {
      // Validate edge references exist in nodes
      const nodeIds = new Set(data.nodes.map((node) => node.id));
      return data.edges.every(
        (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
      );
    },
    {
      message: "All edge source and target nodes must exist in the graph",
      path: ["edges"],
    },
  );

// =============================================================================
// SECURITY & AUTHENTICATION SCHEMAS
// =============================================================================

/**
 * Schema for Clerk user authentication validation
 */
export const ClerkUserSchema = z.object({
  clerkId: z.string().min(1, "Clerk user ID is required"),
  convexUserId: z.string().min(1, "Convex user ID is required"),
});

/**
 * Schema for project ownership validation
 */
export const ProjectAuthSchema = z
  .object({
    projectId: z.string().min(1, "Project ID is required"),
    clerkUserId: z.string().min(1, "User ID is required"),
    projectExists: z.boolean(),
    userHasAccess: z.boolean(),
  })
  .refine((data) => data.projectExists && data.userHasAccess, {
    message: "Project not found or access denied",
    path: ["projectId"],
  });

/**
 * Schema for authenticated request context
 */
export const AuthenticatedRequestSchema = z.object({
  user: ClerkUserSchema,
  project: ProjectAuthSchema,
  timestamp: z.string().datetime({
    message: "Invalid timestamp format",
  }),
});

// =============================================================================
// TOOL PARAMETER SCHEMAS
// =============================================================================

/**
 * Schema for updating node properties
 * Validates tool parameters for modifying existing nodes
 */
export const UpdateNodePropertiesSchema = z.object({
  nodeId: z.string().min(1, "Node ID is required"),
  nodeType: z.enum(["dataset", "model", "training"], {
    errorMap: () => ({ message: "Invalid node type for update operation" }),
  }),
  properties: z
    .object({
      // Training node properties
      epochs: EpochsSchema.optional(),
      batchSize: BatchSizeSchema.optional(),
      quantization: QuantizationSchema.optional(),
      downloadQuant: DownloadQuantSchema.optional(),

      // Model node properties
      selectedModelId: z.string().min(1, "Model ID cannot be empty").optional(),

      // Dataset node properties
      status: z
        .enum(["idle", "error", "success"], {
          errorMap: () => ({ message: "Invalid dataset status" }),
        })
        .optional(),
    })
    .refine((props) => Object.keys(props).length > 0, {
      message: "At least one property must be provided for update",
    }),
});

/**
 * Schema for adding new nodes to the graph
 */
export const AddNodeSchema = z.object({
  nodeType: z.enum(["dataset", "model", "training"], {
    errorMap: () => ({ message: "Invalid node type for add operation" }),
  }),
  position: PositionSchema,
  properties: z
    .object({
      // Training node properties
      epochs: EpochsSchema.optional(),
      batchSize: BatchSizeSchema.optional(),
      quantization: QuantizationSchema.optional(),
      downloadQuant: DownloadQuantSchema.optional(),

      // Model node properties
      selectedModelId: z.string().min(1, "Model ID cannot be empty").optional(),
    })
    .optional(),
});

/**
 * Schema for deleting nodes from the graph
 */
export const DeleteNodeSchema = z.object({
  nodeId: z.string().min(1, "Node ID is required for deletion"),
});

/**
 * Schema for adding new connections to the graph
 * Validates connection compatibility and handle combinations based on canvas.utils.ts
 */
export const AddConnectionSchema = z
  .object({
    sourceNodeId: z.string().min(1, "Source node ID is required"),
    targetNodeId: z.string().min(1, "Target node ID is required"),
    sourceHandle: z.enum(["upload-dataset-output", "select-model-output"], {
      errorMap: () => ({
        message:
          "Invalid source handle - must be upload-dataset-output or select-model-output",
      }),
    }),
    targetHandle: z.enum(["select-model-input", "training-config-input"], {
      errorMap: () => ({
        message:
          "Invalid target handle - must be select-model-input or training-config-input",
      }),
    }),
  })
  .refine(
    (data) => {
      // Validate handle combinations match valid patterns from canvas.utils.ts
      const validCombinations = [
        { source: "upload-dataset-output", target: "select-model-input" }, // dataset → model
        { source: "select-model-output", target: "training-config-input" }, // model → training
      ];

      return validCombinations.some(
        (combo) =>
          combo.source === data.sourceHandle &&
          combo.target === data.targetHandle,
      );
    },
    {
      message:
        "Invalid handle combination - must be dataset→model (upload-dataset-output to select-model-input) or model→training (select-model-output to training-config-input)",
    },
  );

/**
 * Schema for deleting connections from the graph
 * Can accept either specific connectionId or sourceNodeId + targetNodeId
 */
export const DeleteConnectionSchema = z
  .object({
    connectionId: z
      .string()
      .min(1, "Connection ID is required for deletion")
      .optional(),
    sourceNodeId: z.string().min(1, "Source node ID is required").optional(),
    targetNodeId: z.string().min(1, "Target node ID is required").optional(),
  })
  .refine(
    (data) => {
      // Must have either connectionId OR both sourceNodeId and targetNodeId
      const hasConnectionId = data.connectionId && data.connectionId.length > 0;
      const hasNodeIds =
        data.sourceNodeId &&
        data.targetNodeId &&
        data.sourceNodeId.length > 0 &&
        data.targetNodeId.length > 0;

      return hasConnectionId || hasNodeIds;
    },
    {
      message:
        "Must provide either connectionId or both sourceNodeId and targetNodeId",
    },
  );

/**
 * Union schema for all tool invocations
 */
export const ToolInvocationSchema = z.object({
  toolName: z.enum(
    [
      "updateNodeProperties",
      "addNode",
      "deleteNode",
      "addConnection",
      "deleteConnection",
    ],
    {
      errorMap: () => ({ message: "Invalid tool name" }),
    },
  ),
  args: z.union([
    UpdateNodePropertiesSchema,
    AddNodeSchema,
    DeleteNodeSchema,
    AddConnectionSchema,
    DeleteConnectionSchema,
  ]),
});

// =============================================================================
// REQUEST & RESPONSE SCHEMAS
// =============================================================================

/**
 * Complete schema for copilot server action input
 * Validates the entire request payload including security context
 */
export const CopilotRequestSchema = z.object({
  messages: ConversationSchema,
  graphState: GraphStateSchema,
  projectId: z.string().min(1, "Project ID is required"),
  // Auth context will be added by server action
  requestId: z.string().uuid().optional(), // For request tracking
});

/**
 * Schema for successful copilot responses
 */
export const CopilotResponseSchema = z.object({
  success: z.literal(true),
  text: z.string().min(1, "Response text cannot be empty"),
  toolInvocations: z.array(ToolInvocationSchema).max(10, {
    message: "Maximum 10 tool invocations per request",
  }),
  metadata: z
    .object({
      processingTimeMs: z.number().min(0),
      tokenCount: z.number().min(0).optional(),
      requestId: z.string().uuid().optional(),
    })
    .optional(),
});

/**
 * Schema for error responses with structured error information
 */
export const CopilotErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    type: z.enum([
      "validation_error",
      "authentication_error",
      "authorization_error",
      "rate_limit_error",
      "ai_service_error",
      "internal_error",
    ]),
    message: z.string().min(1, "Error message is required"),
    details: z.record(z.unknown()).optional(),
    code: z.string().optional(),
  }),
  requestId: z.string().uuid().optional(),
});

/**
 * Union schema for all possible copilot responses
 */
export const CopilotResponseUnionSchema = z.union([
  CopilotResponseSchema,
  CopilotErrorSchema,
]);

// =============================================================================
// RATE LIMITING SCHEMAS
// =============================================================================

/**
 * Schema for rate limiting context
 */
export const RateLimitSchema = z.object({
  userId: z.string().min(1),
  requestCount: z.number().min(0),
  windowStart: z.string().datetime(),
  isAllowed: z.boolean(),
  resetTime: z.string().datetime().optional(),
});

// =============================================================================
// TYPE EXPORTS - SINGLE SOURCE OF TRUTH
// =============================================================================

// Core types
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type GraphNode = z.infer<typeof GraphNodeSchema>;
export type GraphEdge = z.infer<typeof GraphEdgeSchema>;
export type GraphState = z.infer<typeof GraphStateSchema>;

// Security types
export type ClerkUser = z.infer<typeof ClerkUserSchema>;
export type ProjectAuth = z.infer<typeof ProjectAuthSchema>;
export type AuthenticatedRequest = z.infer<typeof AuthenticatedRequestSchema>;

// Tool types
export type UpdateNodeProperties = z.infer<typeof UpdateNodePropertiesSchema>;
export type AddNode = z.infer<typeof AddNodeSchema>;
export type DeleteNode = z.infer<typeof DeleteNodeSchema>;
export type AddConnection = z.infer<typeof AddConnectionSchema>;
export type DeleteConnection = z.infer<typeof DeleteConnectionSchema>;
export type ToolInvocation = z.infer<typeof ToolInvocationSchema>;

// Request/Response types
export type CopilotRequest = z.infer<typeof CopilotRequestSchema>;
export type CopilotResponse = z.infer<typeof CopilotResponseSchema>;
export type CopilotError = z.infer<typeof CopilotErrorSchema>;
export type CopilotResponseUnion = z.infer<typeof CopilotResponseUnionSchema>;

// Rate limiting types
export type RateLimit = z.infer<typeof RateLimitSchema>;

// =============================================================================
// VALIDATION HELPER FUNCTIONS
// =============================================================================

/**
 * Validates copilot request with comprehensive error handling
 */
export const validateCopilotRequest = (data: unknown) => {
  const result = CopilotRequestSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

/**
 * Validates authentication context
 */
export const validateAuthenticatedRequest = (data: unknown) => {
  const result = AuthenticatedRequestSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

/**
 * Validates graph state for consistency and constraints
 */
export const validateGraphState = (data: unknown) => {
  const result = GraphStateSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

/**
 * Validates tool invocations for security and correctness
 */
export const validateToolInvocation = (data: unknown) => {
  const result = ToolInvocationSchema.safeParse(data);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
        code: issue.code,
      })),
    };
  }
  return {
    isValid: true,
    data: result.data,
  };
};

/**
 * Creates a structured error response
 */
export const createCopilotError = (
  type: CopilotError["error"]["type"],
  message: string,
  details?: Record<string, unknown>,
  requestId?: string,
): CopilotError => {
  return {
    success: false,
    error: {
      type,
      message,
      details,
    },
    requestId,
  };
};

/**
 * Creates a successful copilot response
 */
export const createCopilotResponse = (
  text: string,
  toolInvocations: ToolInvocation[] = [],
  metadata?: CopilotResponse["metadata"],
): CopilotResponse => {
  return {
    success: true,
    text,
    toolInvocations,
    metadata,
  };
};
