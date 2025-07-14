/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Configuração para o PDFKit
    if (isServer) {
      config.module.rules.push({
        test: /\.(afm|ttf|woff|woff2)$/,
        type: "asset/resource",
        generator: {
          filename: "static/[hash][ext]",
        },
      });
    }

    return config;
  },
  serverComponentsExternalPackages: ["pdfkit"],
};

module.exports = nextConfig;
