'use server'

import { redirect } from 'next/navigation'
import { deleteSession } from '@/lib/session'
import { createDemoSessionFromAccessCode } from '@/lib/demo-access'

export async function validateDemoAccess(f: FormData) {
    const formJson = Object.fromEntries(f.entries())
    const accessCode = formJson.accessCode?.toString().trim() ?? ''
    const demoAccess = await createDemoSessionFromAccessCode(accessCode)

    if (demoAccess) {
        redirect('/chat')
    }

    throw new Error('Invalid access code')
}

export async function logout() {
    await deleteSession()
    redirect('/')
}
