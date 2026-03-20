/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/PuckProspects',
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
