import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Strict Mode double-mounts in dev; combined with GSAP/ScrollTrigger + heavy client
   * trees it can race Next.js App Router initialization (E668:
   * "Router action dispatched before initialization"). Production builds are unaffected.
   */
  reactStrictMode: false,
};

export default nextConfig;
