import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thesimpsonsapi.com",
      },
      {
        protocol: "https",
        hostname: "cdn.thesimpsonsapi.com",
      },
    ],
  },
};

export default nextConfig;
