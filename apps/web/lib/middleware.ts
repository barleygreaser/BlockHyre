import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Validates the Origin and/or Referer headers against the Host header to prevent CSRF attacks.
 * This is a stateless protection mechanism recommended by OWASP for APIs.
 */
function verifyCsrfOrigin(request: NextRequest): boolean {
  // Safe methods do not mutate state and do not require CSRF protection
  const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
  if (safeMethods.includes(request.method)) return true;

  // Webhooks are explicitly exempted because they legitimately originate from third parties (e.g., Stripe)
  if (request.nextUrl.pathname.startsWith('/api/stripe/webhook')) return true;

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host');

  if (!host) {
    // If we can't determine our own host, we can't securely verify the origin.
    // In production, a missing host header is suspicious.
    return false;
  }

  // Parse host without port (if present) for more robust comparison, though matching exactly is also fine
  const expectedHost = host.split(':')[0];

  // If origin is provided, verify it
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.hostname === expectedHost) return true;
    } catch {
      return false; // Malformed origin
    }
  }

  // If referer is provided, verify it (fallback)
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.hostname === expectedHost) return true;
    } catch {
      return false; // Malformed referer
    }
  }

  // If both are missing, reject strict-mode CSRF
  // Note: Privacy tools sometimes strip referer, but origin is required by browsers for CORS/POST requests
  return false;
}

export async function updateSession(request: NextRequest) {
  // 1. Enforce stateless CSRF protection before any other logic
  if (!verifyCsrfOrigin(request)) {
    console.warn(`[CSRF] Blocked request to ${request.nextUrl.pathname} from origin ${request.headers.get('origin')} with referer ${request.headers.get('referer')}`);
    return new NextResponse(
      JSON.stringify({ error: "Forbidden: CSRF token invalid or missing." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getUser() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Set a lightweight auth hint cookie for SSR skeleton rendering.
  // This is NOT a security mechanism — purely a rendering optimization
  // so the server render can include authenticated-only skeletons (e.g. "My Neighborhood")
  // from the very first paint, eliminating CLS and skeleton pop-in.
  if (user) {
    supabaseResponse.cookies.set('bh-auth-hint', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })
  } else {
    supabaseResponse.cookies.delete('bh-auth-hint')
  }

  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/messages',
    '/checkout',
    '/add-tool',
    '/request-booking',
    '/my-rentals',
    '/reviews',
    '/disputes',
    '/owner',
  ]

  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
    // no user, respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
