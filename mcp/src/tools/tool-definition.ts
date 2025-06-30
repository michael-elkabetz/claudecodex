import { z, ZodType } from "zod";

export interface ToolDefinition<T extends ZodType> {
  name: string;
  title: string;
  description: string;
  schema: T;
  isReadOnly: boolean;
  execute: (params: z.infer<T>) => Promise<{
    content: {
      type: "text";
      text: string;
    }[];
  }>;
}
