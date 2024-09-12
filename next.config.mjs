/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      // Keep any other patterns you need
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
