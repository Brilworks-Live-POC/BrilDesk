import type { NextConfig } from 'next';
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
  setupDevPlatform();
}

const nextConfig: NextConfig = {
  transpilePackages: ['@brildesk/shared', '@brildesk/supabase'],
};

export default nextConfig;
