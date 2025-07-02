export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ExecuteRequest {
  prompt: string;
  apiKey?: string;
  githubUrl: string;
  githubToken?: string;
  files?: UploadedFile[];
  branch?: string;
}

export interface ExecuteResponse {
  success: boolean;
  message?: string;
  data?: {
    pullRequestUrl: string;
    branchName: string;
    pullRequestNumber: number;
    processedAt: string;
    repositoryName: string;
    repositoryOwner: string;
  };
}
