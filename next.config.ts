import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* No Vercel, não precisamos de output: export, o que permite redirecionamentos dinâmicos */
  async redirects() {
    return [
      {
        source: '/r/:id',
        destination: '/r?id=:id',
        permanent: true,
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
