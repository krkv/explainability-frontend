'use server'

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'
import { handleUserLogin } from '@/lib/firebase'
import { resolveDemoAccessCode } from '@/lib/demo-access'

export async function validateForm(f: FormData) {
    const formJson = Object.fromEntries(f.entries())
    const email = formJson.email.toString().trim()
    const password = formJson.password.toString().trim()
    const user = await handleUserLogin(email, password)
    if (user) {
        await createSession({
            userId: user.uid,
            mode: 'user',
        })
        redirect('/chat')
    } else {
        throw new Error('Invalid credentials')
    }
}

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
