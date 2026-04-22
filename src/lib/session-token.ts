import { SignJWT, jwtVerify } from 'jose'
import { UsecaseType } from '@/types/chat'

export const SESSION_COOKIE_NAME = 'session'

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000

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

export interface CreateSessionOptions {
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

export async function buildSessionCookie({
    userId,
    usecase = null,
    mode = 'user',
}: CreateSessionOptions) {
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
    const value = await encrypt({
        userId,
        expiresAt,
        usecase,
        mode,
    })

    return {
        name: SESSION_COOKIE_NAME,
        value,
        options: {
            httpOnly: true,
            secure: true,
            expires: expiresAt,
            sameSite: 'lax' as const,
            path: '/',
        },
    }
}
