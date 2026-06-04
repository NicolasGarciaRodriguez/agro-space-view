import type { NextConfig } from "next";
import path from "path";

const srcPath = path.join(__dirname, "src");

const nextConfig: NextConfig = {
  transpilePackages: ["@agrospace/shared"],
  sassOptions: {
    silenceDeprecations: ["import"],
  },
  webpack(config) {
    config.resolve.alias["@"] = srcPath;
    return config;
  },
  turbopack: {
    resolveAlias: {
      "@": "./src",
    },
  },
};

export default nextConfig;
