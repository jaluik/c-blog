import { apiClient, request } from "./api";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
}

export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await request<LoginResponse>({
    method: "POST",
    url: "/auth/admin/login",
    data: credentials,
  });
  return response;
}

export async function changePassword(data: ChangePasswordInput): Promise<void> {
  await request<void>({
    method: "POST",
    url: "/admin/change-password",
    data,
  });
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/admin/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data.url;
}

export function getCurrentUser(): { username: string | null; token: string | null } {
  return {
    username: localStorage.getItem("admin_username"),
    token: localStorage.getItem("admin_token"),
  };
}

export function logout(): void {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_username");
}
