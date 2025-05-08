import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next()

  // Add headers to allow embedding in iframes
  response.headers.set("Access-Control-Allow-Origin", "*")
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  response.headers.set("Access-Control-Allow-Headers", "Content-Type")

  // Set X-Frame-Options to allow embedding in iframes
  response.headers.set("X-Frame-Options", "ALLOWALL")

  // Set Content-Security-Policy to allow embedding in iframes
  response.headers.set("Content-Security-Policy", "frame-ancestors 'self' *;")

  return response
}

// Specify which paths this middleware should run on
export const config = {
  matcher: [
    // Apply to all routes
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
