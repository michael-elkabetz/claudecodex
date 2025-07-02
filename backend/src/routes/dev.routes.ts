import { Router } from 'express';
import { DevController, upload } from '../controllers/dev.controller';

const router = Router();
const devController = new DevController();


/**
 * @swagger
 * /api/dev/execute:
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
 *                 description: GitHub access token (optional - can be provided via GITHUB_TOKEN environment variable)
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional files to include in the request
 *             required:
 *               - prompt
 *               - githubUrl
 *
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
 *               $ref: '#/components/schemas/ExecuteResponse'
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
 *               message: "Missing required fields: prompt, githubUrl"
 *       500:
 *         description: 🔥 Processing error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/execute', upload.array('files', 10), devController.process);

export default router; 