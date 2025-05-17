'use client'

import { useEffect, useState } from "react"
import classNames from 'classnames';
import { handleSaveConversation } from "@/lib/firebase"
import { logout } from "@/actions/auth"
import { getAssistantResponse, getBackendReady } from '@/actions/assistant'
import { ChatMessage, ModelType } from '@/types/chat'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import assistantIcon from '@/assets/claire-b.png'
import styles from '@/styles/chat.module.css'
import loaders from '@/styles/loaders.module.css'

const welcomeMessage: ChatMessage = {
    role: 'assistant',
    content: "<p>Hello! I'm Claire, your explainability assistant. I am here to help you better understand your data, models and predictions, and more.</p>\
    <p>Ask me anything using the chat box below. You can also use the examples on the right to see how I respond to different questions.</p>\
    <p><b>I can tell you about the pre-loaded dataset and ML model, show you the data, predict instances using the ML model and explain predictions,\
    check the accuracy of predictions, generate counterfactual explanations, answer what-if questions about a data sample, and predict a new sample</b>.</p>"
}

function formatMessages(messages: ChatMessage[]) {
    return messages.map((message, index) => {
        if (message.role === 'assistant') {
            return <div key={index} className={styles['bubble-assistant']}>
                {(index === 0) && <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />}
                <div className={classNames(styles['message-assistant'], index !== 0 ? styles['message-assistant-padded'] : null)} dangerouslySetInnerHTML={{ __html: message.content }}></div>
            </div>
        }
        return <div key={index} className={styles['message-user']}>{message.content}</div>
    })
}

const loadingMessage = <div key={0} className={styles['bubble-assistant']}>
    <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
    <div className={styles['message-assistant']}><div className={loaders['message-loader']}></div></div>
</div>

const demoMessages =
    [
        'Hello, please tell me about yourself',
        'What kind of dataset is currently loaded?',
        'Tell me more about the features',
        'How about the model',
        'How many samples are in the dataset?',
        'How many data points have outdoor temperature warmer than 28 degrees?',
        'Show me all IDs',
        'I want to see the data for outdoor temperature higher than 28 degrees',
        'And what are the predictions for previous group',
        'Analyze if previous group is predicted correctly',
        'What is the accuracy of the model, overall?',
        'Show me id 1',
        'Predict id 1 and explain feature importance',
        'What kind of explainer is used?',
        'How can we change the prediction for id 1?',
        'What would model predict if indoor temperature for id 1 was set 20 degrees?',
        'Predict a new instance with indoor 15, outdoor 25 and past electricity 980',
    ]

export default function Chat() {
    const [messages, setMessages] = useState([welcomeMessage])
    const [loading, setLoading] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [model, setModel] = useState(ModelType.Gemini)
    const [showSidebar, setShowSidebar] = useState(false)
    const [docRefId, setDocRefId] = useState(null)
    const [backendReady, setBackendReady] = useState(false)

    useEffect(() => {
        async function checkBackend() {
            try {
                const backendReady = await getBackendReady()

                if (backendReady) {
                    setBackendReady(true)
                } else {
                    setTimeout(() => {
                        checkBackend()
                    }, 2000)
                }
            }
            catch (e) {
                console.log(e)
            }
        }

        if (!backendReady) {
            checkBackend()
        }
    }, [backendReady])

    useEffect(() => {
        async function addAssistantMessage() {
            const lastMessage = messages?.[0]
            if (lastMessage && lastMessage.role === 'user') {
                const conversation = messages.toReversed()
                const assistantResponse = await getAssistantResponse(conversation, model)
                const newAssistantMessages = []
                if (assistantResponse.freeform_response) {
                    newAssistantMessages.push({
                        role: 'assistant',
                        content: `<p>${assistantResponse.freeform_response}</p> ${assistantResponse.function_calls.length > 0 ? '<p>Calling functions: ' + assistantResponse.function_calls.map(call => `<code>${call}</code>`).join(', ') + '</p>' : ''}`
                    })
                }
                if (assistantResponse.parse) {
                    newAssistantMessages.push({
                        role: 'assistant',
                        content: assistantResponse.parse
                    })
                }
                setLoading(false)
                setMessages([...newAssistantMessages.toReversed(), ...messages])
            }
        }
        addAssistantMessage()
    }, [messages, model])

    useEffect(() => {
        async function saveConversation() {
            const id = await handleSaveConversation(messages.toReversed(), docRefId)
            setDocRefId(id)
        }
        if (messages.length > 1 && loading === false) {
            saveConversation()
        }
    }, [messages])

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

    function handleLogout() {
        logout()
    }

    if (!backendReady) {
        return (
            <div className={styles['page-container']}>
                <div className={loaders['page-loader']}></div>
            </div>
        )
    }

    return (
        <div className={styles['page-container']}>
            <div className={styles['chat-container']}>
                <div className={styles['chat-toolbar']}>
                    <div className={styles['chat-info']}>
                        <div className={styles['dropdown']} onClick={toggleModelDropdown}>
                            <a className={styles['toolbar-button']}>Model: {model}</a>
                            <div className={showModelDropdown ? styles['dropdown-content'] : styles['hidden']} onClick={onSelectModel}>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.Gemini}</a>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.Llama}</a>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className={classNames(styles['toolbar-button'], styles['red-button'])} onClick={resetConversation}>Reset</button>
                        <button className={classNames(styles['toolbar-button'], styles['red-button'])} onClick={handleLogout}>Logout</button>
                        <button className={styles['toolbar-button']} onClick={toggleSidebar}>Examples</button>
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
                <h2>Example prompts</h2>
                <p>You can try the examples below to see how the model responds to different questions:</p>
                <ul>
                    {demoMessages.map((message, index) => (
                        <li key={index}><button key={index} className={classNames(styles['demo-button'])} onClick={handleDemoButtonClick} disabled={loading}>{message}</button></li>
                    ))}
                </ul>
            </div>
        </div>
    )
}