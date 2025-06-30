import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { logger } from "./logger.js";
import { getPackageInfo, PackageInfo } from "./utils/package-info.js";
import { defineProcessRequestTool } from "./tools/code.js";

export class Factory {
  private packageInfo: PackageInfo;

  constructor() {
    this.packageInfo = getPackageInfo();
  }

  createMcpServer(): McpServer {
    const mcpServer = new McpServer({
      name: this.packageInfo.name,
      version: this.packageInfo.version,
    });
    this.defineTools(mcpServer);
    return mcpServer;
  }

  private defineTools(mcpServer: McpServer): void {
    const tools = this.discoverTools();

    for (const tool of tools) {
      logger.info(`Supported tool: ${tool.name}`);
      mcpServer.tool(
        tool.name,
        tool.description,
        tool.schema.shape,
        { title: tool.title, readOnlyHint: tool.isReadOnly },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (params: any) => {
          logger.info({ tool: tool.name }, "Tool executed");
          return await tool.execute(params);
        },
      );
    }
  }

  private discoverTools() {
    return [defineProcessRequestTool()];
  }
}
