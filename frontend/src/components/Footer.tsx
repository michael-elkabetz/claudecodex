
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img 
              src="/logo.png" 
              alt="ClaudeCodex Logo" 
              className="w-8 h-8 rounded-lg bg-white p-1"
            />
            <span className="text-xl font-bold text-white">ClaudeCodex</span>
          </div>
          
          <div className="flex items-center space-x-1 text-sm">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span>for developers</span>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>© 2025 ClaudeCodex.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
