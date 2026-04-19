import { redirect } from 'next/navigation'
import ChatClient from '@/components/chat-client'
import { getSession } from '@/lib/session'

export default async function ChatPage() {
    const session = await getSession()

    if (!session?.userId || session.expiresAt < new Date()) {
        redirect('/')
    }

    const initialUsecase = session.usecase ?? null
    const usecaseLocked = session.mode === 'demo' && Boolean(session.usecase)

    return (
        <ChatClient
            initialUsecase={initialUsecase}
            usecaseLocked={usecaseLocked}
        />
    )
}
