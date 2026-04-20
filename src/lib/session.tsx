import 'server-only'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { UsecaseType } from '@/types/chat'

export type SessionMode = 'user' | 'demo'

export interface SessionData {
    userId: string
    expiresAt: Date
    usecase?: UsecaseType | null
    mode?: SessionMode | null
}

interface SessionJWTPayload {
    userId?: string
    expiresAt?: string
    usecase?: UsecaseType | null
    mode?: SessionMode | null
}

interface CreateSessionOptions {
    userId: string
    usecase?: UsecaseType | null
    mode?: SessionMode | null
}

function getEncodedKey() {
    const secretKey = process.env.SESSION_SECRET

    if (!secretKey) {
        throw new Error('SESSION_SECRET is not configured')
    }

    return new TextEncoder().encode(secretKey)
}

export async function encrypt(payload: SessionData) {
    return new SignJWT({
        userId: payload.userId,
        expiresAt: payload.expiresAt.toISOString(),
        usecase: payload.usecase ?? null,
        mode: payload.mode ?? 'user',
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(getEncodedKey())
}

export async function decrypt(session: string | undefined): Promise<SessionData | null> {
    if (!session) {
        return null
    }

    try {
        const { payload } = await jwtVerify(session, getEncodedKey(), {
            algorithms: ['HS256'],
        })

        const sessionPayload = payload as SessionJWTPayload
        if (
            typeof sessionPayload.userId !== 'string' ||
            typeof sessionPayload.expiresAt !== 'string'
        ) {
            return null
        }

        return {
            userId: sessionPayload.userId,
            expiresAt: new Date(sessionPayload.expiresAt),
            usecase: sessionPayload.usecase ?? null,
            mode: sessionPayload.mode ?? 'user',
        }
    } catch (error) {
        console.log('Failed to verify session', error)
        return null
    }
}

export async function createSession({
    userId,
    usecase = null,
    mode = 'user',
}: CreateSessionOptions) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({
        userId,
        expiresAt,
        usecase,
        mode,
    })
    const cookieStore = await cookies()

    await cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })
}

export async function getSession() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    return decrypt(sessionCookie)
}

export async function deleteSession() {
    const cookieStore = await cookies()
    await cookieStore.delete('session')
}
