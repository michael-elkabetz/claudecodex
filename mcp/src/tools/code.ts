import { z } from "zod";
import { DevService } from "../services/dev-service.js";
import { ExecuteRequest } from "../types/api.types.js";
import { ToolDefinition } from "./tool-definition.js";

const EXECUTE_REQUEST_SCHEMA = z.object({
  prompt: z.string().describe("The prompt for the AI model"),
  githubUrl: z.string().describe("The URL of the GitHub repository"),
  githubToken: z
    .string()
    .optional()
    .describe(
      "GitHub token for authentication (optional - can be provided via GITHUB_TOKEN environment variable)",
    ),
  apiKey: z
    .string()
    .optional()
    .describe("The optional API key for the AI model"),
  branch: z.string().optional().describe("The optional branch name to work on"),
});

export function defineExecuteRequestTool(): ToolDefinition<
  typeof EXECUTE_REQUEST_SCHEMA
> {
  return {
    name: "execute",
    title: "Execute AI Code Generation Tool",
    description:
      "Executes a complete AI-powered workflow: generates code, creates branch, commits changes, and creates pull request",
    schema: EXECUTE_REQUEST_SCHEMA,
    isReadOnly: false,
    execute: async (params: z.infer<typeof EXECUTE_REQUEST_SCHEMA>) => {
      const devService = new DevService();
      const result = await devService.executeRequest(params as ExecuteRequest);

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
