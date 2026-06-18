import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['next-intl'],

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    // Content-Security-Policy. Notes on the non-obvious bits:
    // - 'unsafe-eval' is REQUIRED: Handlebars compiles templates client-side
    //   (LivePreview/FullScreenPreview) via new Function().
    // - 'unsafe-inline' (script) is REQUIRED: Next.js injects inline bootstrap
    //   scripts and we ship an inline theme-init + JSON-LD in the root layout;
    //   the home/landing is statically rendered, so a per-request nonce isn't
    //   viable without forcing dynamic rendering everywhere.
    // - *.amazonaws.com covers Cognito (idp/identity) + S3 (presigned PUT +
    //   public thumbnails); apis.mkpdfs.com / dev.apis.mkpdfs.com is our API.
    // - Stripe needs nothing: checkout/portal are top-level redirects, not
    //   embedded scripts/iframes (no loadStripe in the bundle).
    const csp = [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.amazonaws.com",
      "font-src 'self' data:",
      "worker-src 'self' blob:",
      "frame-src 'self'",
      "connect-src 'self' https://*.amazonaws.com https://*.amazoncognito.com https://apis.mkpdfs.com https://dev.apis.mkpdfs.com",
      'upgrade-insecure-requests',
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
