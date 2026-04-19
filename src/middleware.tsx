import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/chat']
const authEntryRoutes = ['/login', '/demo']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isAuthEntryRoute = authEntryRoutes.includes(path)
    const cookie = req.cookies.get('session')?.value

    if (isProtectedRoute && !cookie) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    const session = await decrypt(cookie)
    const expired = session ? session.expiresAt < new Date() : Boolean(cookie)

    if (expired) {
        const response = isProtectedRoute
            ? NextResponse.redirect(new URL('/', req.nextUrl))
            : NextResponse.next()

        response.cookies.delete('session')
        response.cookies.delete('userId')
        return response
    }

    if (isProtectedRoute && !session?.userId) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    if (isAuthEntryRoute && session?.userId) {
        return NextResponse.redirect(new URL('/chat', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
