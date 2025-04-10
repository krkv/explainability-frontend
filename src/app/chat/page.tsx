'use client'

import { useEffect, useState } from "react"
import classNames from 'classnames';
import { getNewConversationId, saveConversationToFirestore } from "@/lib/firebase"

import { getAssistantResponse } from '@/actions/assistant'
import { ChatMessage, ModelType } from '@/types/chat'
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

const demoMessages = {
    'A': ['Hello, please tell me about yourself',
        'What kind of dataset is currently loaded?',
        'Yes, what is the distribution of outdoor temperature, for example?',
        'Interesting, I want to see the data for outdoor temperature higher than 26 degrees',
        'And what are the predictions for this group?',
        'I wonder how correct are these predictions',
        'So what is the accuracy of the model, overall?'],
    'B': ['Hello, please tell me about yourself',
        'What kind of dataset is currently loaded?'],
    'C': ['Hello, please tell me about yourself']
}

const demoOptions = demoMessages ? Object.keys(demoMessages) : []

export default function Chat() {
    const [messages, setMessages] = useState([welcomeMessage])
    const [loading, setLoading] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [model, setModel] = useState(ModelType.Llama)
    const [showSidebar, setShowSidebar] = useState(false)
    const [selectedDemo, setSelectedDemo] = useState('A')
    const [docRefId, setDocRefId] = useState(null)

    useEffect(() => {
        async function addAssistantMessage() {
            const lastMessage = messages?.[0]
            if (lastMessage && lastMessage.role === 'user') {
                const conversation = messages.toReversed()
                const assistantResponse = await getAssistantResponse(conversation, model)
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: assistantResponse
                }
                setLoading(false)
                setMessages([assistantMessage, ...messages])
            }
        }
        addAssistantMessage()
    }, [messages, model])

    useEffect(() => {
        async function saveConversation() {
            if (!docRefId) {
                const id = await getNewConversationId()
                setDocRefId(id)
            }
            if (messages.length > 1) {
                await saveConversationToFirestore(messages.toReversed(), docRefId)
            }
        }
        saveConversation()
    }, [messages, docRefId])

    function addUserMessage(formData) {
        const userMessage = formData.get('userMessage')
        if (userMessage !== '') {
            setMessages([{ role: 'user', content: userMessage }, ...messages])
            setLoading(true)
        }
    }

    function resetConversation() {
        setMessages([welcomeMessage])
        setDocRefId(null)
    }

    function toggleModelDropdown() {
        setShowModelDropdown(!showModelDropdown)
    }

    function toggleSidebar() {
        setShowSidebar(!showSidebar)
    }

    function onSelectModel(event) {
        setModel(event.target.innerText)
        setShowModelDropdown(false)
    }

    function handleDemoButtonClick(event) {
        const userMessage = event.target.innerText
        setMessages([{ role: 'user', content: userMessage }, ...messages])
        setLoading(true)
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['chat-container']}>
                <div className={styles['chat-toolbar']}>
                    <div className={styles['chat-info']}>
                        <div className={styles['dropdown']} onClick={toggleModelDropdown}>
                            <a className={styles['toolbar-button']}>Model: {model}</a>
                            <div className={showModelDropdown ? styles['dropdown-content'] : styles['hidden']} onClick={onSelectModel}>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.Llama}</a>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.Gemini}</a>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className={classNames(styles['toolbar-button'], styles['red-button'])} onClick={resetConversation}>Reset</button>
                        <button className={styles['toolbar-button']} onClick={toggleSidebar}>Demos</button>
                    </div>
                </div>
                <div className={styles['messages-container']}>
                    {loading ? loadingMessage : null}
                    {formatMessages(messages)}
                </div>
                <form action={addUserMessage} className={styles['chat-footer']}>
                    <input name='userMessage' className={styles['chat-input']} placeholder="Type your message here..."></input>
                    <button className={styles['chat-button']} disabled={loading}>Send</button>
                </form>
            </div>
            <div className={showSidebar ? styles['demo-container'] : styles['hidden']}>
                <h2>
                    {demoOptions.map((option) => (
                        <button
                            key={option}
                            className={classNames(styles['demo-button'], styles['demo-button-big'], styles['button-' + option.toLowerCase()])}
                            disabled={selectedDemo === option}
                            onClick={() => setSelectedDemo(option)}>
                            {selectedDemo === option ? `Scenario ${option}` : option}
                        </button>
                    ))}
                </h2>
                <ol>
                    {demoMessages[selectedDemo].map((message, index) => (
                        <li key={index}><button key={index} className={classNames(styles['demo-button'])} onClick={handleDemoButtonClick}>{message}</button></li>
                    ))}
                </ol>
            </div>
        </div >
    )
}