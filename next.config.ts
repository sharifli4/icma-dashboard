import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@mikro-orm/core",
    "@mikro-orm/postgresql", 
    "@mikro-orm/migrations",
    "@mikro-orm/cli",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: false,
      };
    }
    return config;
  },
};

export default nextConfig;
