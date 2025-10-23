/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilita verificação de versão do Node.js
  experimental: {
    esmExternals: false,
  },
  // Configurações para build
  typescript: {
    // Ignora erros de TypeScript durante build
    ignoreBuildErrors: false,
  },
  eslint: {
    // Ignora erros de ESLint durante build
    ignoreDuringBuilds: false,
  },
  // Configurações de output
  output: 'standalone',
  // Configurações de imagens
  images: {
    unoptimized: true,
  },
  // Configurações de webpack
  webpack: (config, { isServer }) => {
    // Configurações específicas para build
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;