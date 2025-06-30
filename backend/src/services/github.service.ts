import {Octokit} from '@octokit/rest';
import {GitHubAuthRequest, GitHubAuthResponse} from '../types/api.types';

export interface GitHubRepo {
    owner: string;
    repo: string;
}

export class GitHubService {
    private octokit: Octokit | null = null;

    private initOctokit(token: string): void {
        if (!this.octokit) {
            this.octokit = new Octokit({
                auth: token,
            });
        }
    }

    async exchangeCodeForToken(authRequest: GitHubAuthRequest): Promise<GitHubAuthResponse> {
        try {
            const params = new URLSearchParams({
                client_id: authRequest.client_id,
                client_secret: process.env.GITHUB_CLIENT_SECRET || '[GITHUB_CLIENT_SECRET]',
                code: authRequest.code,
                redirect_uri: authRequest.redirect_uri,
            });

            const response = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });

            const data = await response.json() as any;

            if (!response.ok || data.error) {
                throw new Error(data.error_description || 'Failed to exchange code for token');
            }

            if (!data.access_token) {
                throw new Error('No access token received from GitHub');
            }

            return {
                success: true,
                message: 'GitHub authorization successful',
                data: {
                    access_token: data.access_token,
                },
            };
        } catch (error) {
            console.error('Error exchanging GitHub code:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to exchange GitHub code'
            };
        }
    }

    async validateToken(token: string): Promise<boolean> {
        try {
            this.initOctokit(token);
            await this.octokit!.rest.users.getAuthenticated();
            return true;
        } catch (error) {
            console.error('Error validating GitHub token:', error);
            return false;
        }
    }

    async createBranch(token: string, owner: string, repo: string, branchName: string, fromBranch: string = 'main'): Promise<void> {
        try {
            this.initOctokit(token);

            const baseBranch = await this.octokit!.rest.repos.getBranch({
                owner,
                repo,
                branch: fromBranch,
            });

            await this.octokit!.rest.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${branchName}`,
                sha: baseBranch.data.commit.sha,
            });
            console.log(`✅ Branch '${branchName}' created successfully!`);
        } catch (error) {
            console.error('Error creating branch:', error);
            throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createPullRequest(token: string, owner: string, repo: string, title: string, body: string, head: string, base: string = 'main'): Promise<any> {
        try {
            this.initOctokit(token);

            const existingPRs = await this.octokit!.rest.pulls.list({
                owner,
                repo,
                head: `${owner}:${head}`,
                state: 'open',
            });

            if (existingPRs.data.length > 0) {
                console.log(`✅ PR already exists for branch '${head}':`, existingPRs.data[0].html_url);
                return existingPRs.data[0];
            }

            const response = await this.octokit!.rest.pulls.create({
                owner,
                repo,
                title,
                body,
                head,
                base,
            });

            return response.data;
        } catch (error: any) {
            if (error.message && error.message.includes('A pull request already exists')) {
                console.log(`🔄 PR already exists for branch '${head}', fetching existing PR...`);

                try {
                    const headFormats = [`${owner}:${head}`, head];

                    for (const headFormat of headFormats) {
                        const existingPRs = await this.octokit!.rest.pulls.list({
                            owner,
                            repo,
                            head: headFormat,
                            state: 'open',
                        });

                        if (existingPRs.data.length > 0) {
                            console.log(`✅ Found existing PR:`, existingPRs.data[0].html_url);
                            return existingPRs.data[0];
                        }
                    }

                    const allPRs = await this.octokit!.rest.pulls.list({
                        owner,
                        repo,
                        state: 'open',
                    });

                    const matchingPR = allPRs.data.find(pr => pr.head.ref === head);
                    if (matchingPR) {
                        console.log(`✅ Found existing PR by manual search:`, matchingPR.html_url);
                        return matchingPR;
                    }

                } catch (fetchError) {
                    console.error('Error fetching existing PR:', fetchError);
                }
            }

            console.error('Error creating pull request:', error);
            throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    parseGitHubUrl(url: string): GitHubRepo | null {
        try {
            const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
            if (!match) return null;

            return {
                owner: match[1],
                repo: match[2].replace(/\.git$/, ''),
            };
        } catch (error) {
            console.error('Error parsing GitHub URL:', error);
            return null;
        }
    }

    async getBranches(token: string, owner: string, repo: string): Promise<any[]> {
        try {
            this.initOctokit(token);

            const response = await this.octokit!.rest.repos.listBranches({
                owner,
                repo,
                per_page: 100,
            });

            return response.data.map(branch => ({
                name: branch.name,
                protected: branch.protected,
                sha: branch.commit.sha,
            }));
        } catch (error) {
            console.error('Error getting branches:', error);
            throw new Error(`Failed to get branches: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
} 