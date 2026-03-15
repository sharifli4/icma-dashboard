import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mikro-orm/core",
    "@mikro-orm/postgresql", 
    "@mikro-orm/migrations",
    "@mikro-orm/cli",
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || []), "@mikro-orm/core", "@mikro-orm/postgresql", "@mikro-orm/migrations"];
    return config;
  },
};

export default nextConfig;
