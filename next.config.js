/** @type {import('next').NextConfig} */
const nextConfig = {
  // appDir已经是稳定功能，不需要在experimental中配置
  images: {
    domains: ["image.pollinations.ai"],
  },
  // Optimize for Turnstile and security
  async headers() {
    const isDevelopment = process.env.NODE_ENV === "development";

    return [
      {
        source: "/(.*)",
        headers: [
          // Preconnect to Cloudflare for faster Turnstile loading
          {
            key: "Link",
            value: "<https://challenges.cloudflare.com>; rel=preconnect",
          },
          // Security headers (relaxed in development)
          {
            key: "X-Frame-Options",
            value: isDevelopment ? "SAMEORIGIN" : "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // CSP to allow Turnstile scripts (relaxed in development)
          {
            key: "Content-Security-Policy",
            value: isDevelopment
              ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://challenges.cloudflare.com https://image.pollinations.ai https://text.pollinations.ai https://www.google-analytics.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; frame-src 'self' https://challenges.cloudflare.com; child-src 'self' https://challenges.cloudflare.com;"
              : "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://www.google-analytics.com https://www.googletagmanager.com; connect-src 'self' https://challenges.cloudflare.com https://image.pollinations.ai https://text.pollinations.ai https://www.google-analytics.com; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; frame-src https://challenges.cloudflare.com; child-src https://challenges.cloudflare.com;",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
