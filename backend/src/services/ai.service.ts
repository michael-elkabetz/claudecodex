import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {spawn} from 'child_process';

export interface AIResponse {
    content: string;
    usage: {
        inputTokens: number;
        outputTokens: number;
        totalTokens: number;
    };
}

export class AIService {
    private anthropic: Anthropic | null = null;
    private openai: OpenAI | null = null;

    private readonly DEFAULT_OPENAI_MODEL = 'gpt-4.1-mini';
    private readonly DEFAULT_ANTHROPIC_MODEL = 'claude-3-5-sonnet-20240620';

    private readonly VALID_OPENAI_MODELS = [
        'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
        'gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-4-turbo',
        'gpt-3.5-turbo', 'o1', 'o3', 'o4-mini'
    ];

    private readonly VALID_ANTHROPIC_MODELS = [
        'claude-3-5-sonnet-20240620', 'claude-3-5-haiku-20241022',
        'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'
    ];

    private initAnthropic(apiKey: string): void {
        if (!this.anthropic) {
            this.anthropic = new Anthropic({
                apiKey: apiKey,
            });
        }
    }

    private initOpenAI(apiKey: string): void {
        if (!this.openai) {
            this.openai = new OpenAI({
                apiKey: apiKey,
            });
        }
    }

    validateAnthropicKey(apiKey: string): boolean {
        return apiKey.startsWith('sk-ant-');
    }

    validateOpenAIKey(apiKey: string): boolean {
        return apiKey.startsWith('sk-') && !apiKey.startsWith('sk-ant-');
    }

    detectProvider(apiKey: string): 'anthropic' | 'openai' | 'unknown' {
        if (this.validateAnthropicKey(apiKey)) return 'anthropic';
        if (this.validateOpenAIKey(apiKey)) return 'openai';
        return 'unknown';
    }

    async generateBranchNameWithGPT(apiKey: string, prompt: string, model?: string): Promise<AIResponse> {
        try {
            this.initOpenAI(apiKey);

            const response = await this.openai!.chat.completions.create({
                model: this.validateAndGetOpenAIModel(model),
                max_completion_tokens: 50,
                temperature: 0.1,
                messages: [{role: 'user', content: prompt}]
            });

            const content = response.choices[0]?.message?.content || '';
            const usage = response.usage;

            if (!usage) {
                throw new Error('No usage information returned from OpenAI');
            }


            return {
                content,
                usage: {
                    inputTokens: usage.prompt_tokens,
                    outputTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
            };
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generateBranchNameWithClaude(apiKey: string, prompt: string, model?: string): Promise<AIResponse> {
        try {
            this.initAnthropic(apiKey);

            const response = await this.anthropic!.messages.create({
                model: this.validateAndGetAnthropicModel(model),
                max_tokens: 50,
                temperature: 0.1,
                messages: [{role: 'user', content: prompt}]
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';
            const usage = response.usage;


            return {
                content,
                usage: {
                    inputTokens: usage.input_tokens,
                    outputTokens: usage.output_tokens,
                    totalTokens: usage.input_tokens + usage.output_tokens,
                },
            };
        } catch (error) {
            console.error('Error with Anthropic API:', error);
            throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generatePRDescriptionWithClaude(apiKey: string, prompt: string, model?: string): Promise<AIResponse> {
        try {
            this.initAnthropic(apiKey);

            const response = await this.anthropic!.messages.create({
                model: this.validateAndGetAnthropicModel(model),
                max_tokens: 500,
                temperature: 0.3,
                messages: [{role: 'user', content: prompt}]
            });

            const content = response.content[0].type === 'text' ? response.content[0].text : '';
            const usage = response.usage;

            return {
                content,
                usage: {
                    inputTokens: usage.input_tokens,
                    outputTokens: usage.output_tokens,
                    totalTokens: usage.input_tokens + usage.output_tokens,
                },
            };
        } catch (error) {
            console.error('Error with Anthropic API:', error);
            throw new Error(`Anthropic API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generatePRDescriptionWithGPT(apiKey: string, prompt: string, model?: string): Promise<AIResponse> {
        try {
            this.initOpenAI(apiKey);

            const response = await this.openai!.chat.completions.create({
                model: this.validateAndGetOpenAIModel(model),
                max_completion_tokens: 500,
                temperature: 0.3,
                messages: [{role: 'user', content: prompt}]
            });

            const content = response.choices[0]?.message?.content || '';
            const usage = response.usage;

            if (!usage) {
                throw new Error('No usage information returned from OpenAI');
            }

            return {
                content,
                usage: {
                    inputTokens: usage.prompt_tokens,
                    outputTokens: usage.completion_tokens,
                    totalTokens: usage.total_tokens
                },
            };
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generateCodeWithClaudeCodeCLI(apiKey: string, prompt: string, workspacePath?: string): Promise<AIResponse> {
        try {
            if (!this.validateAnthropicKey(apiKey)) {
                throw new Error('Invalid Anthropic API key format. Must start with sk-ant-');
            }

            const sanitizedPrompt = this.sanitizePrompt(prompt);

            const result = await this.executeCLICommand('claude', ['-p', '--dangerously-skip-permissions'], {
                input: sanitizedPrompt,
                env: {
                    ANTHROPIC_API_KEY: apiKey,
                },
                cwd: workspacePath || process.cwd(),
                timeout: 1000000
            });

            if (result.exitCode !== 0) {
                console.error('❌ Claude CLI failed:', {
                    exitCode: result.exitCode,
                    stderr: result.stderr,
                    stdout: result.stdout
                });
                throw new Error(`Claude CLI failed with exit code ${result.exitCode}: ${result.stderr}`);
            }

            console.log('✅ Claude Code CLI completed successfully');
            const estimatedInputTokens = Math.ceil(prompt.length / 4);
            const estimatedOutputTokens = Math.ceil(result.stdout.length / 4);
            const totalTokens = estimatedInputTokens + estimatedOutputTokens;


            return {
                content: result.stdout.trim(),
                usage: {
                    inputTokens: estimatedInputTokens,
                    outputTokens: estimatedOutputTokens,
                    totalTokens
                },
            };
        } catch (error) {
            console.error('Error with Claude Code CLI:', error);
            throw new Error(`Claude Code CLI error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async generateCodeWithCodexCLI(apiKey: string, prompt: string, workspacePath?: string, model?: string): Promise<AIResponse> {
        try {
            if (!this.validateOpenAIKey(apiKey)) {
                throw new Error('Invalid OpenAI API key format. Must start with sk-');
            }

            const sanitizedPrompt = this.sanitizePrompt(prompt);

            const codexArgs = ['-q', '-a', 'auto-edit'];
            if (model && this.VALID_OPENAI_MODELS.includes(model)) {
                codexArgs.push('-m', model);
            }
            codexArgs.push(sanitizedPrompt);

            const result = await this.executeCLICommand('codex', codexArgs, {
                env: {
                    OPENAI_API_KEY: apiKey,
                },
                cwd: workspacePath || process.cwd(),
                timeout: 1000000
            });

            if (result.exitCode !== 0) {
                console.error('❌ Codex CLI failed with exit code:', result.exitCode);
                console.error('📥 STDERR:', result.stderr);
                throw new Error(`Codex CLI failed with exit code ${result.exitCode}. Stderr: ${result.stderr}. Stdout: ${result.stdout}`);
            }

            console.log('✅ Codex CLI completed successfully');
            return {
                content: result.stdout,
                usage: {
                    inputTokens: 0,
                    outputTokens: 0,
                    totalTokens: 0
                },
            };
        } catch (error) {
            console.error('❌ Error in generateCodeWithCodexCLI:', error);
            throw new Error(`Codex CLI error: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async executeCLICommand(
        command: string,
        args: string[],
        options: {
            input?: string;
            env?: Record<string, string>;
            cwd?: string;
            timeout?: number;
        }
    ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        return new Promise((resolve, reject) => {
            const child = spawn(command, args, {
                cwd: options.cwd,
                env: {
                    ...process.env,
                    ...options.env,
                    CI: 'true',
                    NODE_ENV: 'production',
                    FORCE_COLOR: '0',
                    NO_COLOR: '1'
                },
                stdio: options.input ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';
            let isResolved = false;

            const timeoutId = setTimeout(() => {
                if (!isResolved) {
                    isResolved = true;
                    child.kill('SIGTERM');
                    reject(new Error(`Command timeout after ${options.timeout}ms`));
                }
            }, options.timeout || 300000);

            child.stdout?.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
            });

            child.stderr?.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
            });

            child.on('close', (exitCode) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    resolve({
                        stdout,
                        stderr,
                        exitCode: exitCode || 0
                    });
                }
            });

            child.on('error', (error) => {
                if (!isResolved) {
                    isResolved = true;
                    clearTimeout(timeoutId);
                    reject(new Error(`Failed to start process: ${error.message}`));
                }
            });

            if (options.input && child.stdin) {
                child.stdin.write(options.input);
                child.stdin.end();
            }
        });
    }

    private sanitizePrompt(prompt: string): string {
        try {
            let sanitized = prompt.replace(/\uFFFD/g, '');

            sanitized = sanitized.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '');
            sanitized = sanitized.replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
            const buffer = Buffer.from(sanitized, 'utf-8');
            return buffer.toString('utf-8');
        } catch (error) {
            console.warn('⚠️  Error sanitizing prompt, using original:', error);
            return prompt;
        }
    }

    private validateAndGetOpenAIModel(model?: string): string {
        if (!model) {
            return this.DEFAULT_OPENAI_MODEL;
        }
        
        if (!this.VALID_OPENAI_MODELS.includes(model)) {
            console.warn(`Invalid OpenAI model '${model}', using default: ${this.DEFAULT_OPENAI_MODEL}`);
            return this.DEFAULT_OPENAI_MODEL;
        }
        
        return model;
    }

    private validateAndGetAnthropicModel(model?: string): string {
        if (!model) {
            return this.DEFAULT_ANTHROPIC_MODEL;
        }
        
        if (!this.VALID_ANTHROPIC_MODELS.includes(model)) {
            console.warn(`Invalid Anthropic model '${model}', using default: ${this.DEFAULT_ANTHROPIC_MODEL}`);
            return this.DEFAULT_ANTHROPIC_MODEL;
        }
        
        return model;
    }

    getAvailableModels(): { openai: string[], anthropic: string[] } {
        return {
            openai: [...this.VALID_OPENAI_MODELS],
            anthropic: [...this.VALID_ANTHROPIC_MODELS]
        };
    }
} 