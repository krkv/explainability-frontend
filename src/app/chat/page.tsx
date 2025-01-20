'use client'

import { useEffect, useState } from "react"
import { getAssistantResponse } from '@/actions/assistant'
import { ChatMessage } from '@/types/chat'
import Image from 'next/image'
import robot from '@/assets/robot-assistant.png'
import styles from '@/styles/chat.module.css'

function formatMessages(messages: ChatMessage[]) {
    return messages.map((message, index) => {
        if (message.role === 'assistant') {
            return <div key={index} className={styles['bubble-assistant']}>
                <Image src={robot} alt="Robot icon" width={50} height={50} />
                <div className={styles['message-assistant']}>{message.content}</div>
            </div>
        }
        return <div key={index} className={styles['message-user']}>{message.content}</div>
    })
}

export default function Chat() {
    const [messages, setMessages] = useState([])

    useEffect(() => {
        async function addAssistantMessage() {
            const lastMessage = messages?.[0]
            if (lastMessage && lastMessage.role === 'user') {
                const content = lastMessage.content
                const assistantResponse = await getAssistantResponse(content)
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