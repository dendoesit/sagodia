import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server is reached through a proxy/tunnel when previewing on a
  // phone, which Next.js would otherwise treat as a blocked cross-origin
  // request and refuse to serve its dev assets to.
  allowedDevOrigins: ["127.0.0.1", "localhost", "*.cursor.sh", "*.cursor.com", "*.ngrok-free.app"],
  // The floating dev badge sits right on top of the colour palette.
  devIndicators: false,
};

export default nextConfig;
