import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@mikro-orm/core", "@mikro-orm/postgresql", "@mikro-orm/migrations"],
  turbopack: {},
  experimental: {
    serverMinification: false,
  },
};

export default nextConfig;
