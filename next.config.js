/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required so @react-pdf/renderer runs correctly in Next.js serverless functions
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
  // Required for Vercel deployment — increase serverless function timeout for PDF/AI operations
  // (Set in vercel.json below, this is just the Next.js side)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // canvas is an optional peer dep of @react-pdf/renderer we don't need
      config.externals = [...(config.externals || []), 'canvas']
    }
    return config
  },
}

module.exports = nextConfig
