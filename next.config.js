/** @type {import('next').NextConfig} */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = process.env.ANALYZE === 'true' ? require('@next/bundle-analyzer')({ enabled: true }) : (config) => config;

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add performance budgets
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP', 'FID', 'INP'],
  },
};

module.exports = withBundleAnalyzer(nextConfig);
