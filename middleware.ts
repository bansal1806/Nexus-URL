import { NextRequest, NextResponse } from 'next/server'
import { cache } from '@/lib/redis'

// We use Middleware for redirects to ensure zero-latency routing at the Edge.
// This bypasses the full Next.js rendering lifecycle for short links.

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Skip if not a potential short code (e.g., assets, api, dashboard)
  if (
    path === '/' || 
    path.startsWith('/api') || 
    path.startsWith('/dashboard') || 
    path.includes('.')
  ) {
    return NextResponse.next();
  }

  const shortCode = path.split('/')[1];

  if (shortCode) {
    try {
      // 1. Try Cache First (Redis)
      const cachedUrl = await cache.getRedirect(shortCode);
      
      if (cachedUrl) {
        // Log analytics asynchronously (Cloudflare Workers / Edge can't await this easily 
        // without background execution, but for now we'll just redirect)
        return NextResponse.redirect(new URL(cachedUrl));
      }

      // 2. If Cache Miss, forward to an API route to handle DB lookup + Caching
      // We perform a rewrite instead of a redirect so the user doesn't see /api/redirect/xyz
      return NextResponse.rewrite(new URL(`/api/resolve/${shortCode}`, req.url));
      
    } catch (error) {
      console.error('Middleware Error:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
