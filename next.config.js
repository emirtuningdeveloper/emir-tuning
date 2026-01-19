/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'drive.google.com',
      'lh3.googleusercontent.com',
      '*.googleusercontent.com',
      'www.carpartstuning.com',
      'carpartstuning.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/uc**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.carpartstuning.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'carpartstuning.com',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
}

module.exports = nextConfig
