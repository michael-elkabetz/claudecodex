import { AIService, TaskType, AIProvider, AIResponse } from '../services/ai.service';
import * as fs from 'fs';
import * as path from 'path';

export interface CreateBranchRequest {
    apiKey: string;
    prompt: string;
    model?: string;
}

export interface GenerateCodeRequest {
    apiKey: string;
    prompt: string;
    workspacePath?: string;
    model?: string;
    files?: Express.Multer.File[];
}

export interface CreatePRRequest {
    apiKey: string;
    originalPrompt: string;
    changeSummary: {
        totalFiles: number;
        changes: Array<{
            path: string;
            status: string;
        }>;
    };
    model?: string;
}

export class DevTools {
    private aiService: AIService;

    constructor() {
        this.aiService = new AIService();
    }

    async createBranch(request: CreateBranchRequest): Promise<string> {
        console.log('🤖 Generating branch name from AI...');

        if (!request.apiKey || !request.prompt) {
            throw new Error("API key and prompt are required to generate a branch name.");
        }

        const aiProvider = this.aiService.detectAIProvider(request.apiKey);
        const branchPrompt = this.getBranchPrompt(request.prompt);

        const aiResponse = await this.aiService.generate({
            taskType: TaskType.Text,
            aiProvider: aiProvider,
            apiKey: request.apiKey,
            prompt: branchPrompt,
            model: request.model
        });

        let branchName = aiResponse.content.trim().toLowerCase();

        branchName = branchName.replace(/[^a-z0-9-\/]/g, '-');

        const validPrefixes = ['feat/', 'fix/', 'chore/'];
        const hasValidPrefix = validPrefixes.some(prefix => branchName.startsWith(prefix));

        if (!hasValidPrefix) {
            branchName = `feat/${branchName}`;
        }

        branchName = branchName.substring(0, 50);

        console.log('🌿 Generated branch name:', branchName);
        return branchName;
    }

    async generateCode(request: GenerateCodeRequest): Promise<AIResponse> {
        if (!request.apiKey || !request.prompt) {
            throw new Error("API key and prompt are required to generate code.");
        }

        const aiProvider = this.aiService.detectAIProvider(request.apiKey);
        
        let enhancedPrompt = request.prompt;
        if (request.files && request.files.length > 0) {
            enhancedPrompt = await this.enhancePromptWithFiles(request.prompt, request.files);
        }

        console.log(`🤖 Generating code with ${aiProvider === AIProvider.ClaudeCode ? 'Claude Code' : 'Codex'}...`);
        
        const aiResponse = await this.aiService.generate({
            taskType: TaskType.Code,
            aiProvider: aiProvider,
            apiKey: request.apiKey,
            prompt: enhancedPrompt,
            model: request.model,
            workspacePath: request.workspacePath
        });

        return aiResponse;
    }

    async createPR(request: CreatePRRequest): Promise<string> {
        console.log('📝 Generating pull request description...');

        if (!request.apiKey || !request.originalPrompt) {
            throw new Error("API key and original prompt are required to generate PR description.");
        }

        const aiProvider = this.aiService.detectAIProvider(request.apiKey);
        const changesText = request.changeSummary.changes.map(c => `${c.status}: ${c.path}`).join('\n');
        const prPrompt = this.getPRPrompt(request.originalPrompt, request.changeSummary.totalFiles, changesText);

        const aiResponse = await this.aiService.generate({
            taskType: TaskType.Text,
            aiProvider: aiProvider,
            apiKey: request.apiKey,
            prompt: prPrompt,
            model: request.model
        });

        return aiResponse.content;
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
        const sample = buffer.subarray(0, 8000);

        for (let i = 0; i < sample.length; i++) {
            if (sample[i] === 0) {
                return true;
            }
        }

        let nonPrintableCount = 0;
        for (let i = 0; i < sample.length; i++) {
            const byte = sample[i];
            if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
                nonPrintableCount++;
            }
        }

        return (nonPrintableCount / sample.length) > 0.3;
    }

    private validateAndConvertToUTF8(buffer: Buffer): string | null {
        try {
            const content = buffer.toString('utf-8');

            if (content.includes('\uFFFD')) {
                return null;
            }

            for (let i = 0; i < content.length; i++) {
                const char = content.charCodeAt(i);
                if (char >= 0xD800 && char <= 0xDBFF) {
                    if (i + 1 >= content.length) {
                        return null;
                    }
                    const nextChar = content.charCodeAt(i + 1);
                    if (nextChar < 0xDC00 || nextChar > 0xDFFF) {
                        return null;
                    }
                    i++;
                }
                else if (char >= 0xDC00 && char <= 0xDFFF) {
                    return null;
                }
            }

            return content;
        } catch (error) {
            return null;
        }
    }
} 