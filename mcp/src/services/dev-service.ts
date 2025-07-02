import axios from "axios";
import { ExecuteRequest, ExecuteResponse } from "../types/api.types.js";

const API_URL = process.env.DEV_API_URL || "http://localhost:3000/api/dev";

export class DevService {
  async executeRequest(request: ExecuteRequest): Promise<ExecuteResponse> {
    try {
      const response = await axios.post<ExecuteResponse>(
        `${API_URL}/execute`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw new Error("Error executing request in DevService");
    }
  }
}
