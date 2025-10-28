# Radal Web

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-Backend-purple?style=flat-square)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

## Overview

Radal is a modern, full-stack web application for building and managing machine learning training workflows. It provides an intuitive visual interface for creating data pipelines, configuring models, and orchestrating training jobs. Built with cutting-edge web technologies, Radal enables users to design complex ML workflows without extensive coding.

## Features

- 🎨 **Visual Workflow Builder** - Drag-and-drop interface for creating model training graphs
- 📊 **Dataset Management** - Upload, manage, and validate datasets for training
- 🤖 **Model Training** - Fine-tune and train models with ease
- 🔐 **Secure Authentication** - Built-in user authentication with Clerk
- ☁️ **Cloud Storage** - Integrated Azure Blob Storage for dataset management
- 📈 **Real-time Updates** - Live sync with Convex backend
- 🎯 **Project Organization** - Create and manage multiple training projects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | [React](https://react.dev/) + [Next.js](https://nextjs.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + Custom Components |
| **Backend** | [Convex](https://convex.dev/) (Database & Server Logic) |
| **Authentication** | [Clerk](https://clerk.com/) |
| **Storage** | [Azure Blob Storage](https://azure.microsoft.com/en-us/services/storage/blobs/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Validation** | [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| **State Management** | Zustand |

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Convex account
- Clerk account (for authentication)
- Azure account (for storage)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Divnoor-4602/radal-web-app.git
cd radal-web-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Azure Storage
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
AZURE_STORAGE_CONTAINER_NAME=datasets

# Backend API (for training)
FASTAPI_URL=https://api.radal.dev
```

4. **Start the development server:**
```bash
npm run dev
```

5. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## Development

### Project Structure

```
radal-web-app/
├── app/                          # Next.js app directory
│   ├── (auth)/                   # Authentication pages (sign-in, sign-up)
│   ├── api/                      # API routes
│   │   ├── assistant/            # AI assistant endpoints
│   │   └── upload-dataset/       # Dataset upload endpoints
│   ├── dashboard/                # Main dashboard
│   ├── projects/                 # Project management pages
│   │   └── [projectId]/          # Project details and models
│   └── layout.tsx                # Root layout
├── components/                   # Reusable React components
│   ├── app-dashboard/            # Dashboard-specific components
│   ├── models/                   # Model builder components
│   │   └── canvas-dashboard/     # Visual workflow builder
│   ├── project-dashboard/        # Project view components
│   ├── shared/                   # Shared UI components
│   └── ui/                       # Base shadcn/ui components
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema
│   ├── projects.ts               # Project queries & mutations
│   ├── models.ts                 # Model queries & mutations
│   ├── datasets.ts               # Dataset queries & mutations
│   ├── users.ts                  # User management
│   └── auth.config.ts            # Authentication config
├── lib/                          # Utility functions
│   ├── actions/                  # Server actions
│   ├── assistant/                # AI assistant utilities
│   ├── azure-storage/            # Azure Blob Storage integration
│   ├── stores/                   # Zustand stores
│   ├── utils/                    # Helper functions
│   └── validations/              # Zod schemas
├── hooks/                        # Custom React hooks
├── public/                       # Static assets
└── middleware.ts                 # Next.js middleware
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type check
npm run type-check
```

### Key Components

- **Canvas Dashboard** - Visual workflow builder with React Flow
- **Model Management** - Create and configure ML models
- **Dataset Upload** - Handle file uploads and validation
- **Assistant Panel** - AI-powered chat for model guidance
- **Project Navigation** - Easy project and model switching

## Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy Radal is on [Vercel](https://vercel.com/), the creators of Next.js.

1. **Push your code to GitHub:**
```bash
git push -u origin main
```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Select your `radal-web-app` repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables:**
   - Add all your `.env.local` variables in Vercel project settings
   - Under "Environment Variables", add:
     - `NEXT_PUBLIC_CONVEX_URL`
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
     - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
     - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
     - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
     - `AZURE_STORAGE_ACCOUNT_NAME`
     - `AZURE_STORAGE_ACCOUNT_KEY`
     - `AZURE_STORAGE_CONTAINER_NAME`
     - `FASTAPI_URL`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy your app
   - You'll get a live URL (e.g., `radal-web-app.vercel.app`)

5. **Automatic Deployments:**
   - Every push to `main` branch triggers automatic deployment
   - Preview deployments for pull requests

### Custom Deployment

For other hosting providers, ensure:
- Node.js 18+ runtime
- Build command: `npm run build`
- Start command: `npm start`
- All environment variables configured

---

## Backend Integration Guide - Training System

### Overview

This section provides comprehensive guidance for the backend team to implement FastAPI endpoints that integrate with the client-side training system. The client-side uses Next.js server actions to communicate with the FastAPI backend for model training validation and execution.

### Architecture Flow

```
Client UI → Next.js Server Action → FastAPI Backend → Training Infrastructure
```

1. **Client UI**: User submits training graph through React components
2. **Server Action**: `lib/actions/training.actions.ts` processes and validates data
3. **FastAPI Backend**: Deep validation and training job orchestration
4. **Training Infrastructure**: Actual model training execution

### API Endpoint Specifications

#### 1. Deep Validation Endpoint

**Endpoint:** `POST /deep_validate`

**Purpose:** Validates the training graph and initiates training jobs

**Headers:**

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Request Body:**

```json
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

### Data Types & Validation

#### TrainingGraph Schema

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

### Authentication

The client sends a JWT token in the `Authorization` header and also includes it in the request body's `meta.jwt_token` field.

**Current Implementation:**

- Header: `Authorization: Bearer dummy-token` (placeholder)
- Body: `meta.jwt_token` contains the actual Clerk JWT

**Backend Requirements:**

1. Validate the JWT token using Clerk's public keys
2. Extract user information from the token
3. Ensure the `meta.clerk_id` matches the token's subject
4. Return `401 Unauthorized` for invalid tokens

### Error Handling & Rollback

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

### Implementation Requirements

#### Key Implementation Steps

1. **Validate JWT Token**: Extract and validate Clerk JWT from Authorization header
2. **Validate Training Graph**: Check required nodes (Dataset, BaseModel) and edges
3. **Download & Validate Dataset**: Fetch files from Convex storage URLs and validate format
4. **Check Model Availability**: Verify HuggingFace model exists and is accessible
5. **Start Training Job**: Create background job and return job ID
6. **Handle Errors**: Return appropriate HTTP status codes for different failure scenarios

#### Required Dependencies

- **JWT Validation**: Clerk SDK for token validation
- **HTTP Client**: For downloading datasets from Convex storage
- **Background Tasks**: Job queue system for training execution
- **Logging**: Comprehensive logging for debugging and monitoring

### Testing

#### Test Mode

The client includes a test function `submitTrainingGraphTest()` that simulates the entire flow without calling the actual FastAPI endpoint. This is useful for frontend development.

#### Integration Testing

Create a test endpoint `/test_integration` that accepts the same TrainingGraph payload and always returns a successful response for integration testing.

### Environment Configuration

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

### Error Scenarios to Handle

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

### Monitoring & Logging

Implement comprehensive logging for:

- API requests and responses
- Training job lifecycle
- Error tracking
- Performance metrics

### Next Steps

1. **Implement the `/deep_validate` endpoint** as specified above
2. **Set up Clerk JWT validation** for authentication
3. **Create dataset validation logic** for uploaded files
4. **Implement training job queue** for background processing
5. **Add webhook endpoint** for job status updates
6. **Create monitoring dashboards** for job tracking

---

## Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- Follow the existing code style and patterns
- Write clear, descriptive commit messages
- Update documentation for new features
- Test your changes thoroughly
- Ensure TypeScript types are properly defined

## Learn More

To learn more about the technologies used:

- [Convex Documentation](https://docs.convex.dev/) - Learn about Convex features
- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features
- [React Documentation](https://react.dev/) - Learn React
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn Tailwind CSS
- [Clerk Documentation](https://clerk.com/docs) - Learn about authentication
- [Zod Documentation](https://zod.dev/) - Learn about schema validation

## Support

For questions or issues:

- Open an issue on GitHub
- Check existing issues for solutions
- Refer to the documentation sections above

---

**Made with love by the Radal Team**
