/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://164.92.220.65/api/:path*", // backend
      },
    ];
  },
};

export default nextConfig;
