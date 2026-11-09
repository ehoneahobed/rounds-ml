import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/modules", destination: "/", permanent: false },
      { source: "/concepts/:slug", destination: "/decision-trees/concepts/:slug", permanent: false },
      { source: "/tasks/:slug", destination: "/decision-trees/tasks/:slug", permanent: false },
      { source: "/lab", destination: "/decision-trees/lab", permanent: false },
      { source: "/quiz", destination: "/decision-trees/quiz", permanent: false },
      { source: "/note", destination: "/decision-trees/note", permanent: false },
    ];
  },
  turbopack: {
    root: projectRoot,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
