![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

![AI Code Generation](https://img.shields.io/badge/🤖_AI_Code-Generation-FF6B6B?style=flat-square&logoColor=white) ![GitHub Integration](https://img.shields.io/badge/🔗_GitHub-Integration-171515?style=flat-square&logo=github&logoColor=white) ![Swagger API](https://img.shields.io/badge/📋_Swagger-API_Docs-85EA2D?style=flat-square&logo=swagger&logoColor=white) ![Pull Request Automation](https://img.shields.io/badge/🔄_Pull_Request-Automation-9B59B6?style=flat-square&logoColor=white)

[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](../LICENSE)

# Backend - ClaudeCodex API

AI-powered REST API backend that generates code using Anthropic ClaudeCode or OpenAI Codex code agents and automatically creates GitHub pull requests.

## 🚀 What It Does

**ClaudeCodex Backend** is an intelligent code generation service that:

1. 🧠 **AI Branch Generation** - Uses AI to create descriptive branch names
2. 🌿 **GitHub Repository Management** - Creates branches and manages repositories
3. 📥 **Code Generation** - Leverages ClaudeCode CLI or Codex CLI for AI-powered coding
4. 💾 **Automated Commits** - Commits generated code with meaningful messages
5. 🔄 **Pull Request Creation** - Automatically creates PRs with generated code
6. 💰 **Cost Tracking** - Provides detailed AI usage and cost analytics

## ⚡ Quick Start

### Development

![Development Mode](https://img.shields.io/badge/🛠️_Development-Mode-F39C12?style=flat&logoColor=white)

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### 🐳 Docker Deployment

#### Using Docker Compose (Recommended)

![Docker Compose](https://img.shields.io/badge/🐙_Docker-Compose-0db7ed?style=flat&logo=docker&logoColor=white)

From the project root:

```bash
# Build and run all services including backend
docker-compose up --build

# Run only backend service
docker-compose up backend

# Production deployment
docker-compose up --build -d
```

The backend service will be available at `http://localhost:3000`.

#### Individual Docker Container

![Docker Build](https://img.shields.io/badge/🔨_Docker-Build-2496ED?style=flat&logo=docker&logoColor=white)

```bash
# Build the Docker image
docker build -t claudecodex-backend .

# Run the container
docker run -d -p 3000:3000 \
  -e GITHUB_CLIENT_SECRET=your_github_client_secret \
  -e GITHUB_TOKEN=your_github_token \
  -e API_KEY=your_api_key \
  claudecodex-backend
```

### 🔧 Environment Variables

![Environment Config](https://img.shields.io/badge/⚙️_Environment-Config-E67E22?style=flat&logoColor=white)

Create a `.env` file in the backend directory:

```env
# GitHub OAuth (Required for OAuth flow)
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# GitHub Token (Optional - alternative to OAuth)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# AI API Keys (CLI Integration)
API_KEY=sk--xxxxxxxxxxxxxxxxxxxxx
```

## 📖 API Documentation

![Interactive Docs](https://img.shields.io/badge/📋_Interactive-Docs-85EA2D?style=plastic&logo=swagger&logoColor=white)

**Swagger UI Available At:**
- **Development**: http://localhost:3000/api-docs
- **Production**: http://your-domain.com:3000/api-docs

## 🛣️ API Endpoints

### 🤖 AI Code Generation & PR Creation (Main Endpoint)

**Complete AI Workflow**

```http
POST /api/dev/execute
Content-Type: multipart/form-data

{
  "prompt": "Add a new feature to calculate user statistics",
  "apiKey": "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx",
  "githubUrl": "https://github.com/username/repository", 
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx", // optional - can use GITHUB_TOKEN env var
  "files": [/* optional file uploads */]
}
```

**What This Endpoint Does:**
1. 🧠 Generates an AI-powered branch name from your prompt
2. 🌿 Creates a new branch in your GitHub repository
3. 📥 Clones the repository locally
4. 🤖 Uses ClaudeCode CLI or Codex CLI to generate/modify code
5. 💾 Commits and pushes the generated changes
6. 🔄 Creates a pull request with the changes
7. 💰 Returns detailed cost and usage analytics

**Response:**
```json
{
  "success": true,
  "message": "Pull request created successfully!",
  "data": {
    "pullRequestUrl": "https://github.com/username/repo/pull/123",
    "branchName": "add-user-statistics-feature", 
    "pullRequestNumber": 123,
    "processedAt": "2024-01-15T10:30:00.000Z",
    "repositoryName": "my-awesome-project",
    "repositoryOwner": "username"
  }
}
```

### 🔐 GitHub Authentication

**Exchange OAuth Code for Access Token**

```http
POST /api/github/auth
Content-Type: application/json

{
  "code": "gho_xxxxxxxxxxxxxxxxxxxx",
  "client_id": "Iv1.a629723000000000", 
  "redirect_uri": "http://localhost:3000/auth/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "GitHub OAuth successful",
  "data": {
    "access_token": "ghp_xxxxxxxxxxxxxxxxxxxx"
  }
}
```

### 🌿 Repository Branches

**Get Repository Branches**

```http
POST /api/github/branches
Content-Type: application/json

{
  "githubUrl": "https://github.com/username/repository",
  "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Branches fetched successfully",
  "data": {
    "branches": [
      {
        "name": "main",
        "protected": true,
        "sha": "abc123..."
      },
      {
        "name": "develop",
        "protected": false,
        "sha": "def456..."
      }
    ]
  }
}
```

### 🏥 Health Check

**System Health Check**

```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z", 
  "uptime": 3600,
  "version": "1.0.0",
  "service": "ClaudeCodex API",
  "environment": "development"
}
```

## 🏗️ Architecture

![Clean Architecture](https://img.shields.io/badge/🏗️_Clean-Architecture-E74C3C?style=flat&logoColor=white)

### Tech Stack

![AI Powered](https://img.shields.io/badge/🤖_AI-Powered-9B59B6?style=flat-square&logo=openai&logoColor=white) ![GitHub API](https://img.shields.io/badge/🔗_GitHub-API-171515?style=flat-square&logo=github&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)

- **Runtime**: Node.js 20+
- **Framework**: Express.js with TypeScript
- **AI Integration**: 
  - Anthropic Claude (via Claude CLI)
  - OpenAI GPT (via Codex CLI)
- **GitHub Integration**: Octokit REST API
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

### Project Structure

```
backend/
├── src/
│   ├── controllers/          # API route handlers
│   │   ├── dev.controller.ts   # Main execute endpoint
│   │   └── github.controller.ts # GitHub operations
│   ├── services/             # Business logic
│   │   ├── ai.service.ts     # AI integration (Claude/GPT)
│   │   ├── github.service.ts # GitHub API operations
│   │   ├── git.service.ts    # Git operations
│   │   └── process.service.ts # Main processing logic
│   ├── routes/               # Express routes
│   │   ├── dev.routes.ts     # Dev endpoints
│   │   ├── github.routes.ts  # GitHub endpoints
│   │   └── index.ts          # Route aggregation
│   ├── types/                # TypeScript interfaces
│   │   └── api.types.ts      # Request/response types
│   ├── config/               # Configuration
│   │   └── swagger.config.ts # API documentation
│   └── index.ts              # Application entry point
├── Dockerfile                # Container configuration
└── package.json              # Dependencies & scripts
```

### AI Providers

![Anthropic Claude](https://img.shields.io/badge/🤖_Anthropic-Claude-FF9500?style=flat-square&logoColor=white) ![OpenAI GPT](https://img.shields.io/badge/🧠_OpenAI-GPT-412991?style=flat-square&logo=openai&logoColor=white)

**Supported AI Models:**
- **Anthropic Claude**: API keys starting with `sk-ant-`
- **OpenAI GPT**: API keys starting with `sk-`

**AI CLI Tools:**
- **Claude CLI**: For Anthropic API integration
- **Codex CLI**: For OpenAI API integration

## 🔄 Workflow

![Automated Workflow](https://img.shields.io/badge/🔄_Automated-Workflow-27AE60?style=flat&logoColor=white)

1. **Authentication** - Exchange GitHub OAuth code for access token
2. **Validation** - Validate API keys, GitHub token, and repository access
3. **Branch Generation** - AI generates a descriptive branch name
4. **Repository Setup** - Create branch and clone repository
5. **Code Generation** - AI generates/modifies code based on prompt
6. **Version Control** - Commit and push changes to new branch
7. **Pull Request** - Create PR with generated changes
8. **Analytics** - Return cost breakdown and usage statistics

## 🚀 Getting Started

1. **Set up GitHub OAuth App** in your GitHub settings
2. **Get AI API Key** from Anthropic or OpenAI
3. **Configure Environment Variables** in `.env` file
4. **Run the Backend** using npm or Docker
5. **Test API** using Swagger UI at `/api-docs`
6. **Integrate Frontend** or use API directly

## 🔧 Development

![Development Tools](https://img.shields.io/badge/🛠️_Development-Tools-3498DB?style=flat&logoColor=white)

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Run tests (if available)
npm test

# Check TypeScript types
npx tsc --noEmit

# Lint code
npm run lint
```

## 📊 Error Handling

All API responses follow a consistent structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details"
}
```

## 🐳 Production Deployment

![Production Ready](https://img.shields.io/badge/🚀_Production-Ready-27AE60?style=flat&logoColor=white)

For production deployment:

1. **Environment Variables**: Set all required environment variables
2. **HTTPS**: Use reverse proxy (nginx) for SSL termination
3. **Process Management**: Use PM2 or Docker for process management
4. **Monitoring**: Set up logging and monitoring
5. **Rate Limiting**: Implement API rate limiting
6. **Security**: Review and configure CORS, helmet settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

![Built with AI](https://img.shields.io/badge/🤖_Built_with-AI-FF6B6B?style=flat-square&logoColor=white) ![TypeScript](https://img.shields.io/badge/💙_TypeScript-Ready-007ACC?style=flat-square&logo=typescript&logoColor=white) 
