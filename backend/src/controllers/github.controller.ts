import { Request, Response } from 'express';
import fs from 'fs';
import { GitHubService } from '../services/github.service';
import { AIService } from '../services/ai.service';
import { GitHubAuthRequest, ApiResponse } from '../types/api.types';

export class GitHubController {
  private githubService: GitHubService;
  private aiService: AIService;

  constructor() {
    this.githubService = new GitHubService();
    this.aiService = new AIService();
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

  getBranches = async (req: Request, res: Response): Promise<void> => {
    try {
      const { githubUrl, githubToken } = req.body;

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

  createBranch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, apiKey, githubUrl, githubToken, baseBranch = 'main' } = req.body;

      if (!prompt || !githubUrl || !githubToken) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: prompt, githubUrl, githubToken'
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

      let branchName: string;
      if (apiKey) {
        const provider = this.aiService.detectProvider(apiKey);
        const branchPrompt = fs.readFileSync(__dirname + '/../prompts/branch-naming.md', 'utf8')
          .replace('{{PROMPT}}', prompt);

        let aiResponse;
        if (provider === 'anthropic') {
          aiResponse = await this.aiService.generateBranchNameWithClaude(apiKey, branchPrompt);
        } else if (provider === 'openai') {
          aiResponse = await this.aiService.generateBranchNameWithGPT(apiKey, branchPrompt);
        } else {
          throw new Error('Invalid API key format');
        }
        branchName = aiResponse.content.trim();
      } else {
        branchName = prompt.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);
      }

      const result = await this.githubService.createBranch(
        githubToken,
        repoInfo.owner,
        repoInfo.repo,
        branchName,
        baseBranch
      );

      res.status(200).json({
        success: true,
        message: 'Branch created successfully',
        data: {
          branchName: result.branchName,
          branchUrl: result.branchUrl,
          sha: result.sha
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Error in createBranch:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };

  createPR = async (req: Request, res: Response): Promise<void> => {
    try {
      const { prompt, apiKey, githubUrl, githubToken, branchName, baseBranch = 'main', title } = req.body;

      if (!githubUrl || !githubToken || !branchName) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: githubUrl, githubToken, branchName'
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

      let prDescription = 'Auto-generated pull request';
      let prTitle = title || branchName;

      if (apiKey && prompt) {
        const provider = this.aiService.detectProvider(apiKey);
        const prPrompt = fs.readFileSync(__dirname + '/../prompts/pr-description.md', 'utf8')
          .replace('{{PROMPT}}', prompt)
          .replace('{{BRANCH_NAME}}', branchName);

        let aiResponse;
        if (provider === 'anthropic') {
          aiResponse = await this.aiService.generatePRDescriptionWithClaude(apiKey, prPrompt);
        } else if (provider === 'openai') {
          aiResponse = await this.aiService.generatePRDescriptionWithGPT(apiKey, prPrompt);
        } else {
          throw new Error('Invalid API key format');
        }

        const prContent = aiResponse.content.trim();
        const lines = prContent.split('\n');
        prTitle = lines[0] || prTitle;
        prDescription = lines.slice(1).join('\n').trim() || prDescription;
      }

      const result = await this.githubService.createPullRequest(
        githubToken,
        repoInfo.owner,
        repoInfo.repo,
        prTitle,
        prDescription,
        branchName,
        baseBranch
      );

      res.status(200).json({
        success: true,
        message: 'Pull request created successfully',
        data: {
          pullRequestUrl: result.pullRequestUrl,
          pullRequestNumber: result.pullRequestNumber,
          title: prTitle,
          description: prDescription
        }
      } as ApiResponse);
    } catch (error) {
      console.error('Error in createPR:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  };
}