/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    proxyTimeout: 310_000,
  },
  async rewrites() {
    const backend = process.env.BACKEND_URL?.trim()?.replace(/\/$/, "");
    if (!backend && process.env.NODE_ENV === "production") {
      return [];
    }
    const target = backend || "http://127.0.0.1:8000";
    return [
      {
        source: "/users/:path*",
        destination: `${target}/users/:path*`,
      },
      { source: "/health", destination: `${target}/health` },
      { source: "/media/:path*", destination: `${target}/media/:path*` },
    ];
  },
};

export default nextConfig;
