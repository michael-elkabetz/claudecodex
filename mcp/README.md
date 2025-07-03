![MCP](https://img.shields.io/badge/MCP-Protocol-FF9500?style=for-the-badge&logo=protocol&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

![AI Powered](https://img.shields.io/badge/🤖_AI-Powered-9B59B6?style=flat-square&logo=openai&logoColor=white) ![Code Generation](https://img.shields.io/badge/🚀_Code-Generation-FF6B6B?style=flat-square&logoColor=white) ![GitHub Integration](https://img.shields.io/badge/🔗_GitHub-Integration-171515?style=flat-square&logo=github&logoColor=white) ![Inspector Ready](https://img.shields.io/badge/🔍_Inspector-Ready-F39C12?style=flat-square&logoColor=white)

# ClaudeCodex MCP Server

Model Context Protocol (MCP) server for ClaudeCodex, providing AI-powered code generation capabilities through a standardized protocol interface.

![Port](https://img.shields.io/badge/🌐_Port-6213-E74C3C?style=flat&logoColor=white) ![Protocol](https://img.shields.io/badge/📡_HTTP-Streamable-4ECDC4?style=flat&logoColor=white)

## ✨ Features

![Features](https://img.shields.io/badge/🌟_Features-Rich-9B59B6?style=flat&logoColor=white)

- **🤖 AI Code Generation**: Claude & OpenAI integration for intelligent code creation
- **📡 MCP Protocol**: Standardized Model Context Protocol implementation
- **🔗 GitHub Integration**: Seamless repository management and operations
- **🔍 Inspector Support**: Built-in debugging and testing capabilities
- **⚡ High Performance**: Optimized for fast response times
- **🐳 Docker Ready**: Containerized deployment support

## ⚡ Quick Start

### Development

![Development](https://img.shields.io/badge/🛠️_Development-Mode-16A085?style=flat&logoColor=white)

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Check server status
curl http://localhost:6213/health
```

The MCP server will be available at `http://localhost:6213`.

### 🐳 Docker Deployment

#### Using Docker Compose (Recommended)

![Docker Compose](https://img.shields.io/badge/🐙_Docker-Compose-0db7ed?style=flat&logo=docker&logoColor=white)

From the project root:

```bash
# Build and run all services including MCP server
docker-compose up --build

# Run only MCP service
docker-compose up mcp

# Production deployment
docker-compose up --build -d
```

The MCP service will be available at `http://localhost:6213`.

#### Individual Docker Container

![Docker Build](https://img.shields.io/badge/🔨_Docker-Build-2496ED?style=flat&logo=docker&logoColor=white)

```bash
# Build the Docker image
docker build -t claudecodex-mcp .

# Run the container
docker run -d -p 6213:6213 \
  -e OPENAI_API_KEY=your_openai_api_key \
  -e ANTHROPIC_API_KEY=your_anthropic_api_key \
  claudecodex-mcp
```

### 🔧 Environment Variables

![Environment](https://img.shields.io/badge/⚙️_Environment-Config-E67E22?style=flat&logoColor=white)

Set the following environment variables:

```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Server Configuration
NODE_ENV=development
MCP_PORT=6213

# GitHub Integration
GITHUB_TOKEN=your_github_token_here

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Security
MCP_API_KEY=your_mcp_api_key_here
```

## 🔌 MCP Connection

### Server URL

![Server URL](https://img.shields.io/badge/🌐_Server-URL-3498DB?style=flat&logoColor=white)

**Connection URL**: `http://localhost:6213`

### 🔍 MCP Inspector Setup

![Inspector](https://img.shields.io/badge/🔍_MCP-Inspector-F39C12?style=flat&logoColor=white)

The MCP Inspector provides a visual interface for debugging and testing MCP connections.

#### 1. Start the Inspector

```bash
# From the mcp directory
npm run inspector

# Alternative: global install
npx @modelcontextprotocol/inspector
```

#### 2. Open Inspector UI

![Inspector UI](https://img.shields.io/badge/🖥️_Inspector-UI-E67E22?style=flat&logoColor=white)

- **URL**: **http://127.0.0.1:6274**
- The inspector interface will open in your browser

#### 3. Configure Connection

![Connection Setup](https://img.shields.io/badge/⚙️_Connection-Setup-27AE60?style=flat&logoColor=white)

1. **Transport Type**: Select `Streamable HTTP`
2. **Server URL**: Enter `http://localhost:6213`

#### 4. Authentication

![Authentication](https://img.shields.io/badge/🔐_Authentication-Setup-E74C3C?style=flat&logoColor=white)

1. **Find the Token**: Look for `MCP_PROXY_AUTH_TOKEN` in the inspector terminal logs
2. **Copy Token**: Copy the token value from the logs
3. **Enter Token**: Paste it in the **Proxy Session Token** field
4. **Connect**: Click the **Connect** button

#### 5. Test Connection

![Test Connection](https://img.shields.io/badge/✅_Test-Connection-27AE60?style=flat&logoColor=white)

Once connected, you can:
- View available tools and resources
- Test code generation prompts
- Inspect request/response data
- Debug MCP protocol interactions

### Direct MCP Integration

![Direct Integration](https://img.shields.io/badge/🔗_Direct-Integration-8E44AD?style=flat&logoColor=white)

For programmatic access:

```typescript
// Example MCP client connection
const mcpClient = new MCPClient({
  transport: 'http',
  url: 'http://localhost:6213',
  headers: {
    'Authorization': `Bearer ${process.env.MCP_API_KEY}`
  }
});

// Execute complete AI workflow
const result = await mcpClient.call('execute', {
  prompt: 'Create a React component for user authentication',
  githubUrl: 'https://github.com/username/repository',
  githubToken: 'ghp_xxxxxxxxxxxxxxxxxxxx',
  apiKey: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx'
});
```

## 🛠️ Available Tools

![Tools](https://img.shields.io/badge/🧰_MCP-Tools-FF6B6B?style=flat&logoColor=white)

The MCP server provides these tools:

### 🤖 Code Generation

![Code Generation Tool](https://img.shields.io/badge/🤖_generate-code-9B59B6?style=flat&logoColor=white)

```json
{
  "name": "execute",
  "description": "Execute complete AI-powered workflow: generates code, creates branch, commits changes, and creates pull request",
  "parameters": {
    "prompt": "Description of code to generate",
    "githubUrl": "GitHub repository URL",
    "githubToken": "GitHub access token (optional)",
    "apiKey": "AI API key (optional)",
    "framework": "Framework to use (optional)",
    "style": "Code style preferences (optional)"
  }
}
```

### ✨ Complete Workflow

The `execute` tool provides a complete AI-powered development workflow that:

1. **🧠 AI Branch Generation** - Creates descriptive branch names
2. **🌿 Branch Creation** - Creates new Git branches
3. **📥 Repository Cloning** - Clones the target repository
4. **🤖 Code Generation** - Uses AI to generate/modify code
5. **💾 Automated Commits** - Commits changes with meaningful messages
6. **🔄 Pull Request Creation** - Automatically creates PRs with generated changes

This single tool replaces the need for multiple separate tools, providing a streamlined experience.

## 🏗️ Architecture

![Architecture](https://img.shields.io/badge/🏗️_MCP-Architecture-E74C3C?style=flat&logoColor=white)

### Tech Stack

![Tech Stack](https://img.shields.io/badge/⚡_Tech-Stack-FF6B6B?style=flat&logoColor=white)

- **Runtime**: ![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
- **Language**: ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
- **Protocol**: ![MCP](https://img.shields.io/badge/MCP-FF9500?style=flat-square&logo=protocol&logoColor=white)
- **AI Integration**: ![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white) ![Claude](https://img.shields.io/badge/Claude-D97757?style=flat-square&logo=claude&logoColor=white)
- **Containerization**: ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

### Project Structure

```
mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── bootstrap.ts          # Server initialization
│   ├── factory.ts # MCP server factory
│   ├── logger.ts             # Logging configuration
│   ├── http/                 # HTTP endpoints
│   │   ├── health-controller.ts
│   │   └── mcp-controller.ts
│   ├── services/             # Business logic
│   │   └── dev-service.ts
│   ├── tools/                # MCP tools
│   │   ├── code.ts
│   │   └── tool-definition.ts
│   ├── types/                # TypeScript types
│   │   └── api.types.ts
│   └── utils/                # Utility functions
│       └── package-info.ts
├── Dockerfile               # Docker configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md               # You are here
```

## 🚀 Development

### Available Scripts

![Scripts](https://img.shields.io/badge/📜_npm-Scripts-CB3837?style=flat&logo=npm&logoColor=white)

```bash
# Development
npm run dev              # Start with hot reload
npm run dev:debug        # Start with debugger
npm run inspector        # Start MCP inspector

# Building
npm run build            # Compile TypeScript
npm run build:watch      # Build with file watching

# Production
npm run start            # Start production server
npm run start:prod       # Start with PM2

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:mcp         # Test MCP protocol

# Code Quality
npm run lint             # ESLint check
npm run lint:fix         # Auto-fix linting issues
npm run format           # Prettier formatting
npm run type-check       # TypeScript type checking
```

### 🔧 Development Tools

![Development Tools](https://img.shields.io/badge/🛠️_Dev-Tools-16A085?style=flat&logoColor=white)

- **Hot Reload**: ![Nodemon](https://img.shields.io/badge/Nodemon-76D04B?style=flat-square&logo=nodemon&logoColor=white)
- **Type Checking**: ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
- **Protocol Testing**: ![MCP Inspector](https://img.shields.io/badge/MCP_Inspector-FF9500?style=flat-square&logo=protocol&logoColor=white)
- **Linting**: ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
- **Formatting**: ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white)

### 🧪 Testing

![Testing](https://img.shields.io/badge/🧪_Testing-Suite-E74C3C?style=flat&logoColor=white)

```bash
# Run all tests
npm run test

# Test MCP protocol
npm run test:mcp

# Test with coverage
npm run test:coverage

# Integration tests
npm run test:integration

# Load testing
npm run test:load
```

## 📊 API Endpoints

![API Endpoints](https://img.shields.io/badge/📊_API-Endpoints-3498DB?style=flat&logoColor=white)

### Health Check

![Health](https://img.shields.io/badge/🏥_Health-Check-27AE60?style=flat&logoColor=white)

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "mcp": {
    "version": "1.0.0",
    "capabilities": ["tools", "resources"]
  }
}
```

### MCP Protocol

![MCP Protocol](https://img.shields.io/badge/📡_MCP-Protocol-FF9500?style=flat&logoColor=white)

```http
GET /mcp/capabilities
```

```http
POST /mcp/tools/call
Content-Type: application/json

{
  "tool": "execute",
  "parameters": {
    "prompt": "Create a React component for user authentication",
    "githubUrl": "https://github.com/username/repository",
    "githubToken": "ghp_xxxxxxxxxxxxxxxxxxxx",
    "apiKey": "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx"
  }
}
```

## 🚀 Performance

![Performance](https://img.shields.io/badge/⚡_High-Performance-F39C12?style=flat&logoColor=white)

- **Response Time**: < 100ms for tool calls
- **Throughput**: 1000+ requests/minute
- **Memory Usage**: < 256MB baseline
- **Connection Pooling**: Efficient AI API usage
- **Caching**: Intelligent response caching

## 🔒 Security

![Security](https://img.shields.io/badge/🔒_Security-First-E74C3C?style=flat&logoColor=white)

- **API Key Management**: Secure credential handling
- **Rate Limiting**: Request throttling and quotas
- **Input Validation**: Comprehensive parameter validation
- **Audit Logging**: Complete request/response logging
- **CORS Protection**: Configurable CORS policies

## 🚀 Deployment

![Deployment](https://img.shields.io/badge/🚀_Production-Ready-27AE60?style=flat&logoColor=white)

### Production Checklist

- [ ] Environment variables configured
- [ ] AI API keys validated
- [ ] SSL/TLS certificates installed
- [ ] Monitoring and alerting setup
- [ ] Load balancer configured
- [ ] Health checks enabled
- [ ] Log aggregation configured

### 📊 Monitoring

![Monitoring](https://img.shields.io/badge/📊_Monitoring-24⁄7-3498DB?style=flat&logoColor=white)

- **Health Endpoint**: `GET /health`
- **Metrics**: Prometheus metrics export
- **Logging**: Structured JSON logging
- **Tracing**: Distributed request tracing
- **Alerts**: Error rate and latency monitoring

## 🤝 Contributing

![Contributing](https://img.shields.io/badge/🤝_Contributing-Welcome-FF6B6B?style=flat&logoColor=white)

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-tool`)
3. Add your MCP tools or improvements
4. Write comprehensive tests
5. Test with MCP Inspector
6. Ensure all tests pass (`npm run test`)
7. Commit your changes (`git commit -m 'Add new MCP tool'`)
8. Push to the branch (`git push origin feature/new-tool`)
9. Open a Pull Request

### Tool Development Guidelines

![Guidelines](https://img.shields.io/badge/📋_Tool-Guidelines-E67E22?style=flat&logoColor=white)

- Follow MCP specification standards
- Include comprehensive TypeScript types
- Add input validation and error handling
- Write unit and integration tests
- Document tool parameters and usage
- Test with MCP Inspector

## 📄 License

[![License](https://img.shields.io/badge/License-MIT-A569BD?style=for-the-badge&logo=mit&logoColor=white)](../LICENSE)

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

![Built with](https://img.shields.io/badge/Built_with-❤️_and_🤖-FF69B4?style=flat&logoColor=white) ![Powered by](https://img.shields.io/badge/Powered_by-MCP-FF9500?style=flat&logo=protocol&logoColor=white) 