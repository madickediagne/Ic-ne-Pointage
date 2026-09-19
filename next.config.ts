import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Sécurité ──────────────────────────────────────────────────────────
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        // Empêcher le clickjacking
        { key: "X-Frame-Options", value: "DENY" },
        // Empêcher le sniffing MIME
        { key: "X-Content-Type-Options", value: "nosniff" },
        // Forcer HTTPS
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        // Referrer
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Permissions : caméra et géolocalisation autorisées (nécessaires pour le pointage)
        {
          key: "Permissions-Policy",
          value: "camera=(self), geolocation=(self), microphone=()",
        },
      ],
    },
  ],

  // ─── Images ────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [],
  },

  // ─── Redirections ──────────────────────────────────────────────────────
  redirects: async () => [
    {
      source: "/",
      destination: "/login",
      permanent: false,
    },
  ],

  // ─── Options expérimentales ────────────────────────────────────────────
  experimental: {
    // Améliore les performances des Server Actions
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
