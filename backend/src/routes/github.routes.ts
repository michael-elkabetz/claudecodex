import { Router } from 'express';
import { GitHubController } from '../controllers/github.controller';

const router = Router();
const githubController = new GitHubController();

/**
 * @swagger
 * /api/github/auth:
 *   post:
 *     summary: 🔐 Exchange GitHub OAuth code for access token
 *     description: |
 *       Exchanges a GitHub OAuth authorization code for an access token.
 *       This endpoint is called after the user authorizes your application on GitHub.
 *     tags: [GitHub]
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
router.post('/auth', githubController.githubAuth);

/**
 * @swagger
 * /api/github/branches:
 *   post:
 *     summary: 🌿 Get branches from GitHub repository
 *     description: |
 *       Fetches all branches from a GitHub repository.
 *       Requires GitHub authorization token and repository URL.
 *     tags: [GitHub]
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
 *               $ref: '#/components/schemas/ApiResponse'
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
router.post('/branches', githubController.getBranches);

/**
 * @swagger
 * /api/github/create-branch:
 *   post:
 *     summary: 🌿 Create a new branch in GitHub repository
 *     description: |
 *       Creates a new branch in the specified GitHub repository.
 *       Can optionally use AI to generate a branch name based on the prompt.
 *     tags: [GitHub]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of the changes (used for branch naming)
 *               apiKey:
 *                 type: string
 *                 description: AI API key for branch name generation (optional)
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               githubToken:
 *                 type: string
 *                 description: GitHub access token
 *               baseBranch:
 *                 type: string
 *                 description: Base branch to create from (optional, automatically detects repository default branch if not provided)
 *             required:
 *               - prompt
 *               - githubUrl
 *               - githubToken
 *           example:
 *             prompt: "Add user authentication feature"
 *             apiKey: "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx"
 *             githubUrl: "https://github.com/username/repository"
 *             githubToken: "ghp_xxxxxxxxxxxxxxxxxxxx"
 *             baseBranch: "main"
 *     responses:
 *       200:
 *         description: ✅ Branch created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Branch created successfully"
 *               data:
 *                 branchName: "feat/add-user-authentication"
 *                 branchUrl: "https://github.com/username/repository/tree/feat/add-user-authentication"
 *                 sha: "abc123def456..."
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
router.post('/create-branch', githubController.createBranch);

/**
 * @swagger
 * /api/github/create-pr:
 *   post:
 *     summary: 🔄 Create a pull request in GitHub repository
 *     description: |
 *       Creates a pull request in the specified GitHub repository.
 *       Can optionally use AI to generate PR title and description based on the prompt.
 *     tags: [GitHub]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description of the changes (used for PR content generation)
 *               apiKey:
 *                 type: string
 *                 description: AI API key for PR content generation (optional)
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               githubToken:
 *                 type: string
 *                 description: GitHub access token
 *               branchName:
 *                 type: string
 *                 description: Source branch name for the PR
 *               baseBranch:
 *                 type: string
 *                 description: Target branch for the PR (optional, automatically detects repository default branch if not provided)
 *               title:
 *                 type: string
 *                 description: PR title (optional, will be generated if not provided)
 *             required:
 *               - githubUrl
 *               - githubToken
 *               - branchName
 *           example:
 *             prompt: "Add user authentication feature"
 *             apiKey: "sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx"
 *             githubUrl: "https://github.com/username/repository"
 *             githubToken: "ghp_xxxxxxxxxxxxxxxxxxxx"
 *             branchName: "feat/add-user-authentication"
 *             baseBranch: "main"
 *             title: "Add user authentication system"
 *     responses:
 *       200:
 *         description: ✅ Pull request created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Pull request created successfully"
 *               data:
 *                 pullRequestUrl: "https://github.com/username/repository/pull/123"
 *                 pullRequestNumber: 123
 *                 title: "Add user authentication system"
 *                 description: "This PR adds a complete user authentication system..."
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
router.post('/create-pr', githubController.createPR);

export default router;