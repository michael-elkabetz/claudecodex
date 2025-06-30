import { ArrowRight, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="pt-12 pb-4 px-4">
      <div className="container mx-auto text-center max-w-4xl">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
          <span className="bg-gradient-to-rtext-xl font-bold text-slate-800">ClaudeCodex</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
          The first open-source project that turns the most powerful code agents, such as{" "}
          ANTHROPIC{" "}
          <span className="font-bold text-slate-800">ClaudeCode</span> and{" "}
          OpenAI{" "}
          <span className="font-bold text-slate-800">Codex</span> into <span className="font-bold text-slate-800">Background Agents</span>, accessible via REST API, a user interface, and MCP
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>REST API</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>UI</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>MCP</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
