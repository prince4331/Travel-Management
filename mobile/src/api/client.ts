import { ApiBalanceResponse, ApiDocument, ApiExpense, ApiGroupResponse, ApiUser } from "../types/api";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export interface ApiRequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : (options.body as BodyInit),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const error = typeof payload === "string" ? { message: payload } : payload;
    throw Object.assign(new Error(error.message ?? "Request failed"), { status: response.status, details: error });
  }

  return payload as T;
}

export type CreateExpensePayload = {
  title: string;
  description?: string;
  category: string;
  currency: string;
  amount: number;
  paidById: number;
  incurredOn: string;
  splits: Array<{ memberId: number; amount: number }>;
};

export type UploadDocumentPayload = {
  ownerType: "group" | "user" | "trip";
  ownerId: string;
  title: string;
  description?: string;
  fileType: string;
  fileSize: number;
  storageKey?: string;
  expiresAt?: string;
  isEncrypted?: boolean;
  metadata?: Record<string, unknown>;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const AuthApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthTokens>("/auth/login", { method: "POST", body: { email, password } }),
  otpLogin: (phone: string, otp: string) =>
    apiRequest<AuthTokens>("/auth/otp", { method: "POST", body: { phone, otp } }),
  refresh: (refreshToken: string) =>
    apiRequest<AuthTokens>("/auth/refresh", { method: "POST", body: { refreshToken } }),
  profile: (accessToken: string) => apiRequest<ApiUser>("/auth/me", { token: accessToken }),
};

export const GroupsApi = {
  list: (token: string) => apiRequest<ApiGroupResponse[]>("/groups", { token }),
  retrieve: (groupId: number, token: string) => apiRequest<ApiGroupResponse>(`/groups/${groupId}`, { token }),
  expenses: (groupId: number, token: string) => apiRequest<ApiExpense[]>(`/groups/${groupId}/expenses`, { token }),
  balance: (groupId: number, token: string) => apiRequest<ApiBalanceResponse>(`/groups/${groupId}/balance`, { token }),
  createExpense: (groupId: number, payload: CreateExpensePayload, token: string) =>
    apiRequest<ApiExpense>(`/groups/${groupId}/expenses`, { method: "POST", body: payload, token }),
  uploadDocument: (payload: UploadDocumentPayload, token: string) =>
    apiRequest<ApiDocument>("/upload/document", { method: "POST", body: payload, token }),
};

export default GroupsApi;
