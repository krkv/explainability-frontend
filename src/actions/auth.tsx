'use server'

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'
import { resolveDemoAccessCode } from '@/lib/demo-access'

export async function validateDemoAccess(f: FormData) {
    const formJson = Object.fromEntries(f.entries())
    const accessCode = formJson.accessCode?.toString().trim() ?? ''
    const demoAccess = resolveDemoAccessCode(accessCode)

    if (demoAccess) {
        await createSession({
            userId: demoAccess.userId,
            usecase: demoAccess.usecase,
            mode: 'demo',
        })
        redirect('/chat')
    }

    throw new Error('Invalid access code')
}

export async function logout() {
    await deleteSession()
    redirect('/')
}
