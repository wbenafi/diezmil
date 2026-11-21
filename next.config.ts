import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['wbox.local', '192.168.1.142'],
  async headers() {
    return [
      {
        // The worker must always be re-checked so updates reach installed apps.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
