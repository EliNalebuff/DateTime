/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://datetime-production.up.railway.app/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 