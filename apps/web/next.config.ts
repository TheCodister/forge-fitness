import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

// Pin the workspace root to this directory. Without it Turbopack infers the root
// from the nearest lockfile, which can land outside the project and make it index
// and cache far more of the filesystem than it should.
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// `output: 'export'` is on for `next build` (production) but off during
// `next dev` so dynamic segments like /workouts/[id]/ can resolve at
// runtime without needing generateStaticParams to enumerate user IDs.
// Amplify serves the built shell for unknown IDs via the SPA rewrite.
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  ...(isDev ? {} : { output: "export" as const }),
  poweredByHeader: false,
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
