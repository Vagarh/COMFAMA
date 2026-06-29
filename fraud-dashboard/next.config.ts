import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pitch",
        destination: "/pitch/index.html",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
