import { ApiError, customFetch, setAuthTokenGetter } from '@workspace/api-client-react';

const TOKEN_KEY = 'learnly_auth_token';

export type Role = 'teacher' | 'parent' | 'student';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Depolama kullanılamıyor olabilir (gizli sekme vb.) — bu durumda oturum
    // sayfa yenilendiğinde kalıcı olmaz, ama uygulama çökmez.
  }
}

// Frontend ile backend ayrı adreslerde (ayrı alt alan adlarında) çalıştığı
// için çerez tabanlı oturum yerine kasıtlı olarak taşıyıcı (bearer) token
// kullanılıyor — çapraz kaynak çerezleri (SameSite=None) gerektirmeden
// sorunsuz çalışır. Bu, her customFetch çağrısına (üretilen hook'lar dahil)
// token'ı otomatik ekler.
export function initAuth() {
  setAuthTokenGetter(() => getStoredToken());
}

export function isLoggedIn(): boolean {
  return Boolean(getStoredToken());
}

export async function fetchMe(): Promise<AuthUser | null> {
  if (!getStoredToken()) return null;
  try {
    const { user } = await customFetch<{ user: AuthUser }>('/api/auth/me', { responseType: 'json' });
    return user;
  } catch {
    setStoredToken(null);
    return null;
  }
}

export async function registerUser(input: { name: string; email: string; password: string; role: Role }): Promise<AuthUser> {
  const { user, token } = await customFetch<{ user: AuthUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
    responseType: 'json',
  });
  setStoredToken(token);
  return user;
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthUser> {
  const { user, token } = await customFetch<{ user: AuthUser; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
    responseType: 'json',
  });
  setStoredToken(token);
  return user;
}

export async function logoutUser(): Promise<void> {
  try {
    await customFetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // Sunucuya ulaşılamasa bile yerel token'ı temizlemeye devam ediyoruz.
  }
  setStoredToken(null);
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const data = error.data as { message?: unknown } | null;
    if (typeof data?.message === 'string') return data.message;
  }
  return fallback;
}
