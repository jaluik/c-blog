/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // NextAuth 路由不由 Next.js 处理，需要排除
      {
        source: "/api/auth/:path*",
        destination: "/api/auth/:path*",
      },
      // 其他 API 请求代理到后端
      {
        source: "/api/:path*",
        destination: `${process.env.API_URL || "http://localhost:4000"}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
