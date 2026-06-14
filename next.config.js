/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer must run server-side only and needs canvas excluded
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // canvas is an optional dep of @react-pdf/renderer — not needed
      const externals = Array.isArray(config.externals) ? config.externals : []
      config.externals = [...externals, { canvas: 'canvas' }]
    }
    return config
  },
}

module.exports = nextConfig