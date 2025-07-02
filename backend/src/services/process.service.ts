import {ExecuteRequest, ExecuteResponse} from '../types/api.types';
import {GitHubService} from './github.service';
import {AIResponse, AIService} from './ai.service';
import {GitService} from './git.service';
import * as fs from 'fs';
import * as path from 'path';

export class ProcessService {
    private githubService: GitHubService;
    private aiService: AIService;

    constructor() {
        this.githubService = new GitHubService();
        this.aiService = new AIService();
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

    private getBranchPrompt(userPrompt: string): string {
        const promptPath = path.join(__dirname, '../prompts/branch-naming.md');
        const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
        return promptTemplate.replace('{USER_PROMPT}', userPrompt);
    }

    private getPRPrompt(originalPrompt: string, totalFiles: number, changesText: string): string {
        const promptPath = path.join(__dirname, '../prompts/pr-description.md');
        const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
        return promptTemplate
            .replace('{USER_PROMPT}', originalPrompt)
            .replace('{TOTAL_FILES}', totalFiles.toString())
            .replace('{CHANGES_TEXT}', changesText);
    }

    async getBranchName(request: ExecuteRequest): Promise<string> {
        console.log('🤖 Getting branch name from AI...');

        if (!request.apiKey || !request.prompt) {
            throw new Error("API key and prompt are required to generate a branch name.");
        }

        const aiProvider = this.aiService.detectProvider(request.apiKey);
        const branchPrompt = this.getBranchPrompt(request.prompt);

        let aiResponse: AIResponse;
        if (aiProvider === 'anthropic') {
            aiResponse = await this.aiService.generateBranchNameWithClaude(request.apiKey, branchPrompt, request.model);
        } else {
            aiResponse = await this.aiService.generateBranchNameWithGPT(request.apiKey, branchPrompt, request.model);
        }

        let branchName = aiResponse.content.trim().toLowerCase();
        
        branchName = branchName.replace(/[^a-z0-9-\/]/g, '-');
        
        const validPrefixes = ['feat/', 'fix/', 'chore/', 'docs/', 'style/', 'refactor/', 'test/', 'perf/'];
        const hasValidPrefix = validPrefixes.some(prefix => branchName.startsWith(prefix));
        
        if (!hasValidPrefix) {
            branchName = `feat/${branchName}`;
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

    async generateCode(request: ExecuteRequest, gitService: GitService, branchName: string): Promise<void> {
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
                await this.aiService.generateCodeWithCodexCLI(request.apiKey, enhancedPrompt, workspacePath, request.model);
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
            let fileInfo: string;
            
            try {
                if (this.isBinaryFile(file.buffer)) {
                    console.log(`📁 Skipping binary file: ${file.originalname}`);
                    fileInfo = `\n**File: ${file.originalname}** (binary file - content not included)\n`;
                } else {
                    const fileContent = this.validateAndConvertToUTF8(file.buffer);
                    if (fileContent === null) {
                        console.warn(`⚠️  Invalid UTF-8 content in file ${file.originalname}`);
                        fileInfo = `\n**File: ${file.originalname}** (invalid UTF-8 encoding - content not included)\n`;
                    } else {
                        const maxFileSize = 5000000;
                        const truncatedContent = fileContent.length > maxFileSize 
                            ? fileContent.substring(0, maxFileSize) + '\n... (content truncated due to size)'
                            : fileContent;

                        fileInfo = `\n**File: ${file.originalname}**\n\`\`\`\n${truncatedContent}\n\`\`\`\n`;
                        console.log(`📄 Added file content: ${file.originalname} (${file.size} bytes)`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not read file ${file.originalname}:`, error);
                fileInfo = `\n**File: ${file.originalname}** (could not read content)\n`;
            }
            
            enhancedPrompt += fileInfo;
        }
        
        enhancedPrompt += '\n--- END OF UPLOADED FILES ---\n\nPlease consider the above files when implementing the requested changes.';
        
        return enhancedPrompt;
    }

    private isBinaryFile(buffer: Buffer): boolean {
        // Check for common binary file signatures and null bytes
        const sample = buffer.subarray(0, 8000); // Check first 8KB
        
        // Check for null bytes (common in binary files)
        for (let i = 0; i < sample.length; i++) {
            if (sample[i] === 0) {
                return true;
            }
        }
        
        // Check for high ratio of non-printable characters
        let nonPrintableCount = 0;
        for (let i = 0; i < sample.length; i++) {
            const byte = sample[i];
            // Count non-printable ASCII characters (excluding common whitespace)
            if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
                nonPrintableCount++;
            }
        }
        
        return (nonPrintableCount / sample.length) > 0.3; // More than 30% non-printable
    }

    private validateAndConvertToUTF8(buffer: Buffer): string | null {
        try {
            const content = buffer.toString('utf-8');
            
            // Check for replacement characters which indicate invalid UTF-8
            if (content.includes('\uFFFD')) {
                return null;
            }
            
            // Validate that the string doesn't contain unpaired surrogates
            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                // Check for unpaired high surrogate
                if (char >= 0xD800 && char <= 0xDBFF) {
                    if (i + 1 >= content.length) {
                        return null; // High surrogate at end of string
                    }
                    const nextChar = content.charCodeAt(i + 1);
                    if (nextChar < 0xDC00 || nextChar > 0xDFFF) {
                        return null; // High surrogate not followed by low surrogate
                    }
                    i++; // Skip the low surrogate
                }
                // Check for unpaired low surrogate
                else if (char >= 0xDC00 && char <= 0xDFFF) {
                    return null; // Low surrogate without preceding high surrogate
                }
            }
            
            return content;
        } catch (error) {
            return null;
        }
    }

    async generatePRDescription(apiKey: string, originalPrompt: string, changeSummary: {
        totalFiles: number;
        changes: Array<{
            path: string;
            status: string;
        }>;
    }, model?: string): Promise<string> {
        console.log('🤖 Generating PR description with AI...');

        const aiProvider = this.aiService.detectProvider(apiKey);
        
        const changesText = changeSummary.changes
            .map(change => `- ${change.path} (${change.status})`)
            .join('\n');

        const prDescriptionPrompt = this.getPRPrompt(originalPrompt, changeSummary.totalFiles, changesText);

        let aiResponse: AIResponse;
        if (aiProvider === 'anthropic') {
            aiResponse = await this.aiService.generatePRDescriptionWithClaude(apiKey, prDescriptionPrompt, model);
        } else {
            aiResponse = await this.aiService.generatePRDescriptionWithGPT(apiKey, prDescriptionPrompt, model);
        }

        const prDescription = aiResponse.content.trim();
        console.log('📄 Generated PR description');
        
        return prDescription;
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