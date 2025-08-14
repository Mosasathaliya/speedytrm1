/** @type {import('next').NextConfig} */
const nextConfig = {
  
  distDir: 'build',
  trailingSlash: true,
  images: { unoptimized: true },
  typescript: { 
    ignoreBuildErrors: true 
  },
  eslint: { 
    ignoreDuringBuilds: true 
  },

  // Cloudflare Pages configuration
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_WORKER_URL: process.env.NEXT_PUBLIC_WORKER_URL || 'https://speed-of-mastery-rag.speedofmastry.workers.dev',
  },

  // Exclude unnecessary files from build
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side optimizations
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    
    // Clean build output
    if (config.output) {
      config.output.clean = true;
    }
    
    return config;
  },
};

module.exports = nextConfig;