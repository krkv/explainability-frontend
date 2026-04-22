import 'server-only'

import { cookies } from 'next/headers'
import {
    buildSessionCookie,
    decrypt,
    SESSION_COOKIE_NAME,
    type CreateSessionOptions,
    type SessionData,
    type SessionMode,
} from '@/lib/session-token'

export { decrypt }
export type { SessionData, SessionMode }

export async function createSession({
    userId,
    usecase = null,
    mode = 'user',
}: CreateSessionOptions) {
    const cookieStore = await cookies()
    const sessionCookie = await buildSessionCookie({
        userId,
        usecase,
        mode,
    })

    await cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.options)
}

export async function getSession() {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

    return decrypt(sessionCookie)
}

export async function deleteSession() {
    const cookieStore = await cookies()
    await cookieStore.delete(SESSION_COOKIE_NAME)
}
