/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "utfs.io",
      },
      {
        hostname: "i.imgur.com",
      },
      {
        hostname: "maps.googleapis.com",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
      {
        hostname: "www.google.com",
      },
    ],
  },
};

export default nextConfig;
