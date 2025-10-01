/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@alquemist/database', '@alquemist/types', '@alquemist/ui'],
}

module.exports = nextConfig
