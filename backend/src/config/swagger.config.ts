import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClaudeCodex API',
      version: '1.0.0',
      description: `
        🤖 **AI-Powered Code Generation API**
        
        This API enables automatic code generation and GitHub integration using AI models.
        
        ## Features
        - 🔐 GitHub OAuth integration
        - 🧠 Support for Anthropic Claude & OpenAI GPT
        - 🌿 Automatic branch creation
        - 📝 Code generation and repository updates
        - 🔄 Pull request automation
        
        ## Getting Started
        1. Authorize with GitHub using \`/api/core/github-auth\`
        2. Submit your coding request via \`/api/core/process\`
        3. Get your pull request URL instantly!
      `,
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.bgcode.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        GitHubAuthRequest: {
          type: 'object',
          required: ['code', 'client_id', 'redirect_uri'],
          properties: {
            code: {
              type: 'string',
              description: 'GitHub OAuth authorization code',
              example: 'gho_xxxxxxxxxxxxxxxxxxxx'
            },
            client_id: {
              type: 'string',
              description: 'GitHub OAuth client ID',
              example: 'Iv1.a629723000000000'
            },
            redirect_uri: {
              type: 'string',
              description: 'OAuth redirect URI',
              example: 'http://localhost:3000/auth/callback'
            }
          }
        },
        GitHubAuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              properties: {
                access_token: {
                  type: 'string',
                  description: 'GitHub access token'
                }
              }
            }
          }
        },
        ProcessRequest: {
          type: 'object',
          required: ['prompt', 'apiKey', 'githubUrl'],
          properties: {
            prompt: {
              type: 'string',
              description: 'Description of changes to make',
              example: 'Add a new feature to calculate user statistics'
            },
            apiKey: {
              type: 'string',
              description: 'Anthropic (sk-ant-) or OpenAI (sk-) API key',
              example: 'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx'
            },
            githubUrl: {
              type: 'string',
              description: 'GitHub repository URL',
              example: 'https://github.com/username/repository'
            },
            githubToken: {
              type: 'string',
              description: 'GitHub access token (optional - can be provided via GITHUB_TOKEN environment variable)',
              example: 'ghp_xxxxxxxxxxxxxxxxxxxx'
            }
          }
        },
        ProcessResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              properties: {
                pullRequestUrl: {
                  type: 'string',
                  description: 'URL of the created pull request',
                  example: 'https://github.com/username/repo/pull/123'
                },
                branchName: {
                  type: 'string',
                  description: 'Name of the created branch',
                  example: 'add-user-statistics-feature'
                },
                pullRequestNumber: {
                  type: 'number',
                  description: 'Pull request number',
                  example: 123
                },
                processedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'When the request was processed'
                },
                repositoryName: {
                  type: 'string',
                  description: 'Repository name',
                  example: 'my-awesome-project'
                },
                repositoryOwner: {
                  type: 'string',
                  description: 'Repository owner',
                  example: 'username'
                },
              }
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the operation was successful'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data (varies by endpoint)'
            },
            error: {
              type: 'string',
              description: 'Error message (if any)'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Core service is healthy'
            },
            data: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                uptime: {
                  type: 'number',
                  description: 'Server uptime in seconds'
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: '🔐 GitHub OAuth operations'
      },
      {
        name: 'Core',
        description: '🤖 Main AI-powered code generation'
      },
      {
        name: 'Health',
        description: '🏥 System health and monitoring'
      }
    ]
  },
  apis: ['./src/routes/*.ts'],
};

const specs = swaggerJsdoc(options);
export default specs; 