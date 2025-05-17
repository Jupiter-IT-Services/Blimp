import { url } from "inspector";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        hostname: "cdn.discordapp.com",
      },
      {
        hostname: "gravatar.com",
      },
    ],
  },
};

export default nextConfig;
