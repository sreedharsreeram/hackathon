import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/api/auth']

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  
  // Check if the current route is public, including query parameters
  const fullPath = `${pathname}${search}`
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    // Prevent redirect loops on login page
    if (pathname === '/login') {
      return NextResponse.next()
    }
    // For other public routes, check if we're already in a redirect
    if (search.includes('callbackUrl')) {
      return NextResponse.next()
    }
  }

  // Check for session token in cookies (handle both development and production cookie names)
  const sessionToken = request.cookies.get('next-auth.session-token') || 
                      request.cookies.get('__Secure-next-auth.session-token')
  
  // If this is an API route and there's no session, return 401
  if (pathname.startsWith('/api') && !sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Redirect to login if no session token and not on a public route
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url)
    // Only add callbackUrl if we're not already on login page
    if (pathname !== '/login') {
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url))
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configure which routes middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
} 