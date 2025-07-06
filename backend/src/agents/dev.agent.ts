import {ExecuteRequest, ExecuteResponse} from '../types/api.types';
import {GitHubService} from '../services/github.service';
import {AIService} from '../services/ai.service';
import {DevTools} from './dev.tools';
import {GitService} from '../services/git.service';
import * as fs from 'fs';
import * as path from 'path';

export class DevAgent {
    private githubService: GitHubService;
    private aiService: AIService;
    private devTools: DevTools;

    constructor() {
        this.githubService = new GitHubService();
        this.aiService = new AIService();
        this.devTools = new DevTools();
    }

    async processRequest(request: ExecuteRequest): Promise<ExecuteResponse> {
        const gitService = new GitService();

        try {
            console.log('🚀 Starting code generation process for:', request.githubUrl);

            const validationResult = await this.validate(request);
            if (!validationResult.isValid) {
                return {
                    success: false,
                    message: validationResult.error
                };
            }

            const githubInfo = validationResult.githubInfo!;

            const branchName = request.branch || await this.getBranchName(request);

            if (!request.branch) {
                console.log('🌱 Creating new branch...');
                await this.createBranch(request.githubToken!, githubInfo, branchName);
            } else {
                console.log(`🔄 Using existing branch: ${branchName}`);
            }

            await this.cloneBranch(request.githubUrl!, branchName, request.githubToken!, gitService);
            await this.generateCode(request, gitService, branchName);
            const pullRequest = await this.createPR(request.githubToken!, githubInfo, branchName, request.prompt!, gitService, request.apiKey!, request.model);

            let successMessage = 'Pull request created successfully!';

            return {
                success: true,
                message: successMessage,
                data: {
                    pullRequestUrl: pullRequest.pullRequestUrl,
                    branchName: branchName,
                    pullRequestNumber: pullRequest.pullRequestNumber,
                    processedAt: new Date().toISOString(),
                    repositoryName: githubInfo.repo,
                    repositoryOwner: githubInfo.owner,
                }
            };

        } catch (error) {
            console.error('❌ Error processing request:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to process request'
            };
        } finally {
            console.log('🧹 Cleaning up temporary files...');
            await gitService.cleanup();
        }
    }

    async validate(request: ExecuteRequest): Promise<{
        isValid: boolean;
        error?: string;
        githubInfo?: { owner: string; repo: string }
    }> {
        if (!request.prompt?.trim()) {
            return {isValid: false, error: 'Prompt is required'};
        }

        const apiKey = request.apiKey?.trim() || process.env.API_KEY;
        if (!apiKey) {
            return {
                isValid: false,
                error: 'API key is required. Provide it in the request or set the API_KEY environment variable.'
            };
        }
        request.apiKey = apiKey;

        if (!request.githubUrl?.trim()) {
            return {isValid: false, error: 'GitHub URL is required'};
        }

        if (!request.githubToken?.trim()) {
            return {isValid: false, error: 'GitHub token is required'};
        }

        const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
        if (!githubUrlPattern.test(request.githubUrl)) {
            return {isValid: false, error: 'Invalid GitHub URL format'};
        }

        try {
            const aiProvider = this.aiService.detectAIProvider(apiKey);
        } catch (error) {
            return {isValid: false, error: 'Invalid AI API key format. Use Anthropic (sk-ant-) or OpenAI (sk-) keys.'};
        }

        const githubInfo = this.githubService.parseGitHubUrl(request.githubUrl);
        if (!githubInfo) {
            return {isValid: false, error: 'Invalid GitHub URL format'};
        }

        const isValidToken = await this.githubService.validateToken(request.githubToken);
        if (!isValidToken) {
            return {isValid: false, error: 'Invalid GitHub token'};
        }

        return {isValid: true, githubInfo};
    }

    async getBranchName(request: ExecuteRequest): Promise<string> {
        return await this.devTools.createBranch({
            apiKey: request.apiKey!,
            prompt: request.prompt!,
            model: request.model
        });
    }

    async createBranch(githubToken: string, githubInfo: {
        owner: string;
        repo: string
    }, branchName: string): Promise<void> {
        await this.githubService.createBranch(
            githubToken,
            githubInfo.owner,
            githubInfo.repo,
            branchName
        );
    }

    async cloneBranch(githubUrl: string, branchName: string, githubToken: string, gitService: GitService): Promise<void> {
        console.log('📥 Cloning repository...');

        await gitService.cloneRepository(githubUrl, branchName, githubToken);
        console.log('📁 Repository cloned to:', gitService.getWorkDir());
    }

    async generateCode(request: ExecuteRequest, gitService: GitService, branchName: string): Promise<void> {
        if (request.apiKey) {
            const workspacePath = gitService.getWorkDir();

            await this.devTools.generateCode({
                apiKey: request.apiKey,
                prompt: request.prompt!,
                workspacePath: workspacePath,
                model: request.model,
                files: request.files
            });
        }

        console.log('💾 Committing and pushing changes...');
        const commitMessage = `AI Update: ${request.prompt}`;
        await gitService.commitAndPush(commitMessage, branchName);
    }

    async generatePRDescription(apiKey: string, originalPrompt: string, changeSummary: {
        totalFiles: number;
        changes: Array<{
            path: string;
            status: string;
        }>;
    }, model?: string): Promise<string> {
        return await this.devTools.createPR({
            apiKey: apiKey,
            originalPrompt: originalPrompt,
            changeSummary: changeSummary,
            model: model
        });
    }

    async createPR(githubToken: string, githubInfo: {
        owner: string;
        repo: string
    }, branchName: string, prompt: string, gitService: GitService, apiKey: string, model?: string): Promise<any> {
        console.log('🔄 Creating Pull Request...');

        const prTitle = `AI-Generated Changes: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;

        const changeSummary = await gitService.getChangeSummary();

        const prBody = await this.generatePRDescription(apiKey, prompt, changeSummary, model);

        try {
            const pullRequest = await this.githubService.createPullRequest(
                githubToken,
                githubInfo.owner,
                githubInfo.repo,
                prTitle,
                prBody,
                branchName
            );

            console.log('✅ Pull Request ready:', pullRequest.pullRequestUrl);

            return pullRequest;
        } catch (error) {
            console.error('Error with pull request:', error);
            throw error;
        }
    }
} 