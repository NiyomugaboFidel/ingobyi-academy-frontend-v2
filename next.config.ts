import type { NextConfig } from 'next';
import path from 'path';

/** Vercel sets VERCEL=1; standalone output is for self-hosted (Railway/Docker) only. */
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  ...(!isVercel && {
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname),
  }),
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
  },
};

export default nextConfig;
