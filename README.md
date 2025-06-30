![Status](https://img.shields.io/badge/Status-Alpha-FF6B6B?style=for-the-badge&logo=rocket&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) [![License](https://img.shields.io/badge/License-MIT-4ECDC4?style=for-the-badge&logo=mit&logoColor=white)](LICENSE) ![AI Powered](https://img.shields.io/badge/AI-Powered-9B59B6?style=for-the-badge&logo=openai&logoColor=white)

# ClaudeCodex

ClaudeCodex is the first open-source project that turns the most powerful code agents, such as ANTHROPIC ClaudeCode and OpenAI Codex into background agents, accessible via REST API, MCP, and an interactive frontend

## ✨ Features

![Code Generation](https://img.shields.io/badge/🤖_Code-Generation-45B7D1?style=flat&logoColor=white) ![GitHub Integration](https://img.shields.io/badge/🔗_GitHub-Integration-171515?style=flat&logo=github&logoColor=white) ![MCP Protocol](https://img.shields.io/badge/📡_MCP-Protocol-E74C3C?style=flat&logoColor=white) ![Docker Ready](https://img.shields.io/badge/🐳_Docker-Ready-0db7ed?style=flat&logo=docker&logoColor=white)

## Getting Started

### Production

#### Prerequisites

![Docker](https://img.shields.io/badge/Docker-Required-2496ED?style=plastic&logo=docker&logoColor=white)

#### With Docker Compose (Recommended)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/michael-elkabetz/claudecodex.git
    cd claudecodex
    ```

2.  **Set up environment variables:**

    ```bash
    # Update docker-compose.yml with following github environment variables for github authorization

    VITE_GITHUB_CLIENT_ID=[VITE_GITHUB_CLIENT_ID]
    VITE_GITHUB_REDIRECT_URI=[VITE_GITHUB_REDIRECT_URI]
    GITHUB_CLIENT_SECRET=[GITHUB_CLIENT_SECRET]
    GITHUB_TOKEN=[GITHUB_TOKEN]  # Optional: Set this to use a default GitHub token instead of OAuth
    ```

3.  **Deploy with Docker Compose:**

    ```bash
    # Build and start all services
    docker-compose up --build -d
    
    # View logs
    docker-compose logs -f
    ```

4.  **Access the services:**
    - **Frontend**: http://localhost (port 80)
    - **Backend API**: http://localhost:3000
    - **MCP Server**: http://localhost:12500

#### With Docker (Frontend + Backend)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/michael-elkabetz/claudecodex.git
    cd claudecodex
    ```

2.  **Set up environment variables:**

    ```bash
    # Update main Dockerfile with following github environment variables for github authorization

    VITE_GITHUB_CLIENT_ID=[VITE_GITHUB_CLIENT_ID]
    VITE_GITHUB_REDIRECT_URI=[VITE_GITHUB_REDIRECT_URI]
    GITHUB_CLIENT_SECRET=[GITHUB_CLIENT_SECRET]
    GITHUB_TOKEN=[GITHUB_TOKEN]  # Optional: Set this to use a default GitHub token instead of OAuth
    ```

3.  **Deploy with Docker Compose:**

    ```bash
    # Build Docker image
    docker build -t claudecodex-backend .
    
    #Run Docker image
    docker run -d -p 80:80 claudecodex 

### Development

#### Quick Setup

```bash
# Install dependencies for all services
npm install

# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:frontend    # Frontend only
npm run dev:backend     # Backend only
npm run dev:mcp        # MCP server only
```

#### Development URLs
- **Frontend**: http://localhost
- **Backend**: http://localhost:3000
- **MCP Server**: http://localhost:12500

## 🚀 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Production deployment
docker-compose up --build -d

# Development with hot reload
docker-compose -f docker-compose.dev.yml up --build
```

### Individual Services

```bash
# Frontend
docker build -f frontend/Dockerfile -t claudecodex-frontend ./frontend
docker run -d -p 80:80 claudecodex-frontend

# Backend
docker build -f backend/Dockerfile -t claudecodex-backend ./backend
docker run -d -p 3000:3000 claudecodex-backend

# MCP Server
docker build -f mcp/Dockerfile -t claudecodex-mcp ./mcp
docker run -d -p 12500:12500 claudecodex-mcp
```

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| **frontend** | 80 | React TypeScript UI |
| **backend** | 3000 | Express.js REST API |
| **mcp** | 12500 | Model Context Protocol Server |

## 🔌 MCP Integration

### Connecting to MCP Server

The MCP server runs on port `12500` and provides AI-powered code generation capabilities.

**Connection URL**: `http://localhost:12500`

#### MCP Inspector Setup

![Inspector](https://img.shields.io/badge/🔍_MCP-Inspector-F39C12?style=flat&logoColor=white)

1. **Start the MCP Inspector:**
   ```bash
   npm run inspector
   ```

2. **Open Inspector UI:**
   - Navigate to: **http://127.0.0.1:6274**

3. **Configure Connection:**
   - **Transport Type**: `Streamable HTTP`
   - **MCP Server URL**: `http://localhost:12500`

4. **Authentication:**
   - Copy the `MCP_PROXY_AUTH_TOKEN` from the inspector logs
   - Paste it in the **Proxy Session Token** field
   - Click **Connect**

#### MCP Tools Available

- **Code Generation**: AI-powered code creation
- **GitHub Integration**: Repository management
- **Project Analysis**: Code review and suggestions

## 📖 API Documentation

### Backend Endpoints

![Swagger](https://img.shields.io/badge/📋_API-Docs-85EA2D?style=flat&logo=swagger&logoColor=white)

- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: `GET /health`
- **Generate Code**: `POST /api/generate`
- **GitHub Integration**: `POST /api/github`

### MCP Protocol

![MCP](https://img.shields.io/badge/📡_Protocol-MCP-E67E22?style=flat&logoColor=white)

- **Server Info**: `GET /`
- **Tools List**: `GET /tools`
- **Generate**: `POST /tools/generate`

## 🛠️ Development

### Tech Stack

![Frontend](https://img.shields.io/badge/Frontend-React+TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black) ![Backend](https://img.shields.io/badge/Backend-Express+TypeScript-000000?style=flat-square&logo=express&logoColor=white) ![MCP](https://img.shields.io/badge/MCP-Node.js+TypeScript-339933?style=flat-square&logo=node.js&logoColor=white)

### Project Structure

```
claudecodex/
├── frontend/          # React TypeScript UI
├── backend/           # Express.js API
├── mcp/              # MCP Server
├── docker-compose.yml # Multi-service deployment
└── README.md         # You are here
```

### Available Scripts

```bash
# Root level commands
npm run dev           # Start all services
npm run build         # Build all services
npm run test          # Run all tests
npm run lint          # Lint all projects
npm run clean         # Clean build artifacts

# Service-specific commands
npm run dev:frontend  # Frontend development
npm run dev:backend   # Backend development
npm run dev:mcp       # MCP server development
```

## 🤝 Contributing

![Contributors](https://img.shields.io/badge/Contributors-Welcome-FF6B6B?style=flat&logo=github&logoColor=white) ![PRs](https://img.shields.io/badge/PRs-Welcome-4ECDC4?style=flat&logo=git&logoColor=white)

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[![License](https://img.shields.io/badge/License-MIT-A569BD?style=for-the-badge&logo=mit&logoColor=white)](LICENSE)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

![Claude](https://img.shields.io/badge/Powered_by-Claude-D97757?style=flat&logo=claude&logoColor=white) ![OpenAI](https://img.shields.io/badge/Powered_by-OpenAI-412991?style=flat&logo=openai&logoColor=white) ![GitHub](https://img.shields.io/badge/Hosted_on-GitHub-171515?style=flat&logo=github&logoColor=white)

- Thanks to Anthropic for Claude AI
- Thanks to OpenAI for their amazing models
- Thanks to the open-source community

---

![Built with Love](https://img.shields.io/badge/Built_with-❤️-FF69B4?style=flat&logoColor=white) ![Powered by Coffee](https://img.shields.io/badge/Powered_by-☕-8B4513?style=flat&logoColor=white) 
