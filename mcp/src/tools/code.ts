import { z } from "zod";
import { DevService } from "../services/dev-service.js";
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

const CREATE_BRANCH_SCHEMA = z.object({
  prompt: z.string().describe("The prompt describing the branch purpose"),
  githubUrl: z.string().describe("The URL of the GitHub repository"),
  githubToken: z.string().describe("The GitHub token for authentication"),
  apiKey: z
    .string()
    .optional()
    .describe("The optional API key for AI-generated branch names"),
  baseBranch: z
    .string()
    .optional()
    .describe("The base branch to create from (default: main)"),
});

const CREATE_PR_SCHEMA = z.object({
  githubUrl: z.string().describe("The URL of the GitHub repository"),
  githubToken: z.string().describe("The GitHub token for authentication"),
  branchName: z.string().describe("The source branch name"),
  prompt: z
    .string()
    .optional()
    .describe("The prompt for AI-generated PR description"),
  apiKey: z
    .string()
    .optional()
    .describe("The optional API key for AI-generated PR description"),
  baseBranch: z
    .string()
    .optional()
    .describe("The target branch (default: main)"),
  title: z.string().optional().describe("The PR title"),
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
      const result = await devService.processRequest(params as ProcessRequest);

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

export function defineCreateBranchTool(): ToolDefinition<
  typeof CREATE_BRANCH_SCHEMA
> {
  return {
    name: "create-branch",
    title: "Create Branch Tool",
    description:
      "Creates a new branch in the GitHub repository with optional AI-generated branch name",
    schema: CREATE_BRANCH_SCHEMA,
    isReadOnly: false,
    execute: async (params: z.infer<typeof CREATE_BRANCH_SCHEMA>) => {
      const devService = new DevService();
      const result = await devService.createBranch(params);

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

export function defineCreatePRTool(): ToolDefinition<typeof CREATE_PR_SCHEMA> {
  return {
    name: "create-pr",
    title: "Create Pull Request Tool",
    description:
      "Creates a pull request with optional AI-generated title and description",
    schema: CREATE_PR_SCHEMA,
    isReadOnly: false,
    execute: async (params: z.infer<typeof CREATE_PR_SCHEMA>) => {
      const devService = new DevService();
      const result = await devService.createPR(params);

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
