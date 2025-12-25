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
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "merry-dalmatian-951.convex.cloud",
      },
    ],
  },
  // Allow Cloudflare tunnel domains in development
  allowedDevOrigins: [
    /^https:\/\/.*\.trycloudflare\.com$/,
  ],
};

export default nextConfig;
