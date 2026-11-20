import type { NextConfig } from 'next';
import path from 'path';
import { loadEnvConfig } from '@next/env';

// Explicitly load root monorepo .env for Next.js
loadEnvConfig(path.resolve(__dirname, '../../'));

const nextConfig: NextConfig = {
  transpilePackages: ['@repo/db', '@repo/auth'],
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  sassOptions: {
    quietDeps: true,
  },
};

export default nextConfig;
