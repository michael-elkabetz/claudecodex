import { Request, Response } from 'express';
import multer from 'multer';
import { GitHubService } from '../services/github.service';
import { ProcessService } from '../services/process.service';
import { GitHubAuthRequest, ProcessRequest, ApiResponse } from '../types/api.types';

const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, 
    files: 2
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(txt|md|js|ts|jsx|tsx|py|java|cpp|c|h|css|html|json|xml|yml|yaml|pdf|doc|docx|xls|xlsx)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
});

export class CoreController {
  private githubService: GitHubService;
  private processService: ProcessService;

  constructor() {
    this.githubService = new GitHubService();
    this.processService = new ProcessService();
  }

  githubAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const authRequest: GitHubAuthRequest = req.body;

      if (!authRequest.code || !authRequest.client_id || !authRequest.redirect_uri) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: code, client_id, redirect_uri'
        } as ApiResponse);
        return;
      }

      const result = await this.githubService.exchangeCodeForToken(authRequest);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in githubAuth:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  developer = async (req: Request, res: Response): Promise<void> => {
    try {
      const processRequest: ProcessRequest = {
        prompt: req.body.prompt,
        apiKey: req.body.apiKey,
        githubUrl: req.body.githubUrl,
        branch: req.body.branch,
        githubToken: req.body.githubToken?.trim() || process.env.GITHUB_TOKEN,
        files: req.files as Express.Multer.File[]
      };

      if (!processRequest.prompt || !processRequest.githubUrl || !processRequest.githubToken) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: prompt, githubUrl, githubToken. Provide githubToken in the request or set the GITHUB_TOKEN environment variable.'
        } as ApiResponse);
        return;
      }

      const result = await this.processService.processRequest(processRequest);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in developer:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  health = async (req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Core service is healthy',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    } as ApiResponse);
  };

  getBranches = async (req: Request, res: Response): Promise<void> => {
    try {
      const { githubUrl, githubToken } = req.body;

      // Validate request body
      if (!githubUrl || !githubToken) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: githubUrl, githubToken'
        } as ApiResponse);
        return;
      }

      const repoInfo = this.githubService.parseGitHubUrl(githubUrl);
      if (!repoInfo) {
        res.status(400).json({
          success: false,
          message: 'Invalid GitHub URL format'
        } as ApiResponse);
        return;
      }

      const branches = await this.githubService.getBranches(githubToken, repoInfo.owner, repoInfo.repo);
      
      res.status(200).json({
        success: true,
        message: 'Branches fetched successfully',
        data: { branches }
      } as ApiResponse);
    } catch (error) {
      console.error('Error in getBranches:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };
} 