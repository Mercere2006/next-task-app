import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ระบุตำแหน่งอ้างอิงรูปภาพจาก Network/Inter
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xeqtggywsdyrqsmxkatb.supabase.co",
        port: "",
        pathname: '/**'
      }
    ]
  }
};

export default nextConfig;
