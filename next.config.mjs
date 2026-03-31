/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    if (process.env.NEXT_PUBLIC_API_URL) {
      return [];
    }

    const targetOrigin = process.env.NODE_ENV === "development" ? "http://localhost:3001" : "";
    if (!targetOrigin) {
      return [];
    }

    return [
      {
        source: "/api/:path*",
        destination: `${targetOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
