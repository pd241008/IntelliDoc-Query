import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Block known scripting tools and non-essential scraping bots
const BLOCKED_USER_AGENTS = [
  'curl',
  'python-requests',
  'python-urllib',
  'wget',
  'postmanruntime',
  'insomnia',
  'httpie',
  'libwww-perl',
  'scrapy',
  'bot',
  'spider',
  'crawler',
  'scraper'
]

// Allow standard SEO crawlers so we don't hurt visibility
const ALLOWED_BOTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot'
]

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''

  if (!userAgent) {
    // Block requests without a user agent entirely
    return new NextResponse('Forbidden: Missing User-Agent', { status: 403 })
  }

  // Check if it's an explicitly allowed SEO bot
  const isAllowedBot = ALLOWED_BOTS.some(bot => userAgent.includes(bot))
  if (isAllowedBot) {
    return NextResponse.next()
  }

  // Block scripts and unauthorized scrapers
  const isBlocked = BLOCKED_USER_AGENTS.some(blocked => userAgent.includes(blocked))
  
  if (isBlocked) {
    return new NextResponse('Forbidden: Bot/Script access denied.', { status: 403 })
  }

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to everything except Next.js internal files and static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
