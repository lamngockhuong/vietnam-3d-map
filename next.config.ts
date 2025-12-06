import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable strict mode for Three.js/WebGL compatibility
  // Strict mode causes double mount/unmount which loses WebGL context
  reactStrictMode: false,
  transpilePackages: ['three'],
};

export default nextConfig;
