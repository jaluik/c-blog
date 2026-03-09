import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that should not be rewritten
const reservedPaths = [
  'api',
  'posts',
  'categories',
  'tags',
  'about',
  '_next',
  'static',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process root-level paths
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) {
    return NextResponse.next();
  }

  const slug = segments[0];

  // Skip reserved paths
  if (reservedPaths.includes(slug)) {
    return NextResponse.next();
  }

  // Skip files with extensions
  if (slug.includes('.')) {
    return NextResponse.next();
  }

  // Rewrite to /posts/:slug
  const url = request.nextUrl.clone();
  url.pathname = `/posts/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/((?!api/|_next/|static/|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
