/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "*" }, { protocol: "http", hostname: "*" }] },
  // Don't bundle pdfjs-dist in serverless functions (used only in client MagazineFlipbook)
  serverExternalPackages: ["pdfjs-dist"],
};

module.exports = nextConfig;
