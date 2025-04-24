'use server'

import { redirect } from 'next/navigation'
import { createSession, deleteSession } from '@/lib/session'
import { handleUserLogin } from '@/lib/firebase'

export async function validateForm(f: FormData) {
    const formJson = Object.fromEntries(f.entries())
    const email = formJson.email.toString().trim()
    const password = formJson.password.toString().trim()
    const user = await handleUserLogin(email, password)
    if (user) {
        await createSession(user.uid)
        redirect('/chat')
    }
}

export async function logout() {
    await deleteSession()
    redirect('/')
}