/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    // any experimental configs if needed
  }
};

export default nextConfig;
