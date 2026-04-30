/** @type {import('next').Next.jsConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'cards.scryfall.io',
          port: '',
          pathname: '/**',
        },
      ],
    },
    // This helps catch those "semicolon instead of comma" errors during build
    typescript: {
      ignoreBuildErrors: false,
    },
  };
  
  module.exports = nextConfig;