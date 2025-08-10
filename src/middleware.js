// src/middleware.js - Much simpler middleware
import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const adminId = request.cookies.get('adminId')?.value;
  
  // Protect admin routes
  if (path.startsWith('/admin')) {
    if (!adminId) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // Protect API routes (except auth and public endpoints)
  if (path.startsWith('/api/') && 
      !path.startsWith('/api/auth/') &&
      !path.startsWith('/api/search') &&
      !path.startsWith('/api/shuffle')) {
    if (!adminId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }
  
  // Redirect to admin if already logged in and trying to access login
  if (path === '/login' && adminId) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/login'],
};
// This middleware checks for admin authentication and protects routes accordingly.
// It redirects unauthenticated users to the login page for admin routes and API endpoints,
// and allows access to public routes without authentication.