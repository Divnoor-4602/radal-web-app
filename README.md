# Radal Web

A modern web application built with Next.js and Convex.

## Tech Stack

- **[Convex](https://convex.dev/)** - Backend (database, server logic)
- **[React](https://react.dev/)** - Frontend (web page interactivity)
- **[Next.js](https://nextjs.org/)** - Optimized web hosting and page routing
- **[Tailwind](https://tailwindcss.com/)** - Building great looking accessible UI

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Development

The application structure:

- `app/` - Next.js app directory with pages and components
- `convex/` - Convex backend functions and database schema
- `components/` - Reusable React components

## Learn More

To learn more about the technologies used:

- [Convex Documentation](https://docs.convex.dev/) - Learn about Convex features
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [React Documentation](https://react.dev/) - Learn React

---

# Backend Integration Guide - Training System

## Overview

This section provides comprehensive guidance for the backend team to implement FastAPI endpoints that integrate with the client-side training system. The client-side uses Next.js server actions to communicate with the FastAPI backend for model training validation and execution.

## Architecture Flow

```
Client UI → Next.js Server Action → FastAPI Backend → Training Infrastructure
```

1. **Client UI**: User submits training graph through React components
2. **Server Action**: `lib/actions/training.actions.ts` processes and validates data
3. **FastAPI Backend**: Deep validation and training job orchestration
4. **Training Infrastructure**: Actual model training execution

## API Endpoint Specifications

### 1. Deep Validation Endpoint

**Endpoint:** `POST /deep_validate`

**Purpose:** Validates the training graph and initiates training jobs

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**

```typescript
{
  "schema_version": 1,
  "nodes": [
    {
      "id": "n-dataset-01",
      "type": "Dataset",
      "props": {
        "uris": ["https://convex-storage-url.com/dataset.csv"]
      }
    },
    {
      "id": "n-basemodel-01",
      "type": "BaseModel",
      "props": {
        "model_id": "microsoft/DialoGPT-medium",
        "quant": "4bit"
      }
    }
  ],
  "edges": [
    {
      "from": "n-dataset-01",
      "to": "n-basemodel-01"
    }
  ],
  "meta": {
    "created_by": "user_12345",
    "created_at": "2024-01-15T10:30:00.000Z",
    "clerk_id": "user_clerk_id",
    "jwt_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

**Success Response:**

```json
{
  "ok": true,
  "job_id": "job_abc123def456",
  "message": "Training job started successfully",
  "estimated_duration": "15-30 minutes"
}
```

**Error Response:**

```json
{
  "ok": false,
  "error": "Invalid dataset format: Expected CSV with columns [input, output]",
  "details": {
    "validation_errors": [
      "Missing required column: output",
      "Dataset contains only 50 rows, minimum 100 required"
    ]
  }
}
```

## Data Types & Validation

### TrainingGraph Schema

```typescript
interface TrainingGraph {
  schema_version: number;
  nodes: TrainingNode[];
  edges: TrainingEdge[];
  meta: TrainingMeta;
}

interface TrainingNode {
  id: string;
  type: "Dataset" | "BaseModel";
  props: DatasetProps | BaseModelProps;
}

interface DatasetProps {
  uris: string[]; // Array of Convex storage URLs
}

interface BaseModelProps {
  model_id: string; // HuggingFace model identifier
  quant: "4bit" | "8bit" | "16bit" | "32bit";
}

interface TrainingEdge {
  from: string; // Node ID
  to: string; // Node ID
}

interface TrainingMeta {
  created_by: string;
  created_at: string; // ISO timestamp
  clerk_id: string;
  jwt_token: string;
}
```

## Authentication

The client sends a JWT token in the `Authorization` header and also includes it in the request body's `meta.jwt_token` field.

**Current Implementation:**

- Header: `Authorization: Bearer dummy-token` (placeholder)
- Body: `meta.jwt_token` contains the actual Clerk JWT

**Backend Requirements:**

1. Validate the JWT token using Clerk's public keys
2. Extract user information from the token
3. Ensure the `meta.clerk_id` matches the token's subject
4. Return `401 Unauthorized` for invalid tokens

## Error Handling & Rollback

The client implements automatic rollback on API failures. If your endpoint returns an error or network failure occurs:

1. Client reverts Convex database changes
2. Project status rolls back to previous state
3. User sees error message with details

**Critical:** Always return proper HTTP status codes:

- `200`: Success
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `422`: Unprocessable Entity (business logic errors)
- `500`: Internal Server Error

## Implementation Requirements

### Key Implementation Steps

1. **Validate JWT Token**: Extract and validate Clerk JWT from Authorization header
2. **Validate Training Graph**: Check required nodes (Dataset, BaseModel) and edges
3. **Download & Validate Dataset**: Fetch files from Convex storage URLs and validate format
4. **Check Model Availability**: Verify HuggingFace model exists and is accessible
5. **Start Training Job**: Create background job and return job ID
6. **Handle Errors**: Return appropriate HTTP status codes for different failure scenarios

### Required Dependencies

- **JWT Validation**: Clerk SDK for token validation
- **HTTP Client**: For downloading datasets from Convex storage
- **Background Tasks**: Job queue system for training execution
- **Logging**: Comprehensive logging for debugging and monitoring

## Testing

### Test Mode

The client includes a test function `submitTrainingGraphTest()` that simulates the entire flow without calling the actual FastAPI endpoint. This is useful for frontend development.

### Integration Testing

Create a test endpoint `/test_integration` that accepts the same TrainingGraph payload and always returns a successful response for integration testing.

## Environment Configuration

**Client-side Environment Variables:**

```
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
FASTAPI_URL=https://api.radal.dev
```

**Backend Environment Variables:**

```
CLERK_SECRET_KEY=your_clerk_secret_key
CONVEX_URL=https://your-convex-deployment.convex.cloud
TRAINING_INFRASTRUCTURE_URL=your_training_service_url
```

## Error Scenarios to Handle

1. **Invalid JWT Token**
   - Return 401 with clear error message
   - Client shows authentication error

2. **Dataset Download Failure**
   - Return 400 with specific error details
   - Client shows validation error with details

3. **Model Not Found**
   - Return 422 with model availability info
   - Client shows model selection error

4. **Training Resource Unavailable**
   - Return 503 with retry information
   - Client shows temporary unavailability message

5. **Training Job Failure**
   - Implement webhook to notify client
   - Update job status in your database

## Monitoring & Logging

Implement comprehensive logging for:

- API requests and responses
- Training job lifecycle
- Error tracking
- Performance metrics

## Next Steps

1. **Implement the `/deep_validate` endpoint** as specified above
2. **Set up Clerk JWT validation** for authentication
3. **Create dataset validation logic** for uploaded files
4. **Implement training job queue** for background processing
5. **Add webhook endpoint** for job status updates
6. **Create monitoring dashboards** for job tracking

## Contact

For questions about this integration, please contact the frontend team or refer to the client-side implementation in `lib/actions/training.actions.ts`.
