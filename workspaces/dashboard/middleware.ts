import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get('authorization')
  const password = process.env.DASHBOARD_PASSWORD

  if (!password) {
    return new NextResponse('Dashboard not configured', { status: 503 })
  }

  const expected = 'Basic ' + Buffer.from(`admin:${password}`).toString('base64')

  if (basicAuth !== expected) {
    return new NextResponse('Authentication required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="VentureOS Dashboard"' }
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*'
}
