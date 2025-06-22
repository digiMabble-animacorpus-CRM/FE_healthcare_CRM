import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboards/agent', request.url))
  }
  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/',
}

export { default } from 'next-auth/middleware'
