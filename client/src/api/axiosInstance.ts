import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const api = axios.create({
  baseURL: baseURL && baseURL !== "mock" ? baseURL : undefined,
  headers: { "Content-Type": "application/json" },
  timeout: 10000
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      console.error("[API Error]", error.response?.status, error.message);
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)));
  }
);

export const isMockMode = !baseURL || baseURL === "mock";
