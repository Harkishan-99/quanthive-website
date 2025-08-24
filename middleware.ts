import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle Chrome DevTools requests
  if (request.nextUrl.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
    return NextResponse.json({}, { status: 200 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/.well-known/appspecific/com.chrome.devtools.json',
  ],
};
