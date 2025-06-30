
import { Github } from "lucide-react";

const Header = () => {
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
              href="https://github.com/michael-elkabetz/claudecodex"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
