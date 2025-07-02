import axios from "axios";
import { ProcessRequest, ProcessResponse } from "../types/api.types.js";

const API_URL = process.env.CORE_API_URL || "http://localhost:3000/api/core";

export class CoreService {
  async processRequest(request: ProcessRequest): Promise<ProcessResponse> {
    try {
      const response = await axios.post<ProcessResponse>(
        `${API_URL}/developer`,
        request,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw new Error("Error processing request in CoreService");
    }
  }
}
