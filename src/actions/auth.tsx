'use server'

import { redirect } from 'next/navigation'
import { createSession } from '@/lib/session'

const secretKey = process.env.ALLOWED_TOKEN

export async function validateForm(f: FormData) {
    const formJson = Object.fromEntries(f.entries())
    const token = formJson.token
    if (token === secretKey) {
        await createSession('testUser')
        redirect('/chat')
    }
}