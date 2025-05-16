import { url } from "inspector";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
