import { Router } from 'express';
import devRoutes from './dev.routes';
import githubRoutes from './github.routes';

const router = Router();

router.use('/dev', devRoutes);
router.use('/github', githubRoutes);

/**
 * @swagger
 * /api:
 *   get:
 *     summary: 📚 API Information
 *     description: |
 *       Returns general information about the ClaudeCodex API.
 *       
 *       **Welcome to the AI-Powered Code Generation API! 🚀**
 *       
 *       This API helps you automatically generate code changes and create pull requests using AI.
 *     tags: [System]
 *     responses:
 *       200:
 *         description: ✅ API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ClaudeCodex API"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     execute:
 *                       type: string
 *                       example: "/api/dev/execute"
 *                     health:
 *                       type: string
 *                       example: "/api/health"
 *                     githubAuth:
 *                       type: string
 *                       example: "/api/github/auth"
 *                     githubBranches:
 *                       type: string
 *                       example: "/api/github/branches"
 *                     githubCreateBranch:
 *                       type: string
 *                       example: "/api/github/create-branch"
 *                     githubCreatePR:
 *                       type: string
 *                       example: "/api/github/create-pr"
 *                     devModels:
 *                       type: string
 *                       example: "/api/dev/models"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ClaudeCodex API',
    version: '1.0.0',
    endpoints: {
      execute: '/api/dev/execute',
      models: '/api/dev/models',
      health: '/api/health',
      githubAuth: '/api/github/auth',
      githubBranches: '/api/github/branches',
      githubCreateBranch: '/api/github/create-branch',
      githubCreatePR: '/api/github/create-pr'
    }
  });
});

export default router; 