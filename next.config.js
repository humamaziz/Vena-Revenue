/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Needed for @react-pdf/renderer server-side
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig
