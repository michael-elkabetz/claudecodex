import { Request, Response } from 'express';
import multer from 'multer';
import { GitHubService } from '../services/github.service';
import { ProcessService } from '../services/process.service';
import { GitService } from '../services/git.service';
import { GitHubAuthRequest, ActionRequest, ApiResponse } from '../types/api.types';

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

  actions = async (req: Request, res: Response): Promise<void> => {
    try {
      const actionRequest: ActionRequest = {
        prompt: req.body.prompt,
        apiKey: req.body.apiKey,
        githubUrl: req.body.githubUrl,
        branch: req.body.branch,
        githubToken: req.body.githubToken?.trim() || process.env.GITHUB_TOKEN,
        files: req.files as Express.Multer.File[]
      };
      const { action } = req.body;

      if (!action) {
        res.status(400).json({ success: false, message: 'Missing required field: action' } as ApiResponse);
        return;
      }

      const validationResult = await this.processService.validate(actionRequest);
      if (!validationResult.isValid) {
        res.status(400).json({ success: false, message: validationResult.error } as ApiResponse);
        return;
      }
      const githubInfo = validationResult.githubInfo!;
      const gitService = new GitService();

      let response: ActionResponse;
      switch (action) {
        case 'createBranch': {
          const branchName = actionRequest.branch || await this.processService.getBranchName(actionRequest);
          await this.processService.createBranch(actionRequest.githubToken!, githubInfo, branchName);
          await this.processService.cloneBranch(actionRequest.githubUrl, branchName, actionRequest.githubToken!, gitService);
          await this.processService.generateCode(actionRequest, gitService, branchName);
          response = {
            success: true,
            message: 'Branch creation and code generation completed successfully',
            data: {
              pullRequestUrl: '',
              branchName,
              pullRequestNumber: 0,
              processedAt: new Date().toISOString(),
              repositoryName: githubInfo.repo,
              repositoryOwner: githubInfo.owner,
            }
          };
          break;
        }
        case 'createPR': {
          if (!actionRequest.branch) {
            res.status(400).json({ success: false, message: 'Missing required field: branch for createPR action' } as ApiResponse);
            return;
          }
          const pullRequest = await this.processService.createPR(
            actionRequest.githubToken!,
            githubInfo,
            actionRequest.branch,
            actionRequest.prompt!,
            gitService,
            actionRequest.apiKey!
          );
          response = {
            success: true,
            message: 'Pull request created successfully',
            data: {
              pullRequestUrl: pullRequest.html_url,
              branchName: actionRequest.branch,
              pullRequestNumber: pullRequest.number,
              processedAt: new Date().toISOString(),
              repositoryName: githubInfo.repo,
              repositoryOwner: githubInfo.owner,
            }
          };
          break;
        }
        default:
          res.status(400).json({ success: false, message: `Unknown action: ${action}` } as ApiResponse);
          return;
      }

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in actions:', error);
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