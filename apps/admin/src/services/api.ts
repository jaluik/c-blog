import type { ApiResponse, PaginatedResponse } from "@blog/shared-types";
import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
});

// Request interceptor: add token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_username");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Generic API request wrapper
export async function request<T>(config: Parameters<typeof apiClient.request>[0]): Promise<T> {
  const response = await apiClient.request<ApiResponse<T>>(config);
  if (!response.data.success && response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data.data as T;
}

// Generic paginated request
export async function requestPaginated<T>(
  config: Parameters<typeof apiClient.request>[0],
): Promise<PaginatedResponse<T>> {
  const response = await apiClient.request<{ data: T[]; meta: PaginatedResponse<T>["meta"] }>(
    config,
  );
  return {
    data: response.data.data,
    meta: response.data.meta,
  };
}

export { apiClient };
