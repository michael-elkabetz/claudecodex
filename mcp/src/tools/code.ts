import { z } from "zod";
import { CoreService } from "../services/core-service.js";
import { ProcessRequest } from "../types/api.types.js";
import { ToolDefinition } from "./tool-definition.js";

const PROCESS_REQUEST_SCHEMA = z.object({
  prompt: z.string().describe("The prompt for the AI model"),
  githubUrl: z.string().describe("The URL of the GitHub repository"),
  githubToken: z
    .string()
    .optional()
    .describe("The optional GitHub token for authentication"),
  apiKey: z
    .string()
    .optional()
    .describe("The optional API key for the AI model"),
  branch: z.string().optional().describe("The optional branch name to work on"),
});

export function defineDeveloperTool(): ToolDefinition<
  typeof PROCESS_REQUEST_SCHEMA
> {
  return {
    name: "developer",
    title: "Developer Tool",
    description:
      "Developer endpoint that processes requests to generate code changes and create pull requests",
    schema: PROCESS_REQUEST_SCHEMA,
    isReadOnly: false,
    execute: async (params: z.infer<typeof PROCESS_REQUEST_SCHEMA>) => {
      const coreService = new CoreService();
      const result = await coreService.processRequest(params as ProcessRequest);

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.data),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${result.message}`,
            },
          ],
        };
      }
    },
  };
}
