/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://146.190.225.64/api/:path*", // backend
      },
    ];
  },
};

export default nextConfig;
