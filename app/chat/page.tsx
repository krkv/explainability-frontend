'use client'

import { useActionState } from "react"
import styles from './styles.module.css'

interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

function addUserMessage(previousState, formData) {
    const userMessage = formData.get('userMessage')
    if (userMessage !== '') {
        return [{ role: 'user', content: userMessage }, ...previousState]
    }
    return previousState
}

function addAssistantMessage(previousState, formData) {
    
}

function formatMessages(messages: ChatMessage[]) {
    return messages.map((message, index) => <div key={index} className={styles['message-' + message.role]}>{message.content}</div>)
}

export default function Chat() {
    const [messages, formAction] = useActionState(addUserMessage, []);

    return (
        <div className={styles['page-container']}>
            <div className={styles['messages-container']}>
                {formatMessages(messages)}
            </div>
            <form action={formAction} className={styles['chat-footer']}>
                <input name='userMessage' className={styles['chat-input']}></input>
                <button className={styles['chat-button']}>Send</button>
            </form>
        </div>
    )
}