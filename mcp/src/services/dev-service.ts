import axios from "axios";
import { ProcessRequest, ProcessResponse } from "../types/api.types.js";

const API_URL = process.env.DEV_API_URL || "http://localhost:3000/api/dev";

export class DevService {
  async processRequest(request: ProcessRequest): Promise<ProcessResponse> {
    try {
      const response = await axios.post<ProcessResponse>(
        `${API_URL}/process`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw new Error("Error processing request in DevService");
    }
  }

  async createBranch(request: {
    prompt: string;
    apiKey?: string;
    githubUrl: string;
    githubToken: string;
    baseBranch?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/create-branch`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw new Error("Error creating branch in DevService");
    }
  }

  async createPR(request: {
    prompt?: string;
    apiKey?: string;
    githubUrl: string;
    githubToken: string;
    branchName: string;
    baseBranch?: string;
    title?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${API_URL}/create-pr`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw new Error("Error creating PR in DevService");
    }
  }
}
