/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
            domains: ['localhost', process.env.BASE_URL?.replace('https://', '').replace('http://', '')].filter(Boolean),
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