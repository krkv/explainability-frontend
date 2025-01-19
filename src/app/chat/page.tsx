'use client'

import { useEffect, useState } from "react"
import { getResponse } from '@/actions/data'
import { ChatMessage } from '@/types/chat'
import styles from '@/styles/chat.module.css'

function formatMessages(messages: ChatMessage[]) {
    return messages.map((message, index) => <div key={index} className={styles['message-' + message.role]}>{message.content}</div>)
}

export default function Chat() {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        async function addAssistantMessage() {
            const lastMessage = messages?.[0]
            if (lastMessage && lastMessage.role === 'user') {
                const content = lastMessage.content
                const assistantResponse = await getResponse(content)
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: assistantResponse
                }
                setMessages([assistantMessage, ...messages])
            }
        }
        addAssistantMessage()
    }, [messages])

    function addUserMessage(formData) {
        const userMessage = formData.get('userMessage')
        if (userMessage !== '') {
            setMessages([{ role: 'user', content: userMessage }, ...messages])
        }
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['messages-container']}>
                {formatMessages(messages)}
            </div>
            <form action={addUserMessage} className={styles['chat-footer']}>
                <input name='userMessage' className={styles['chat-input']}></input>
                <button className={styles['chat-button']}>Send</button>
            </form>
        </div>
    )
}