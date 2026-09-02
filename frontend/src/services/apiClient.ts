// Thin fetch wrapper for the InventoryPro Flask backend.
// Handles the base URL, JWT bearer token storage, and consistent error handling
// so the rest of the app never has to touch `fetch` directly.

const TOKEN_KEY = 'inventorypro_token';
const API_URL_KEY = 'inventorypro_api_url';
const DEFAULT_API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

// A callback App.tsx registers so that any 401 response (expired/invalid token)
// can force the UI back to the login screen, no matter which call triggered it.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

export function getApiBaseUrl(): string {
  return localStorage.getItem(API_URL_KEY) || DEFAULT_API_BASE;
}

export function setApiBaseUrl(url: string) {
  if (url) localStorage.setItem(API_URL_KEY, url);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean; // defaults to true — send the bearer token
  params?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, params?: RequestOptions['params']): string {
  const base = getApiBaseUrl().replace(/\/$/, '');
  const url = new URL(base + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, params } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(
      'Could not reach the InventoryPro backend. Check that the API server is running and reachable at ' + getApiBaseUrl(),
      0
    );
  }

  // No content (e.g. some DELETEs)
  if (res.status === 204) return undefined as unknown as T;

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    const message = (data && (data.error || data.message)) || res.statusText || 'Request failed';
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export const apiGet = <T = any>(path: string, params?: RequestOptions['params']) =>
  apiRequest<T>(path, { method: 'GET', params });

export const apiPost = <T = any>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: 'POST', body });

export const apiPut = <T = any>(path: string, body?: unknown) =>
  apiRequest<T>(path, { method: 'PUT', body });

export const apiDelete = <T = any>(path: string) => apiRequest<T>(path, { method: 'DELETE' });
