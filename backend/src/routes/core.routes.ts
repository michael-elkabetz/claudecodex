import { Router } from 'express';
import { CoreController, upload } from '../controllers/core.controller';

const router = Router();
const coreController = new CoreController();

/**
 * @swagger
 * /api/core/github-auth:
 *   post:
 *     summary: 🔐 Exchange GitHub OAuth code for access token
 *     description: |
 *       Exchanges a GitHub OAuth authorization code for an access token.
 *       This endpoint is called after the user authorizes your application on GitHub.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GitHubAuthRequest'
 *           example:
 *             code: "gho_xxxxxxxxxxxxxxxxxxxx"
 *             client_id: "Iv1.a629723000000000"
 *             redirect_uri: "http://localhost:3000/auth/callback"
 *     responses:
 *       200:
 *         description: ✅ Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GitHubAuthResponse'
 *             example:
 *               success: true
 *               message: "GitHub OAuth successful"
 *               data:
 *                 access_token: "ghp_xxxxxxxxxxxxxxxxxxxx"
 *       400:
 *         description: ❌ Invalid request or authentication failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Missing required fields: code, client_id, redirect_uri"
 *       500:
 *         description: 🔥 Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/github-auth', coreController.githubAuth);

/**
 * @swagger
 * /api/core/branches:
 *   post:
 *     summary: 🌿 Get branches from GitHub repository
 *     description: |
 *       Fetches all branches from a GitHub repository.
 *       Requires GitHub authorization token and repository URL.
 *     tags: [Repository]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               githubToken:
 *                 type: string
 *                 description: GitHub access token
 *             required:
 *               - githubUrl
 *               - githubToken
 *           example:
 *             githubUrl: "https://github.com/username/repository"
 *             githubToken: "ghp_xxxxxxxxxxxxxxxxxxxx"
 *     responses:
 *       200:
 *         description: ✅ Branches fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     branches:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           protected:
 *                             type: boolean
 *                           sha:
 *                             type: string
 *             example:
 *               success: true
 *               message: "Branches fetched successfully"
 *               data:
 *                 branches:
 *                   - name: "main"
 *                     protected: true
 *                     sha: "abc123..."
 *                   - name: "develop"
 *                     protected: false
 *                     sha: "def456..."
 *       400:
 *         description: ❌ Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: 🔥 Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/branches', coreController.getBranches);

/**
 * @swagger
 * /api/core/process:
 *   post:
 *     summary: 🤖 Generate code and create pull request
 *     description: | 
 *       **The main AI-powered endpoint!** 
 *       
 *       This endpoint:
 *       1. 🧠 Uses AI (Anthropic/OpenAI) to generate a branch name
 *       2. 🌿 Creates a new branch in your GitHub repository
 *       3. 📥 Clones the repository locally
 *       4. 📝 Updates the README with your prompt
 *       5. 💾 Commits and pushes the changes
 *       6. 🔄 Creates a pull request
 *       
 *       **AI Providers:**
 *       - `sk-ant-...` → Anthropic Claude
 *       - `sk-...` → OpenAI GPT
 *       
 *       **File Support:**
 *       - Supports uploading multiple files (max 10 files, 10MB each)
 *       - Supported file types: txt, md, js, ts, jsx, tsx, py, java, cpp, c, h, css, html, json, xml, yml, yaml, pdf, doc, docx, xls, xlsx
 *     tags: [Core]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of what to build
 *               apiKey:
 *                 type: string
 *                 description: AI API key (Anthropic or OpenAI)
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               githubToken:
 *                 type: string
 *                 description: GitHub access token
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional files to include in the request
 *             required:
 *               - prompt
 *               - githubUrl
 *               - githubToken
 *           example:
 *             prompt: "Add a new feature to calculate user statistics"
 *             apiKey: "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx"
 *             githubUrl: "https://github.com/username/repository"
 *             githubToken: "ghp_xxxxxxxxxxxxxxxxxxxx"
 *     responses:
 *       200:
 *         description: 🎉 Pull request created successfully!
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessResponse'
 *             example:
 *               success: true
 *               message: "Pull request created successfully!"
 *               data:
 *                 pullRequestUrl: "https://github.com/username/repo/pull/123"
 *                 branchName: "add-user-statistics-feature"
 *                 pullRequestNumber: 123
 *                 processedAt: "2024-01-15T10:30:00.000Z"
 *                 repositoryName: "my-awesome-project"
 *                 repositoryOwner: "username"
 *       400:
 *         description: ❌ Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Missing required fields: prompt, apiKey, githubUrl, githubToken"
 *       500:
 *         description: 🔥 Processing error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/process', upload.array('files', 10), coreController.process);

/**
 * @swagger
 * /api/core/health:
 *   get:
 *     summary: 🏥 Check service health
 *     description: Returns the health status of the core service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: ✅ Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 *             example:
 *               success: true
 *               message: "Core service is healthy"
 *               data:
 *                 timestamp: "2024-01-15T10:30:00.000Z"
 *                 uptime: 3600
 */
router.get('/health', coreController.health);

export default router; 