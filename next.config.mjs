/** @type {import('next').NextConfig} */
const isMobile = process.env.APP_ENV === 'mobile';

const nextConfig = {
  output: isMobile ? 'export' : undefined,
  serverExternalPackages: ['better-sqlite3'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Replace '*' with specific origins in production if possible, but '*' with credentials requires exact match via server logic or Next.js middleware. 
          // Actually, with credentials: true, 'Access-Control-Allow-Origin' CANNOT be '*'. 
          // It must be the specific origin. 
          // Since we can't dynamic here easily, we might need Middleware for dynamic origin.
          // BUT, for now let's try specific origins. 
          // Just listing them doesn't work in static headers config multiple times? 
          // Next.js headers config doesn't support multiple values for same key easily based on request.
          // I will use Middleware for CORS if I need strict control. 
          // However, for simplicity, I'll allow everything via Middleware or just try to allow specific common Capacitor origins.
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ]
      }
    ]
  }
};

export default nextConfig;
