import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["rate-limiter-flexible"],
  // Bypass Node.js version check
  env: {
    SKIP_ENV_VALIDATION: "true",
  },
};

export default nextConfig;
