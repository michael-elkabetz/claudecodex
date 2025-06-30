import express, { Application } from "express";
import { Factory } from "./factory.js";
import { logger } from "./logger.js";
import { healthController } from "./http/health-controller.js";
import { routes } from "./http/mcp-controller.js";

const PORT = process.env.PORT || 12500;

export function bootstrap(): { app: Application } {
  const mcpServerFactory = new Factory();
  const app = setup(mcpServerFactory);

  app.listen(PORT, () => {
    logger.info(`MCP server up and running on port: ${PORT}`);
  });

  return { app };
}

function setup(factory: Factory) {
  const app = express();
  app.get("/health", healthController);
  routes(app, factory);
  return app;
}
