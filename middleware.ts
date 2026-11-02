import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-')
  )

  // Si Supabase n'est pas configuré, laisser passer tout le monde (mode localStorage)
  if (!supabaseUrl || !supabaseAnonKey || !isConfigured) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Routes publiques (accessibles sans authentification)
  const publicRoutes = ['/login', '/register', '/marketplace', '/onboarding', '/client/rendez-vous']
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/salon/')

  // Si l'utilisateur n'est pas connecté et essaie d'accéder au dashboard ERP (/)
  if (!user && !isPublicRoute && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si l'utilisateur est connecté et essaie d'accéder à login/register, rediriger vers /
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)'],
}
