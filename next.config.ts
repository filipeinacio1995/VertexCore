import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async headers() {
    const securityHeaders = [
      // Clickjacking protection
      { key: "X-Frame-Options", value: "DENY" },

      // MIME sniffing protection
      { key: "X-Content-Type-Options", value: "nosniff" },

      // Referrer leakage reduction
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

      // Lock down powerful browser features
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },

      /**
       * Start with CSP in REPORT-ONLY mode.
       * After confirming nothing breaks, we can convert to enforced CSP:
       * - change header key to "Content-Security-Policy"
       * - and tighten rules (remove unsafe-eval, add nonces, etc.)
       */
      {
        key: "Content-Security-Policy-Report-Only",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "img-src 'self' data: https:",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "connect-src 'self' https:",
          "font-src 'self' data: https:",
        ].join("; "),
      },
    ];

    const apiCorsHeaders = [
      // If your frontend and API are SAME origin only, you can remove CORS entirely.
      { key: "Access-Control-Allow-Origin", value: "https://vertex-core.shop" },
      { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
      { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      { key: "Vary", value: "Origin" },
    ];

    return [
      // Apply security headers to all routes (pages + assets + api)
      {
        source: "/:path*",
        headers: securityHeaders,
      },

      // Apply CORS only to API routes
      {
        source: "/api/:path*",
        headers: apiCorsHeaders,
      },
    ];
  },
};

export default nextConfig;