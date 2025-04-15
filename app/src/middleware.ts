import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('auth_token')?.value;

    // Check if the user is trying to access a protected route
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard');

    // If trying to access a protected route without a token, redirect to login
    if (isProtectedRoute && !authToken) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If already logged in and trying to access login/signup pages
    const isAuthPage = request.nextUrl.pathname === '/login' ||
        request.nextUrl.pathname === '/signup';

    if (isAuthPage && authToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};