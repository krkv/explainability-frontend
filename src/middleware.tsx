import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'
import { cookies } from 'next/headers'

// 1. Specify protected and public routes
const protectedRoutes = ['/chat']
const loginRoute = '/login'

export default async function middleware(req: NextRequest) {
    // 2. Check if the current route is protected or public
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isLoginRoute = path === loginRoute

    // 3. Decrypt the session from the cookie
    const cookie = (await cookies()).get('session')?.value

    if (isProtectedRoute && !cookie) {
        // If the session cookie is not present, redirect to home
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    const session = await decrypt(cookie)

    const expired = session?.expiresAt < new Date()
    if (isProtectedRoute && expired) {
        // If the session is expired, redirect to home
        const cookieStore = await cookies()
        cookieStore.delete('session')
        cookieStore.delete('userId')
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    // 4. Redirect to home if the user is not authenticated
    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    // 5. Redirect from /login to /chat if the user is authenticated
    if (
        isLoginRoute &&
        session?.userId &&
        req.nextUrl.pathname.startsWith('/login')
    ) {
        return NextResponse.redirect(new URL('/chat', req.nextUrl))
    }

    return NextResponse.next()
}

// Routes Middleware should not run on
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}