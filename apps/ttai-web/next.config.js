/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@ttai/ai-core', '@ttai/db'],
  experimental: {
    serverComponentsExternalPackages: ['mysql2', '@google-cloud/storage'],
  },
  env: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  },
};

module.exports = nextConfig;
