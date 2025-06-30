import { Github, BookOpen } from "lucide-react";

const Header = () => {
  // Get the API docs URL by removing '/api' from the base URL if present
  const getApiDocsUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const baseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
    return `${baseUrl}/api-docs`;
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.png" 
              alt="ClaudeCodex Logo" 
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-xl font-bold text-slate-800">ClaudeCodex</span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href={getApiDocsUrl()}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 px-3 py-2 rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300"
              title="API Documentation (Swagger)"
            >
              <BookOpen className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">API Docs</span>
            </a>
            <a 
              href="https://github.com/michael-elkabetz/claudecodex"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-2 rounded-lg transition-all duration-200 border border-gray-700 hover:border-gray-600"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
