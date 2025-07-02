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
router.post('/auth', githubController.githubAuth);

/**
 * @swagger
 * /api/github/branches:
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
 *     summary: 🌿 Create a new branch with AI-generated name
 *     description: |
 *       Creates a new branch in the GitHub repository.
 *       Uses AI to generate a branch name based on the prompt if API key is provided.
 *     tags: [Actions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description for the branch
 *               apiKey:
 *                 type: string
 *                 description: AI API key (optional)
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               githubToken:
 *                 type: string
 *                 description: GitHub access token
 *               baseBranch:
 *                 type: string
 *                 description: Base branch name (default: main)
 *             required:
 *               - prompt
 *               - githubUrl
 *               - githubToken
 *     responses:
 *       200:
 *         description: ✅ Branch created successfully
 *       400:
 *         description: ❌ Invalid request parameters
 *       500:
 *         description: 🔥 Internal server error
 */
router.post('/create-branch', githubController.createBranch);

/**
 * @swagger
 * /api/github/create-pr:
 *   post:
 *     summary: 🔄 Create a pull request with AI-generated description
 *     description: |
 *       Creates a pull request for the specified branch.
 *       Uses AI to generate PR title and description if API key and prompt are provided.
 *     tags: [Actions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Description for the PR (optional)
 *               apiKey:
 *                 type: string
 *                 description: AI API key (optional)
 *               githubUrl:
 *                 type: string
 *                 description: GitHub repository URL
 *               githubToken:
 *                 type: string
 *                 description: GitHub access token
 *               branchName:
 *                 type: string
 *                 description: Source branch name
 *               baseBranch:
 *                 type: string
 *                 description: Target branch name (default: main)
 *               title:
 *                 type: string
 *                 description: PR title (optional)
 *             required:
 *               - githubUrl
 *               - githubToken
 *               - branchName
 *     responses:
 *       200:
 *         description: ✅ Pull request created successfully
 *       400:
 *         description: ❌ Invalid request parameters
 *       500:
 *         description: 🔥 Internal server error
 */
router.post('/create-pr', githubController.createPR);

export default router;