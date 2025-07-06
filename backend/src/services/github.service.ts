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

    async getDefaultBranch(token: string, owner: string, repo: string): Promise<string> {
        try {
            this.initOctokit(token);
            
            const repoInfo = await this.octokit!.rest.repos.get({
                owner,
                repo,
            });
            
            return repoInfo.data.default_branch;
        } catch (error) {
            console.error('Error fetching default branch:', error);
            // Fallback to common default branches
            const fallbackBranches = ['main', 'master'];
            
            for (const branch of fallbackBranches) {
                try {
                    await this.octokit!.rest.repos.getBranch({
                        owner,
                        repo,
                        branch,
                    });
                    console.log(`✅ Found fallback branch: ${branch}`);
                    return branch;
                } catch (branchError) {
                    continue;
                }
            }
            
            throw new Error('Could not determine default branch');
        }
    }

    async createBranch(token: string, owner: string, repo: string, branchName: string, fromBranch?: string): Promise<{branchName: string; branchUrl: string; sha: string}> {
        try {
            this.initOctokit(token);

            const baseBranchName = fromBranch || await this.getDefaultBranch(token, owner, repo);

            const baseBranch = await this.octokit!.rest.repos.getBranch({
                owner,
                repo,
                branch: baseBranchName,
            });

            const result = await this.octokit!.rest.git.createRef({
                owner,
                repo,
                ref: `refs/heads/${branchName}`,
                sha: baseBranch.data.commit.sha,
            });
            
            console.log(`✅ Branch '${branchName}' created successfully from '${baseBranchName}'!`);
            
            return {
                branchName,
                branchUrl: `https://github.com/${owner}/${repo}/tree/${branchName}`,
                sha: result.data.object.sha
            };
        } catch (error) {
            console.error('Error creating branch:', error);
            throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createPullRequest(token: string, owner: string, repo: string, title: string, body: string, head: string, base?: string): Promise<{pullRequestUrl: string; pullRequestNumber: number}> {
        try {
            this.initOctokit(token);

            const baseBranchName = base || await this.getDefaultBranch(token, owner, repo);

            const existingPRs = await this.octokit!.rest.pulls.list({
                owner,
                repo,
                head: `${owner}:${head}`,
                state: 'open',
            });

            if (existingPRs.data.length > 0) {
                console.log(`✅ PR already exists for branch '${head}':`, existingPRs.data[0].html_url);
                return {
                    pullRequestUrl: existingPRs.data[0].html_url,
                    pullRequestNumber: existingPRs.data[0].number
                };
            }

            const response = await this.octokit!.rest.pulls.create({
                owner,
                repo,
                title,
                body,
                head,
                base: baseBranchName,
            });

            console.log(`✅ PR created successfully targeting '${baseBranchName}'!`);

            return {
                pullRequestUrl: response.data.html_url,
                pullRequestNumber: response.data.number
            };
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
                            return {
                                pullRequestUrl: existingPRs.data[0].html_url,
                                pullRequestNumber: existingPRs.data[0].number
                            };
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
                        return {
                            pullRequestUrl: matchingPR.html_url,
                            pullRequestNumber: matchingPR.number
                        };
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