import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath:
    process.env.GITHUB_REPOSITORY !== undefined
      ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}`
      : '',
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
