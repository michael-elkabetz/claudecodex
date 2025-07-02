import axios from "axios";
import axios from "axios";
import { ActionRequest, ActionResponse } from "../types/api.types.js";

const API_URL = process.env.DEV_API_URL || "http://localhost:3000/api/dev";

export class DevService {
  async processRequest(request: ActionRequest): Promise<ActionResponse> {
    try {
      const response = await axios.post<ActionResponse>(
        `${API_URL}/actions`,
        request
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw new Error("Error processing request in DevService");
    }
  }
}
