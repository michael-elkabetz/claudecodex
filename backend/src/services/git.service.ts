import simpleGit, {SimpleGit} from 'simple-git';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export class GitService {
    private git: SimpleGit;
    private workDir: string = '';

    constructor() {
        this.git = simpleGit();
    }

    /**
     * Clone repository to local filesystem
     */
    async cloneRepository(githubUrl: string, branchName: string, token: string): Promise<void> {
        try {
            this.workDir = path.join(os.tmpdir(), 'github-repos', branchName);
            const urlWithToken = githubUrl.replace('https://github.com/', `https://${token}@github.com/`);

            await fs.ensureDir(this.workDir);

            await this.git.clone(urlWithToken, this.workDir, ['--branch', branchName]);

            this.git = simpleGit(this.workDir);

            await this.configureGitUser();
        } catch (error) {
            console.error('Error cloning repository:', error);
            throw new Error(`Failed to clone repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private async configureGitUser(): Promise<void> {
        try {
            await this.git.addConfig('user.name', 'ClaudeCodex AI');
            await this.git.addConfig('user.email', 'agent@claudecodex.com');
        } catch (error) {
            console.error('Error configuring Git user:', error);
            throw new Error(`Failed to configure Git user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Make changes to README file
     */
    async updateReadme(prompt: string): Promise<void> {
        try {
            const readmePath = path.join(this.workDir, 'README.md');

            let readmeContent = '';

            if (await fs.pathExists(readmePath)) {
                readmeContent = await fs.readFile(readmePath, 'utf-8');
            } else {
                readmeContent = '# Repository\n\nThis repository has been updated.\n';
            }

            const timestamp = new Date().toISOString();
            const updateSection = `\n\n## AI-Generated Update\n\n**Date:** ${timestamp}\n**Prompt:** ${prompt}\n**Status:** Updated automatically by AI agent\n`;

            readmeContent += updateSection;

            await fs.writeFile(readmePath, readmeContent, 'utf-8');

            console.log('README updated successfully');
        } catch (error) {
            console.error('Error updating README:', error);
            throw new Error(`Failed to update README: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Commit and push changes
     */
    async commitAndPush(commitMessage: string, branchName: string): Promise<void> {
        try {
            // Check what files are staged for commit
            const status = await this.git.status();

            if (status.files.length === 0) {
                console.log('⚠️  No changes detected to commit');
                return;
            }

            console.log('📝 Files to be committed:');
            status.files.forEach(file => {
                const statusSymbol = file.index === 'M' ? '📝' : file.index === 'A' ? '➕' : file.index === 'D' ? '❌' : '📄';
                console.log(`   ${statusSymbol} ${file.path} (${file.index || 'untracked'})`);
            });

            await this.git.add('.');
            await this.git.commit(commitMessage);
            await this.git.push('origin', branchName);

            console.log(`📊 Total files committed: ${status.files.length}`);
            console.log('✅ Changes committed and pushed successfully');
        } catch (error) {
            console.error('Error committing and pushing:', error);
            throw new Error(`Failed to commit and push: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Clean up temporary files
     */
    async cleanup(): Promise<void> {
        try {
            if (this.workDir && await fs.pathExists(this.workDir)) {
                await fs.remove(this.workDir);
                console.log('Temporary files cleaned up');
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    /**
     * Get current working directory
     */
    getWorkDir(): string {
        return this.workDir;
    }

    /**
     * Get list of changed files in the current branch
     */
    async getChangedFiles(): Promise<string[]> {
        try {
            const status = await this.git.status();
            return status.files.map(file => `${file.path} (${file.index || 'untracked'})`);
        } catch (error) {
            console.error('Error getting changed files:', error);
            return [];
        }
    }
}