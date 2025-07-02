import { z } from "zod";
import { DevService } from "../services/core-service.js";
import { ActionRequest } from "../types/api.types.js";
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

export function defineProcessRequestTool(): ToolDefinition<
  typeof PROCESS_REQUEST_SCHEMA
> {
  return {
    name: "code",
    title: "Generate Code Tool",
    description:
      "Processes a request by the AI model to generate code changes and create a pull request",
    schema: PROCESS_REQUEST_SCHEMA,
    isReadOnly: false,
    execute: async (params: z.infer<typeof PROCESS_REQUEST_SCHEMA>) => {
      const devService = new DevService();
      const result = await devService.processRequest(params as ActionRequest);

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
