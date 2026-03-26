import { useEffect, useState } from "react";
import { serviceUrl } from "@/lib/api";

interface AuthState {
  token: string;
  userId: string;
  email: string;
  name: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const STORAGE_KEY = "sroa-auth";
const AUTH_API = serviceUrl(8001);
const authListeners = new Set<(auth: AuthState | null) => void>();

function readAuth(): AuthState | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as AuthState) : null;
  } catch {
    return null;
  }
}

let authCache: AuthState | null = readAuth();

function notifyAuthListeners(nextAuth: AuthState | null) {
  for (const listener of authListeners) {
    listener(nextAuth);
  }
}

function writeAuth(nextAuth: AuthState | null) {
  authCache = nextAuth;

  if (nextAuth) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAuth));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }

  notifyAuthListeners(nextAuth);
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState | null>(authCache);

  useEffect(() => {
    authListeners.add(setAuth);

    const handleStorage = () => {
      authCache = readAuth();
      setAuth(authCache);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      authListeners.delete(setAuth);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const register = async (payload: RegisterPayload) => {
    const resp = await fetch(`${AUTH_API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ detail: "Registration failed" }));
      throw new Error(error.detail || "Registration failed");
    }

    const data = (await resp.json()) as {
      access_token: string;
      user_id: string;
      email: string;
      name: string;
    };

    writeAuth({ token: data.access_token, userId: data.user_id, email: data.email, name: data.name });
  };

  const login = async (payload: LoginPayload) => {
    const resp = await fetch(`${AUTH_API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const error = await resp.json().catch(() => ({ detail: "Login failed" }));
      throw new Error(error.detail || "Login failed");
    }

    const data = (await resp.json()) as {
      access_token: string;
      user_id: string;
      email: string;
      name: string;
    };

    writeAuth({ token: data.access_token, userId: data.user_id, email: data.email, name: data.name });
  };

  const logout = () => writeAuth(null);

  return {
    auth,
    isAuthenticated: !!auth?.token,
    userId: auth?.userId || "",
    name: auth?.name || "",
    email: auth?.email || "",
    register,
    login,
    logout,
  };
}

export function getAuthFromStorage() {
  return readAuth();
}
