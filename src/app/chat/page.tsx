'use client'

import { useEffect, useState } from "react"
import { getAssistantResponse } from '@/actions/assistant'
import { ChatMessage } from '@/types/chat'
import Image from 'next/image'
import assistantIcon from '@/assets/claire-b.png'
import styles from '@/styles/chat.module.css'

const welcomeMessage: ChatMessage = {
    role: 'assistant',
    content: "Hello! I'm Claire, your data science assistant. I am here to help you understand your data, models, predictions, and more. What would you like to know?"
}

function formatMessages(messages: ChatMessage[]) {
    return messages.map((message, index) => {
        if (message.role === 'assistant') {
            return <div key={index} className={styles['bubble-assistant']}>
                <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
                <div className={styles['message-assistant']} dangerouslySetInnerHTML={{ __html: message.content }}></div>
            </div>
        }
        return <div key={index} className={styles['message-user']}>{message.content}</div>
    })
}

const loadingMessage = <div key={0} className={styles['bubble-assistant']}>
    <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
    <div className={styles['message-assistant']}><div className={styles['loader']}></div></div>
</div>

export default function Chat() {
    const [messages, setMessages] = useState([welcomeMessage])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function addAssistantMessage() {
            const lastMessage = messages?.[0]
            if (lastMessage && lastMessage.role === 'user') {
                const conversation = messages.toReversed()
                const assistantResponse = await getAssistantResponse(conversation)
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: assistantResponse
                }
                setLoading(false)
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
        setLoading(true)
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['chat-toolbar']}>
                <div className={styles['chat-info']}>meta-llama/Llama-3.3-70B-Instruct &#10058;</div>
            </div>
            <div className={styles['messages-container']}>
                {loading ? loadingMessage : null}
                {formatMessages(messages)}
            </div>
            <form action={addUserMessage} className={styles['chat-footer']}>
                <textarea name='userMessage' className={styles['chat-input']} placeholder="Type your message here..." rows={1}></textarea>
                <button className={styles['chat-button']} disabled={loading}>Send</button>
            </form>
        </div>
    )
}