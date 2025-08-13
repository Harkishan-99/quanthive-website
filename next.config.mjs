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
}

export default nextConfig
