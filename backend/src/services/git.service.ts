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

    async commitAndPush(commitMessage: string, branchName: string): Promise<void> {
        try {
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

    getWorkDir(): string {
        return this.workDir;
    }

    async getChangeSummary(): Promise<{
        totalFiles: number;
        changes: Array<{
            path: string;
            status: string;
        }>;
    }> {
        try {
            const status = await this.git.status();
            
            const changes = status.files.map(file => {
                let statusDescription = 'modified';
                
                if (file.index === 'M') {
                    statusDescription = 'modified';
                } else if (file.index === 'A') {
                    statusDescription = 'added';
                } else if (file.index === 'D') {
                    statusDescription = 'deleted';
                } else if (!file.index) {
                    statusDescription = 'new file';
                }
                
                return {
                    path: file.path,
                    status: statusDescription
                };
            });

            return {
                totalFiles: status.files.length,
                changes
            };
        } catch (error) {
            console.error('Error getting change summary:', error);
            return {
                totalFiles: 0,
                changes: []
            };
        }
    }
}