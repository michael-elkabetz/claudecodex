import { Router } from 'express';
import coreRoutes from './core.routes';

const router = Router();

router.use('/core', coreRoutes);

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
 *     tags: [Core]
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
 *                     core:
 *                       type: string
 *                       example: "/api/core"
 *                     health:
 *                       type: string
 *                       example: "/api/core/health"
 *                     auth:
 *                       type: string
 *                       example: "/api/core/github-auth"
 *                     process:
 *                       type: string
 *                       example: "/api/core/process"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ClaudeCodex API',
    version: '1.0.0',
    endpoints: {
      core: '/api/core',
      health: '/api/core/health',
      auth: '/api/core/github-auth',
      process: '/api/core/process'
    }
  });
});

export default router; 