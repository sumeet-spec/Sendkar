import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project — without it, Turbopack walks up
  // and finds an unrelated package-lock.json at the Windows user-profile
  // root and warns about treating that as the monorepo root.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
