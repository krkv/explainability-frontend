import 'server-only'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: { userId: string, expiresAt: Date }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(encodedKey)
}

export async function decrypt(session: string | undefined) {
    if (!session) return null
    try {
        const { payload } = await jwtVerify(session, encodedKey, {
            algorithms: ['HS256'],
        })
        return payload
    } catch (error) {
        console.log('Failed to verify session', error)
    }
}

export async function createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId, expiresAt })
    const cookieStore = await cookies()

    await cookieStore.set('session', session, {
        httpOnly: true,
        secure: true,
        expires: expiresAt,
        sameSite: 'lax',
        path: '/',
    })

    await cookieStore.set('userId', userId)
}