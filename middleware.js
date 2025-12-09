import { NextResponse } from 'next/server';
import { i18n } from './src/lib/i18n-config';

export function middleware(request) {
  const pathname = request.nextUrl.pathname;

  
  // Handle /en redirect to / (301 permanent redirect)
  if (pathname.startsWith('/en')) {
    const newPath = pathname.replace(/^\/en/, '') || '/';
    const searchParams = request.nextUrl.searchParams.toString();
    const redirectUrl = new URL(
      `${newPath}${searchParams ? `?${searchParams}` : ''}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes that don't need locale handling
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).)*',
  ],
};
