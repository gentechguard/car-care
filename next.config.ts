import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true, // Required for static export + external images
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Optional: Trailing slashes for static hosting compatibility
  trailingSlash: true,
};

export default nextConfig;