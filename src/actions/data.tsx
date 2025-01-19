'use server'

export async function getResponse(userMessage: string) {
    return userMessage.toUpperCase()
}