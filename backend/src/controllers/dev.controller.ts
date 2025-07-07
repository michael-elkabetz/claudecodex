import { Request, Response } from 'express';
import multer from 'multer';
import { DevAgent } from '../agents/dev.agent';
import { ExecuteRequest, ApiResponse } from '../types/api.types';
import { AIService } from '../services/ai.service';

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

export class DevController {
  private devAgent: DevAgent;
  private aiService: AIService;

  constructor() {
    this.devAgent = new DevAgent();
    this.aiService = new AIService();
  }


  execute = async (req: Request, res: Response): Promise<void> => {
    try {
      const processRequest: ExecuteRequest = {
        prompt: req.body.prompt,
        apiKey: req.body.apiKey,
        githubUrl: req.body.githubUrl,
        branch: req.body.branch,
        githubToken: req.body.githubToken?.trim() || process.env.GITHUB_TOKEN,
        files: req.files as Express.Multer.File[],
        model: req.body.model
      };

      if (!processRequest.prompt || !processRequest.githubUrl || !processRequest.githubToken) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: prompt, githubUrl, githubToken. Provide githubToken in the request or set the GITHUB_TOKEN environment variable.'
        } as ApiResponse);
        return;
      }

      const result = await this.devAgent.processRequest(processRequest);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in process:', error);
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
      message: 'Dev service is healthy',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    } as ApiResponse);
  };

  models = async (req: Request, res: Response): Promise<void> => {
    try {
      const availableModels = this.aiService.getAvailableModels();
      res.status(200).json({
        success: true,
        message: 'Available models retrieved successfully',
        data: availableModels
      } as ApiResponse);
    } catch (error) {
      console.error('Error getting available models:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve available models',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

}