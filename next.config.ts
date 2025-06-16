import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Custom Webpack config for absolute imports
  webpack(config) {
    config.resolve.modules.push(path.resolve('./'));
    return config;
  },

  // Image optimization settings
  images: {
    domains: ['your-image-cdn.com'], // Replace with real CDN or external domain
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  experimental: {
    optimizeCss: true, // Experimental CSS optimizer
  },

  typescript: {
    ignoreBuildErrors: true, // Be cautious using this in production
  },

  // ✅ Disable ESLint checks during build (for Vercel)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
