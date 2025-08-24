/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Ignore Windows system files that cause Watchpack errors
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/C:/DumpStack.log.tmp',
          '**/C:/pagefile.sys',
          '**/C:/swapfile.sys',
          '**/C:/hiberfil.sys',
          '**/C:/DumpStack.log.tmp/**',
          '**/C:/pagefile.sys/**',
          '**/C:/swapfile.sys/**',
          '**/C:/hiberfil.sys/**',
          // Additional Windows system files
          '**/C:/System Volume Information/**',
          '**/C:/$Recycle.Bin/**',
          '**/C:/Windows/**',
          '**/C:/Program Files/**',
          '**/C:/Program Files (x86)/**',
          '**/C:/Users/**/AppData/**',
          '**/C:/Users/**/Local/Temp/**',
          '**/C:/Users/**/Local/Temporary Internet Files/**',
        ],
        poll: false, // Disable polling to reduce system file access
      };
      
      // Add custom resolver to ignore system files
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
        },
      };
    }
    return config;
  },
  async redirects() {
    return [
      { source: '/vision-statement-read', destination: '/about/vision-statement-read', permanent: false },
      { source: '/origin-story-read', destination: '/about/origin-story-read', permanent: false },
      { source: '/timeline-milestones-read', destination: '/about/timeline-milestones-read', permanent: false },
      { source: '/growth-validation-read', destination: '/about/growth-validation-read', permanent: false },
      { source: '/current-partners-read', destination: '/about/current-partners-read', permanent: false },
      { source: '/nebula-point-read', destination: '/about/nebula-point-read', permanent: false },
      { source: '/horizon-read', destination: '/about/horizon-read', permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/appspecific/com.chrome.devtools.json',
        destination: '/api/.well-known/appspecific/com.chrome.devtools.json',
      },
    ];
  },
}

export default nextConfig
