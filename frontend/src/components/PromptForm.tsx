import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {useEffect, useState, useRef, KeyboardEvent} from "react";
import {AlertCircle, CheckCircle, ExternalLink, Github, GitPullRequest, Key, Loader2, Send, ArrowUp, Paperclip, Plus, X, GitBranch, ChevronDown} from "lucide-react";
import {useToast} from "@/hooks/use-toast";
import {GITHUB_CONFIG} from "@/config/github";
import {CORE_API_URL} from "@/config/api";
import ProcessAnimation from "./ProcessAnimation";

const PromptForm = () => {
    const [githubUrl, setGithubUrl] = useState("");
    const [prompt, setPrompt] = useState("");
    const [apiKey, setApiKey] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [prUrl, setPrUrl] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [branches, setBranches] = useState<Array<{name: string; protected: boolean; sha: string}>>([]);
    const [selectedBranch, setSelectedBranch] = useState<string>("");
    const [isFetchingBranches, setIsFetchingBranches] = useState(false);
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const [prDetails, setPrDetails] = useState<{
        prUrl?: string;
        branchName?: string;
        prNumber?: number;
        processedAt?: string;
        repositoryName?: string;
        repositoryOwner?: string;
    }>({});
    const [githubToken, setGithubToken] = useState("");
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const {toast} = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const branchDropdownRef = useRef<HTMLDivElement>(null);

    // Check for GitHub OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = sessionStorage.getItem('github_oauth_state');

        if (code && state && state === storedState) {
            // Clear the URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('github_oauth_state');

            // Exchange code for token
            exchangeCodeForToken(code);
        }

        // Check for existing token
        const savedToken = localStorage.getItem('github_token');
        if (savedToken) {
            setGithubToken(savedToken);
            setIsAuthorized(true);
        }
    }, []);

    const generateRandomString = (length: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleGitHubAuth = () => {
        setIsAuthLoading(true);

        // Generate state for CSRF protection
        const state = generateRandomString(32);
        sessionStorage.setItem('github_oauth_state', state);

        // Redirect to GitHub OAuth
        const params = new URLSearchParams({
            client_id: GITHUB_CONFIG.CLIENT_ID,
            redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
            scope: GITHUB_CONFIG.SCOPES,
            state: state,
            response_type: 'code'
        });

        window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
    };

    const exchangeCodeForToken = async (code: string) => {
        try {
            const response = await fetch(`${CORE_API_URL}/github-auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    client_id: GITHUB_CONFIG.CLIENT_ID,
                    redirect_uri: GITHUB_CONFIG.REDIRECT_URI,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setGithubToken(result.data.access_token);
                setIsAuthorized(true);
                localStorage.setItem('github_token', result.data.access_token);

                toast({
                    title: "Authorization Successful",
                    description: "GitHub authorization completed successfully.",
                });
            } else {
                throw new Error(result.message || 'Failed to exchange code for token');
            }
        } catch (error) {
            toast({
                title: "Authorization Failed",
                description: error instanceof Error ? error.message : "Failed to authorize with GitHub.",
                variant: "destructive",
            });
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleLogout = () => {
        setGithubToken("");
        setIsAuthorized(false);
        localStorage.removeItem('github_token');

        toast({
            title: "Logged Out",
            description: "GitHub authorization has been revoked.",
        });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formRef.current?.requestSubmit();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!githubUrl || !prompt || !apiKey) {
            toast({
                title: "Missing Information",
                description: "Please provide a GitHub repository URL, prompt, and Anthropic API key.",
                variant: "destructive",
            });
            return;
        }

        if (!isAuthorized) {
            toast({
                title: "Authorization Required",
                description: "Please authorize the application to access your GitHub repositories before proceeding.",
                variant: "destructive",
            });
            return;
        }

        // Validate GitHub URL format
        const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
        if (!githubUrlPattern.test(githubUrl)) {
            toast({
                title: "Invalid GitHub URL",
                description: "Please provide a valid GitHub repository URL (e.g., https://github.com/username/repo)",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setHasError(false);

        try {
            const formData = new FormData();
            formData.append('prompt', prompt);
            formData.append('apiKey', apiKey);
            formData.append('githubUrl', githubUrl);
            formData.append('githubToken', githubToken);
            
            // Add selected branch only if it's not main or master
            if (selectedBranch && !['main', 'master'].includes(selectedBranch.toLowerCase())) {
                formData.append('branch', selectedBranch);
            }
            
            files.forEach((file) => {
                formData.append('files', file);
            });

            const response = await fetch(`${CORE_API_URL}/process`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok && result.success) {
                if (result.data?.pullRequestUrl) {
                    setPrUrl(result.data.pullRequestUrl);
                    setPrDetails({
                        prUrl: result.data.pullRequestUrl,
                        branchName: result.data.branchName,
                        prNumber: result.data.pullRequestNumber,
                        processedAt: result.data.processedAt,
                        repositoryName: result.data.repositoryName,
                        repositoryOwner: result.data.repositoryOwner,
                    });
                    toast({
                        title: "Success!",
                        description: result.message || "Pull request created successfully.",
                    });
                } else {
                    throw new Error("No pull request URL returned from server");
                }
            } else {
                const errorMessage = result.message || `Request failed with status ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            let errorMessage = "Failed to process your request. Please try again.";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }

            setHasError(true);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setGithubUrl("");
        setPrompt("");
        setApiKey("");
        setPrUrl("");
        setPrDetails({});
        setHasError(false);
        setFiles([]);
        setBranches([]);
        setSelectedBranch("");
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (files.length + selectedFiles.length > 2) {
            toast({
                title: "File Limit Exceeded",
                description: "You can upload a maximum of two files.",
                variant: "destructive",
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }
        
        setFiles(prev => [...prev, ...selectedFiles]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileRemove = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const fetchBranches = async (url: string, token: string) => {
        try {
            setIsFetchingBranches(true);
            setBranches([]);

            const response = await fetch(`${CORE_API_URL}/branches`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    githubUrl: url,
                    githubToken: token,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                const fetchedBranches = result.data.branches || [];
                setBranches(fetchedBranches);
                
                // Set default selected branch (prioritize 'main', then 'master', then first branch)
                if (fetchedBranches.length > 0) {
                    const mainBranch = fetchedBranches.find((b: {name: string; protected: boolean; sha: string}) => b.name === 'main');
                    const masterBranch = fetchedBranches.find((b: {name: string; protected: boolean; sha: string}) => b.name === 'master');
                    const defaultBranch = mainBranch || masterBranch || fetchedBranches[0];
                    setSelectedBranch(defaultBranch.name);
                }
            } else {
                console.error('Failed to fetch branches:', result.message);
                setBranches([]);
                setSelectedBranch("");
            }
        } catch (error) {
            console.error('Error fetching branches:', error);
            setBranches([]);
            setSelectedBranch("");
        } finally {
            setIsFetchingBranches(false);
        }
    };

    // Fetch branches when GitHub URL changes and user is authorized
    useEffect(() => {
        const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/;
        
        if (githubUrl && githubUrlPattern.test(githubUrl) && isAuthorized && githubToken) {
            const timeoutId = setTimeout(() => {
                fetchBranches(githubUrl, githubToken);
            }, 500); // Debounce to avoid too many requests

            return () => clearTimeout(timeoutId);
        } else {
            setBranches([]);
            setSelectedBranch("");
        }
    }, [githubUrl, isAuthorized, githubToken]);

    // Handle clicks outside dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: Event) => {
            if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
                setShowBranchDropdown(false);
            }
        };

        if (showBranchDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showBranchDropdown]);

    return (
        <section className="flex justify-center px-4 pt-2 pb-4 relative">
            <div className="w-full max-w-6xl">
                {/* Desktop Layout */}
                <div className="hidden lg:flex items-start gap-8">
                    {/* Spacer for when animation is visible */}
                    {(isLoading || prUrl) && <div className="w-24 flex-shrink-0"></div>}

                    {/* Forms Section */}
                    <div className={`w-full max-w-2xl space-y-4 transition-all duration-700 ${
                        isLoading || prUrl ? 'flex-1' : 'mx-auto'
                    }`}>
                        {/* Prompt Section */}
                        <div className="space-y-0 group">
                            <div className="bg-gray-200 px-4 py-1.5 rounded-t-md group-focus-within:bg-gray-300">
                                <Label htmlFor="prompt" className="text-sm font-medium text-gray-700">Build Anything</Label>
                            </div>
                            <div className="bg-white border rounded-b-md shadow-lg">
                                <form onSubmit={handleSubmit} ref={formRef}>
                                    <div className="p-4">
                                        <div className="relative">
                                            <GitPullRequest className="absolute left-1 top-1 h-4 w-4 text-gray-400"/>
                                            <Textarea
                                                id="prompt"
                                                placeholder="Ask ClaudeCodex to build..."
                                                className="min-h-[150px] resize-none pt-0 pb-1 px-1 pl-6 text-base focus:outline-none border-0 focus:ring-0 focus:border-0 focus:shadow-none outline-none"
                                                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                                value={prompt}
                                                onChange={(e) => {
                                                    setPrompt(e.target.value);
                                                    if (hasError) setHasError(false);
                                                }}
                                                onKeyDown={handleKeyDown}
                                                disabled={isLoading}
                                            />
                                            <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center gap-2">
                                                {/* Left side: Branch and File attachments */}
                                                <div className="flex items-center gap-1">
                                                    {/* Branch Selection */}
                                                    {isFetchingBranches && (
                                                        <div className="flex items-center bg-white text-gray-800 text-sm px-3 h-8 rounded-md border border-input shadow-sm">
                                                            <Loader2 className="h-3 w-3 mr-1.5 text-gray-500 animate-spin"/>
                                                            <span className="truncate max-w-20">Loading...</span>
                                                        </div>
                                                    )}
                                                    {!isFetchingBranches && selectedBranch && (
                                                        <div className="relative" ref={branchDropdownRef}>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                                                                disabled={isLoading}
                                                                className="flex items-center bg-white text-gray-800 text-sm px-3 h-8 rounded-md border border-input shadow-sm hover:bg-gray-50"
                                                            >
                                                                <GitBranch className="h-3 w-3 mr-1.5 text-gray-500"/>
                                                                <span className="truncate max-w-40">{selectedBranch}</span>
                                                                {branches.find(b => b.name === selectedBranch)?.protected && (
                                                                    <span className="ml-1 text-xs text-gray-500" title="Protected branch">🔒</span>
                                                                )}
                                                                <ChevronDown className="h-3 w-3 ml-1.5 text-gray-500"/>
                                                            </button>
                                                            
                                                            {showBranchDropdown && (
                                                                <div className="absolute z-20 left-0 bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto min-w-48">
                                                                    {branches.map((branch, index) => (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedBranch(branch.name);
                                                                                setShowBranchDropdown(false);
                                                                            }}
                                                                            className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                                                                                selectedBranch === branch.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                                            }`}
                                                                        >
                                                                            <GitBranch className="h-3 w-3 mr-2 text-gray-500"/>
                                                                            <span className="flex-1">{branch.name}</span>
                                                                            {branch.protected && (
                                                                                <span className="ml-2 text-xs text-gray-500" title="Protected branch">🔒</span>
                                                                            )}
                                                                            {selectedBranch === branch.name && (
                                                                                <CheckCircle className="h-3 w-3 ml-2 text-blue-600"/>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right side: Action Buttons */}
                                                <div className="flex items-center gap-2">
                                                    {/* Files */}
                                                    {files.map((file, index) => (
                                                        <div key={index} className="flex items-center bg-white text-gray-800 text-sm px-3 h-8 rounded-md border border-input shadow-sm">
                                                            <Paperclip className="h-3 w-3 mr-1.5 text-gray-500"/>
                                                            <span className="truncate max-w-20">{file.name}</span>
                                                            <Button
                                                                type="button"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-4 w-4 ml-2 p-0 hover:bg-gray-100"
                                                                onClick={() => handleFileRemove(index)}
                                                                disabled={isLoading}
                                                            >
                                                                <X className="h-2.5 w-2.5"/>
                                                                <span className="sr-only">Remove file</span>
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button 
                                                        type="button" 
                                                        size="icon" 
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={handleFileUploadClick}
                                                        disabled={isLoading || files.length >= 2}
                                                    >
                                                        <div className="relative">
                                                            <Paperclip className="h-4 w-4"/>
                                                        </div>
                                                        <span className="sr-only">Upload File</span>
                                                    </Button>
                                                    <Button type="submit" size="icon" className="h-8 w-8"
                                                            disabled={isLoading}>
                                                        <ArrowUp className="h-4 w-4"/>
                                                        <span className="sr-only">Generate Pull Request</span>
                                                    </Button>
                                                </div>
                                            </div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.yml,.yaml,.pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* GitHub URL Section */}
                        <div className="relative">
                            <div className="space-y-0 group">
                                <div className="bg-gray-200 px-4 py-1.5 rounded-t-md group-focus-within:bg-gray-300">
                                    <Label htmlFor="github-url" className="text-sm font-medium text-gray-700">GitHub Repository URL</Label>
                                </div>
                                <div className="bg-white border rounded-b-md shadow-lg p-4">
                                    <div className="relative">
                                        <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                        <Input
                                            id="github-url"
                                            type="url"
                                            placeholder="https://github.com/username/repository"
                                            value={githubUrl}
                                            onChange={(e) => {
                                                setGithubUrl(e.target.value);
                                                if (hasError) setHasError(false);
                                            }}
                                            disabled={isLoading}
                                            className="pl-10 text-base border-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none outline-none"
                                            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating GitHub Authorization Icon */}
                            <div className="absolute -top-3 right-4">
                                {isAuthorized ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        disabled={isLoading}
                                        className="bg-white text-green-600 border-green-300 hover:bg-green-50 shadow-md"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1"/>
                                        Authorized
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGitHubAuth}
                                        disabled={isLoading || isAuthLoading}
                                        className="bg-white text-orange-600 border-orange-300 hover:bg-orange-50 shadow-md"
                                    >
                                        {isAuthLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin"/>
                                                Authorizing...
                                            </>
                                        ) : (
                                            <>
                                                <Github className="w-4 h-4 mr-1"/>
                                                Authorize
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* API Key Section */}
                        <div className="space-y-0 group">
                            <div className="bg-gray-200 px-4 py-1.5 rounded-t-md group-focus-within:bg-gray-300">
                                <Label htmlFor="api-key" className="text-sm font-medium text-gray-700">Code Agent Key</Label>
                            </div>
                            <div className="bg-white border rounded-b-md shadow-lg p-4">
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                    <Input
                                        id="api-key"
                                        type="password"
                                        placeholder="sk-..."
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            if (hasError) setHasError(false);
                                        }}
                                        className="pl-10 text-base border-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none outline-none"
                                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Process Animation */}
                    <ProcessAnimation 
                        isVisible={isLoading || !!prUrl || hasError}
                        isComplete={!!prUrl && !isLoading && !hasError}
                        hasError={hasError}
                        prUrl={prUrl}
                        onReset={resetForm}
                        isExistingBranch={selectedBranch && !['main', 'master'].includes(selectedBranch.toLowerCase())}
                    />
                </div>

                {/* Mobile Layout */}
                <div className="lg:hidden space-y-4">
                    {/* Mobile Forms Section */}
                    <div className="w-full max-w-2xl mx-auto space-y-4">
                        {/* Prompt Section */}
                        <div className="space-y-0 group">
                            <div className="bg-gray-200 px-4 py-1.5 rounded-t-md group-focus-within:bg-gray-300">
                                <Label htmlFor="prompt-mobile" className="text-sm font-medium text-gray-700">Build Anything</Label>
                            </div>
                            <div className="bg-white border rounded-b-md shadow-lg">
                                <form onSubmit={handleSubmit}>
                                    <div className="p-4">
                                        <div className="relative">
                                            <GitPullRequest className="absolute left-1 top-1 h-4 w-4 text-gray-400"/>
                                            <Textarea
                                                id="prompt-mobile"
                                                placeholder="Ask ClaudeCodex to build..."
                                                className="min-h-[120px] resize-none pt-0 pb-1 px-1 pl-6 text-base focus:outline-none border-0 focus:ring-0 focus:border-0 focus:shadow-none outline-none"
                                                style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                                value={prompt}
                                                onChange={(e) => {
                                                    setPrompt(e.target.value);
                                                    if (hasError) setHasError(false);
                                                }}
                                                onKeyDown={handleKeyDown}
                                                disabled={isLoading}
                                            />
                                            <div className="absolute bottom-1 left-1 right-1 flex justify-between items-center gap-2">
                                                {/* Left side: Branch */}
                                                <div className="flex items-center gap-1">
                                                    {isFetchingBranches && (
                                                        <div className="flex items-center bg-white text-gray-800 text-sm px-2 h-8 rounded-md border border-input shadow-sm">
                                                            <Loader2 className="h-3 w-3 mr-1 text-gray-500 animate-spin"/>
                                                            <span className="truncate max-w-16 text-xs">Loading...</span>
                                                        </div>
                                                    )}
                                                    {!isFetchingBranches && selectedBranch && (
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                                                                disabled={isLoading}
                                                                className="flex items-center bg-white text-gray-800 text-xs px-2 h-8 rounded-md border border-input shadow-sm hover:bg-gray-50"
                                                            >
                                                                <GitBranch className="h-3 w-3 mr-1 text-gray-500"/>
                                                                <span className="truncate max-w-20">{selectedBranch}</span>
                                                                {branches.find(b => b.name === selectedBranch)?.protected && (
                                                                    <span className="ml-1 text-xs text-gray-500">🔒</span>
                                                                )}
                                                                <ChevronDown className="h-3 w-3 ml-1 text-gray-500"/>
                                                            </button>
                                                            
                                                            {showBranchDropdown && (
                                                                <div className="absolute z-20 left-0 bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto min-w-48">
                                                                    {branches.map((branch, index) => (
                                                                        <button
                                                                            key={index}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedBranch(branch.name);
                                                                                setShowBranchDropdown(false);
                                                                            }}
                                                                            className={`w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-50 ${
                                                                                selectedBranch === branch.name ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                                                            }`}
                                                                        >
                                                                            <GitBranch className="h-3 w-3 mr-2 text-gray-500"/>
                                                                            <span className="flex-1">{branch.name}</span>
                                                                            {branch.protected && (
                                                                                <span className="ml-2 text-xs text-gray-500">🔒</span>
                                                                            )}
                                                                            {selectedBranch === branch.name && (
                                                                                <CheckCircle className="h-3 w-3 ml-2 text-blue-600"/>
                                                                            )}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right side: Files and Action Buttons */}
                                                <div className="flex items-center gap-1">
                                                    {/* Files - show only count on mobile if any */}
                                                    {files.length > 0 && (
                                                        <div className="flex items-center bg-white text-gray-800 text-xs px-2 h-8 rounded-md border border-input shadow-sm">
                                                            <Paperclip className="h-3 w-3 mr-1 text-gray-500"/>
                                                            <span>{files.length}</span>
                                                        </div>
                                                    )}
                                                    <Button 
                                                        type="button" 
                                                        size="icon" 
                                                        variant="outline"
                                                        className="h-8 w-8"
                                                        onClick={handleFileUploadClick}
                                                        disabled={isLoading || files.length >= 2}
                                                    >
                                                        <Paperclip className="h-4 w-4"/>
                                                        <span className="sr-only">Upload File</span>
                                                    </Button>
                                                    <Button type="submit" size="icon" className="h-8 w-8"
                                                            disabled={isLoading}>
                                                        <ArrowUp className="h-4 w-4"/>
                                                        <span className="sr-only">Generate Pull Request</span>
                                                    </Button>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.css,.html,.json,.xml,.yml,.yaml,.pdf,.doc,.docx,.xls,.xlsx"
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* GitHub URL Section */}
                        <div className="relative">
                            <div className="space-y-0 group">
                                <div className="bg-gray-200 px-4 py-1.5 rounded-t-md group-focus-within:bg-gray-300">
                                    <Label htmlFor="github-url-mobile" className="text-sm font-medium text-gray-700">GitHub Repository URL</Label>
                                </div>
                                <div className="bg-white border rounded-b-md shadow-lg p-4">
                                    <div className="relative">
                                        <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                        <Input
                                            id="github-url-mobile"
                                            type="url"
                                            placeholder="https://github.com/username/repository"
                                            value={githubUrl}
                                            onChange={(e) => {
                                                setGithubUrl(e.target.value);
                                                if (hasError) setHasError(false);
                                            }}
                                            disabled={isLoading}
                                            className="pl-10 text-base border-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none outline-none"
                                            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Floating GitHub Authorization Icon */}
                            <div className="absolute -top-3 right-4">
                                {isAuthorized ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLogout}
                                        disabled={isLoading}
                                        className="bg-white text-green-600 border-green-300 hover:bg-green-50 shadow-md"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-1"/>
                                        <span className="hidden sm:inline">Authorized</span>
                                        <span className="sm:hidden">✓</span>
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGitHubAuth}
                                        disabled={isLoading || isAuthLoading}
                                        className="bg-white text-orange-600 border-orange-300 hover:bg-orange-50 shadow-md"
                                    >
                                        {isAuthLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-1 animate-spin"/>
                                                <span className="hidden sm:inline">Authorizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Github className="w-4 h-4 mr-1"/>
                                                <span className="hidden sm:inline">Authorize</span>
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* API Key Section */}
                        <div className="space-y-0 group">
                            <div className="bg-gray-200 px-4 py-1.5 rounded-t-md group-focus-within:bg-gray-300">
                                <Label htmlFor="api-key-mobile" className="text-sm font-medium text-gray-700">Code Agent Key</Label>
                            </div>
                            <div className="bg-white border rounded-b-md shadow-lg p-4">
                                <div className="relative">
                                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>
                                    <Input
                                        id="api-key-mobile"
                                        type="password"
                                        placeholder="sk-..."
                                        value={apiKey}
                                        onChange={(e) => {
                                            setApiKey(e.target.value);
                                            if (hasError) setHasError(false);
                                        }}
                                        className="pl-10 text-base border-0 focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none outline-none"
                                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Process Animation - shows below the form */}
                    {(isLoading || prUrl || hasError) && (
                        <div className="w-full max-w-md mx-auto">
                            <ProcessAnimation 
                                isVisible={true}
                                isComplete={!!prUrl && !isLoading && !hasError}
                                hasError={hasError}
                                prUrl={prUrl}
                                onReset={resetForm}
                                isExistingBranch={selectedBranch && !['main', 'master'].includes(selectedBranch.toLowerCase())}
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PromptForm;
