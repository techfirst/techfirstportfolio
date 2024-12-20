/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "directorydock.blob.core.windows.net",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_URL: "https://techfirst.se", // Replace with your actual domain
  },
};

module.exports = nextConfig;
