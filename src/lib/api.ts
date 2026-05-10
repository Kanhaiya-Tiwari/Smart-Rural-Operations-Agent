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
  // Agar hum Kubernetes/Cloud par hain, toh Ingress paths use karein
  if (host !== "localhost") {
    // Map legacy ports to Ingress paths
    const portMap: Record<number, string> = {
      8092: "/api/auth",
      8093: "/api/user",
      8094: "/api/weather",
      8095: "/api/market",
      8096: "/api/agent",
      8097: "/api/notification",
    };
    
    const path = portMap[port] || "";
    // NGINX Ingress ab automatically traffic ko sahi microservice par bhej dega
    return `http://${host}${path}`;
  }

  // Local development ke liye old logic
  const protocol = resolveApiProtocol();
  return `${protocol}://${host}:${port}`;
}
