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
  phone?: string;
  location?: string;
  mandi?: string;
  language?: string;
  crops?: string[];
}

interface LoginPayload {
  email: string;
  password: string;
}

const STORAGE_KEY = "sroa-auth";
const LOCATION_REFRESH_KEY = "sroa-location-pending-refresh";
const AUTH_API = serviceUrl(8092);
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
    // Auth backend only accepts name, email, password — strip extra fields to avoid 422
    const authBody = {
      name: payload.name,
      email: payload.email,
      password: payload.password,
    };

    let data: { access_token: string; user_id: string; email: string; name: string } | null = null;

    try {
      const resp = await fetch(`${AUTH_API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authBody),
      });

      if (!resp.ok) {
        const error = await resp.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(error.detail || "Registration failed");
      }

      data = (await resp.json()) as typeof data;
    } catch (err) {
      // If backend is offline, create a local-only demo account
      if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        // Network error — backend not running, use demo mode
        const localId = crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`;
        data = {
          access_token: `demo-token-${localId}`,
          user_id: localId,
          email: payload.email,
          name: payload.name,
        };
      } else {
        throw err; // Re-throw auth errors (wrong password, duplicate email etc.)
      }
    }

    if (!data) throw new Error("Registration failed");

    writeAuth({ token: data.access_token, userId: data.user_id, email: data.email, name: data.name });

    // Persist extended profile data to localStorage so useProfile initialises with it
    if (payload.location || payload.crops || payload.language || payload.phone) {
      const profileKey = "sroa-profile";
      const existingRaw = localStorage.getItem(profileKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const normalizedPrevLocation = String(existing.location || "").trim().toLowerCase();
      const normalizedNextLocation = String(payload.location || existing.location || "").trim().toLowerCase();
      const merged = {
        ...existing,
        userId: data.user_id,
        name: data.name,
        location: payload.location || existing.location || "",
        mandi: payload.mandi || existing.mandi || "",
        crops: payload.crops || existing.crops || [],
        language: payload.language || existing.language || "en",
        phone: payload.phone || existing.phone || "",
        landArea: existing.landArea || "",
        notificationSettings: existing.notificationSettings || { inApp: true, sms: false, whatsapp: false },
        privacy: existing.privacy || { shareDataForInsights: true, allowPersonalizedAi: true },
      };
      localStorage.setItem(profileKey, JSON.stringify(merged));

      if (normalizedNextLocation && normalizedNextLocation !== normalizedPrevLocation) {
        localStorage.setItem(
          LOCATION_REFRESH_KEY,
          JSON.stringify({ userId: data.user_id, location: merged.location, ts: Date.now() })
        );
      }
    }
  };

  const login = async (payload: LoginPayload) => {
    let loginData: { access_token: string; user_id: string; email: string; name: string } | null = null;

    try {
      const resp = await fetch(`${AUTH_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const error = await resp.json().catch(() => ({ detail: "Login failed" }));
        throw new Error(error.detail || "Login failed");
      }

      loginData = (await resp.json()) as typeof loginData;
    } catch (err) {
      // Offline demo mode: try to match from locally stored profile
      if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) {
        const stored = localStorage.getItem("sroa-profile");
        if (stored) {
          const profile = JSON.parse(stored) as { userId?: string; name?: string };
          const storedAuth = readAuth();
          if (storedAuth && storedAuth.email === payload.email) {
            // Re-use existing demo token
            writeAuth(storedAuth);
            return;
          }
        }
        throw new Error("Cannot connect to server. Please check your connection or try later.");
      }
      throw err;
    }

    if (loginData) {
      writeAuth({ token: loginData.access_token, userId: loginData.user_id, email: loginData.email, name: loginData.name });
    }
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
