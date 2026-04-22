import { NextRequest, NextResponse } from 'next/server'
import { resolveDemoAccessCode } from '@/lib/demo-access-config'
import { buildSessionCookie, decrypt, SESSION_COOKIE_NAME } from '@/lib/session-token'

const protectedRoutes = ['/chat']
const authEntryRoutePrefix = '/demo'

function extractDemoAccessCode(path: string) {
    if (!path.startsWith(`${authEntryRoutePrefix}/`)) {
        return null
    }

    const accessCodePath = path.slice(`${authEntryRoutePrefix}/`.length)
    if (!accessCodePath) {
        return null
    }

    return accessCodePath
        .split('/')
        .filter(Boolean)
        .map((segment) => decodeURIComponent(segment))
        .join('/')
}

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    const isProtectedRoute = protectedRoutes.includes(path)
    const isAuthEntryRoute = path === authEntryRoutePrefix || path.startsWith(`${authEntryRoutePrefix}/`)
    const accessCodeFromPath = extractDemoAccessCode(path)
    const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value

    if (isProtectedRoute && !cookie) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    const session = await decrypt(cookie)
    const expired = session ? session.expiresAt < new Date() : Boolean(cookie)
    const activeSession = expired ? null : session

    if (isProtectedRoute && !activeSession?.userId) {
        const response = NextResponse.redirect(new URL('/', req.nextUrl))

        if (cookie) {
            response.cookies.delete(SESSION_COOKIE_NAME)
        }
        return response
    }

    if (isAuthEntryRoute && activeSession?.userId) {
        return NextResponse.redirect(new URL('/chat', req.nextUrl))
    }

    if (accessCodeFromPath && !activeSession?.userId) {
        const demoAccess = resolveDemoAccessCode(accessCodeFromPath)

        if (demoAccess) {
            const response = NextResponse.redirect(new URL('/chat', req.nextUrl))
            const sessionCookie = await buildSessionCookie({
                userId: demoAccess.userId,
                usecase: demoAccess.usecase,
                mode: 'demo',
            })

            response.cookies.set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.options
            )

            return response
        }
    }

    if (expired) {
        const response = NextResponse.next()
        response.cookies.delete(SESSION_COOKIE_NAME)
        return response
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
