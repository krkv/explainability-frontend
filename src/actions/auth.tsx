'use server'

// import { redirect } from 'next/navigation'
// import { createSession } from '@/lib/session'
import { handleUserLogin } from '@/actions/firebase'

// const secretKey = process.env.ALLOWED_TOKEN

export async function validateForm(f: FormData) {
    const formJson = Object.fromEntries(f.entries())
    const email = formJson.email.toString().trim()
    const password = formJson.password.toString().trim()
    // if (token === secretKey) {
    //     await createSession('testUser')
    //     redirect('/chat')
    // }
    const user = await handleUserLogin(email, password)
    console.log(user)
}