import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Application, Request, Response } from "express";
import { logger } from "../logger.js";
import { Factory } from "../factory.js";

const SSE_KEEPALIVE_INTERVAL = 10000;

const sseSessions: {
  [sessionId: string]: { transport: SSEServerTransport; server: McpServer };
} = {};

function setupStreamableHttpRoutes(
  app: Application,
  mcpServerFactory: Factory,
) {
  app.post("/api/mcp", express.json(), async (req: Request, res: Response) => {
    const mcpServer = mcpServerFactory.createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      mcpServer.close();
    });

    try {
      await mcpServer.connect(transport);
      transport.handleRequest(req, res, req.body);
    } catch (error) {
      logger.error(error, "Error handling MCP request");
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  });
  app.get("/api/mcp", async (_req: Request, res: Response) => {
    res.status(405).set("Allow", "POST").send("Method not allowed");
  });
}

function setupSseRoutes(app: Application, mcpServerFactory: Factory) {
  app.get("/api/sse", async (_: Request, res: Response) => {
    const transport = new SSEServerTransport("/api/messages", res);
    const mcpServer = mcpServerFactory.createMcpServer();

    sseSessions[transport.sessionId] = { transport, server: mcpServer };

    logger.info(
      { sessionId: transport.sessionId },
      "SSE connection established",
    );

    const keepaliveInterval = setInterval(() => {
      res.write(": keepalive\n\n");
    }, SSE_KEEPALIVE_INTERVAL);

    res.on("close", () => {
      logger.info({ sessionId: transport.sessionId }, "SSE connection closed");

      clearInterval(keepaliveInterval);
      mcpServer.close();
      delete sseSessions[transport.sessionId];
    });

    await mcpServer.connect(transport);
  });

  app.post("/api/messages", async (req: Request, res: Response) => {
    const sessionId = req.query.sessionId as string;
    const transport = sseSessions[sessionId]?.transport;

    if (!transport) {
      res.status(400).send("No transport found for sessionId");
      return;
    }

    await transport.handlePostMessage(req, res);
  });
}

export function routes(app: Application, mcpServerFactory: Factory) {
  setupStreamableHttpRoutes(app, mcpServerFactory);
  setupSseRoutes(app, mcpServerFactory);
}
