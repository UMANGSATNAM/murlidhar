import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
  outputFileTracingIncludes: {
    '/**': ['./prisma/db/custom.db', './db/custom.db'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
