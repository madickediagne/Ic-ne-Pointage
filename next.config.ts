import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── Tolérance pour le développement progressif ──────────────────────────
  typescript: {
    // Ignore les erreurs de fichiers vides pendant le build Vercel
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ─── Sécurité ──────────────────────────────────────────────────────────
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
          key: "Permissions-Policy",
          value: "camera=(self), geolocation=(self), microphone=()",
        },
      ],
    },
  ],

  // ─── Redirections ──────────────────────────────────────────────────────
  redirects: async () => [
    {
      source: "/",
      destination: "/login",
      permanent: false,
    },
  ],

  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
