import {ProcessRequest, ProcessResponse} from '../types/api.types';
import {GitHubService} from './github.service';
import {AIResponse, AIService} from './ai.service';
import {GitService} from './git.service';

export class ProcessService {
    private githubService: GitHubService;
    private aiService: AIService;

    constructor() {
        this.githubService = new GitHubService();
        this.aiService = new AIService();
    }

    async processRequest(request: ProcessRequest): Promise<ProcessResponse> {
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
            const pullRequest = await this.createPR(request.githubToken!, githubInfo, branchName, request.prompt!);

            // Determine if this is a new or existing PR
            let successMessage = 'Pull request created successfully!';
            if (pullRequest.created_at) {
                const createdTime = new Date(pullRequest.created_at);
                const now = new Date();
                const timeDiff = now.getTime() - createdTime.getTime();
                const isNewPR = timeDiff < 60000; // Less than 1 minute old

                if (!isNewPR) {
                    successMessage = 'Code updated successfully! Existing pull request found.';
                }
            }


            return {
                success: true,
                message: successMessage,
                data: {
                    pullRequestUrl: pullRequest.html_url,
                    branchName: branchName,
                    pullRequestNumber: pullRequest.number,
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

    async validate(request: ProcessRequest): Promise<{
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

        const aiProvider = this.aiService.detectProvider(apiKey);
        if (aiProvider === 'unknown') {
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

    async getBranchName(request: ProcessRequest): Promise<string> {
        console.log('🤖 Getting branch name from AI...');

        if (!request.apiKey || !request.prompt) {
            throw new Error("API key and prompt are required to generate a branch name.");
        }

        const aiProvider = this.aiService.detectProvider(request.apiKey);
        const branchPrompt = `Based on this prompt: "${request.prompt}", generate a git branch name following standard naming conventions.

Use one of these three prefixes based on the type of work:
- feature/ - for new features or enhancements
- bugfix/ - for bug fixes
- hotfix/ - for urgent production fixes

Format: <prefix>/<short-descriptive-name>
- Use lowercase letters and hyphens only
- Keep the description part under 25 characters
- Be descriptive but concise

Examples:
- feature/user-authentication
- bugfix/header-styling-fix
- hotfix/security-patch

Return ONLY the complete branch name with prefix, nothing else.`;

        let aiResponse: AIResponse;
        if (aiProvider === 'anthropic') {
            aiResponse = await this.aiService.generateBranchNameWithClaude(request.apiKey, branchPrompt);
        } else {
            aiResponse = await this.aiService.generateBranchNameWithGPT(request.apiKey, branchPrompt);
        }

        let branchName = aiResponse.content.trim().toLowerCase();
        
        branchName = branchName.replace(/[^a-z0-9-\/]/g, '-');
        
        const validPrefixes = ['feature/', 'bugfix/', 'hotfix/'];
        const hasValidPrefix = validPrefixes.some(prefix => branchName.startsWith(prefix));
        
        if (!hasValidPrefix) {
            branchName = `feature/${branchName}`;
        }
        
        branchName = branchName.substring(0, 50);
        
        console.log('🌿 Generated branch name:', branchName);

        return branchName;
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

    async generateCode(request: ProcessRequest, gitService: GitService, branchName: string): Promise<void> {
        if (request.apiKey) {
            const aiProvider = this.aiService.detectProvider(request.apiKey);
            const workspacePath = gitService.getWorkDir();

            let enhancedPrompt = request.prompt;
            if (request.files && request.files.length > 0) {
                enhancedPrompt = await this.enhancePromptWithFiles(request.prompt, request.files);
            }

            if (aiProvider === 'anthropic') {
                console.log('🤖 Generating code with Claude Code...');
                await this.aiService.generateCodeWithClaudeCodeCLI(request.apiKey, enhancedPrompt, workspacePath);
            } else {
                console.log('🤖 Generating code with Codex...');
                await this.aiService.generateCodeWithCodexCLI(request.apiKey, enhancedPrompt, workspacePath);
            }
        }

        console.log('💾 Committing and pushing changes...');
        const commitMessage = `AI Update: ${request.prompt}`;
        await gitService.commitAndPush(commitMessage, branchName);
    }

    private async enhancePromptWithFiles(originalPrompt: string, files: Express.Multer.File[]): Promise<string> {
        console.log(`📎 Processing ${files.length} uploaded files...`);
        
        let enhancedPrompt = originalPrompt + '\n\n--- UPLOADED FILES ---\n';
        
        for (const file of files) {
            try {
                const fileContent = file.buffer.toString('utf-8');
                enhancedPrompt += `\n**File: ${file.originalname}**\n\`\`\`\n${fileContent}\n\`\`\`\n`;
                console.log(`📄 Added file content: ${file.originalname} (${file.size} bytes)`);
            } catch (error) {
                console.warn(`⚠️  Could not read file ${file.originalname}:`, error);
                enhancedPrompt += `\n**File: ${file.originalname}** (could not read content)\n`;
            }
        }
        
        enhancedPrompt += '\n--- END OF UPLOADED FILES ---\n\nPlease consider the above files when implementing the requested changes.';
        
        return enhancedPrompt;
    }

    async createPR(githubToken: string, githubInfo: {
        owner: string;
        repo: string
    }, branchName: string, prompt: string): Promise<any> {
        console.log('🔄 Creating Pull Request...');

        const prTitle = `AI-Generated Changes: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
        const prBody = `## AI-Generated Changes

**Original Prompt:** ${prompt}

**Changes Made:**
- Updated README.md with timestamp and prompt information
- Applied automatic formatting and documentation updates

**Branch:** ${branchName}

---
*This pull request was generated automatically using AI. Please review the changes before merging.*`;

        try {
            const pullRequest = await this.githubService.createPullRequest(
                githubToken,
                githubInfo.owner,
                githubInfo.repo,
                prTitle,
                prBody,
                branchName
            );

            if (pullRequest.created_at) {
                const createdTime = new Date(pullRequest.created_at);
                const now = new Date();
                const timeDiff = now.getTime() - createdTime.getTime();
                const isNewPR = timeDiff < 60000;

                if (isNewPR) {
                    console.log('✅ New Pull Request created:', pullRequest.html_url);
                } else {
                    console.log('✅ Existing Pull Request found:', pullRequest.html_url);
                }
            } else {
                console.log('✅ Pull Request ready:', pullRequest.html_url);
            }

            return pullRequest;
        } catch (error) {
            console.error('Error with pull request:', error);
            throw error;
        }
    }
} 