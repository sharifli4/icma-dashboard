import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mikro-orm/core",
    "@mikro-orm/postgresql", 
    "@mikro-orm/migrations",
    "@mikro-orm/cli",
  ],
  turbopack: {},
};

export default nextConfig;
