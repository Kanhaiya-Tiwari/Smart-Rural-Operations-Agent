const DEFAULT_HOST = "localhost";

function resolveApiHost(): string {
  const envHost = import.meta.env.VITE_API_HOST as string | undefined;
  if (envHost && envHost.trim()) {
    return envHost.trim();
  }

  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }

  return DEFAULT_HOST;
}

function resolveApiProtocol(): "http" | "https" {
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    return "https";
  }
  return "http";
}

export function serviceUrl(port: number): string {
  const host = resolveApiHost();
  const protocol = resolveApiProtocol();
  return `${protocol}://${host}:${port}`;
}
