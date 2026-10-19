import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/db'],
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

export default nextConfig;
