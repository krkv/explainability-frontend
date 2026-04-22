'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import Image from 'next/image'
import { logout } from '@/actions/auth'
import { getAssistantResponse, getBackendReady, getSuggestedFollowUps } from '@/actions/assistant'
import assistantIcon from '@/assets/claire-b.png'
import heartIcon from '@/assets/heart-disease.png'
import energyIcon from '@/assets/energy-consumption.png'
import styles from '@/styles/chat.module.css'
import loaders from '@/styles/loaders.module.css'
import { ChatMessage, ModelType, UsecaseType } from '@/types/chat'

interface ChatClientProps {
    initialUsecase?: UsecaseType | null
    usecaseLocked?: boolean
}

function createMessage(message: Omit<ChatMessage, 'id'>): ChatMessage {
    return {
        id: crypto.randomUUID(),
        ...message,
    }
}

const welcomeMessage: ChatMessage = {
    id: 'welcome-message',
    role: 'assistant',
    content: "<p>Hello! I'm Claire, your explainability assistant. I am here to help you better understand your data, models and predictions.</p>\
    <p>Ask me anything using the chat box below. You can also use the explore tab to see examples and suggestions.</p>"
}

function formatMessages(messages: ChatMessage[]) {
    return messages.map((message, index) => {
        if (message.role === 'assistant') {
            if (message.isFunctionCall) {
                return <div key={message.id} className={styles['bubble-assistant']}>
                    {index === 0 && <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />}
                    <div
                        className={classNames(
                            styles['message-function-call'],
                            index !== 0 ? styles['message-assistant-padded'] : null
                        )}
                        dangerouslySetInnerHTML={{ __html: `<p>Executing functions: ${message.content}</p>` }}
                    ></div>
                </div>
            }

            if (message.isThinking) {
                return <div key={message.id} className={styles['bubble-assistant']}>
                    {index === 0 && <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />}
                    <div
                        className={classNames(
                            styles['message-thinking'],
                            index !== 0 ? styles['message-assistant-padded'] : null
                        )}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                    ></div>
                </div>
            }

            return <div key={message.id} className={styles['bubble-assistant']}>
                {index === 0 && <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />}
                <div
                    className={classNames(
                        styles['message-assistant'],
                        index !== 0 ? styles['message-assistant-padded'] : null
                    )}
                    dangerouslySetInnerHTML={{ __html: message.content }}
                ></div>
            </div>
        }

        return <div key={message.id} className={styles['message-user']}>{message.content}</div>
    })
}

const loadingMessage = <div key={0} className={styles['bubble-assistant']}>
    <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
    <div className={styles['message-assistant']}><div className={loaders['message-loader']}></div></div>
</div>

const demoMessagesEnergy = [
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

const demoMessagesHeart = [
    'What is current dataset?',
    'How many patients are predicted positive?',
    'What are the patient IDs?',
    'What kind of machine learning model is used?',
    'How does the model generally decide whether a patient has heart disease?',
]

function getDefaultHeartDemoMessages() {
    return [...demoMessagesHeart]
}

export default function ChatClient({
    initialUsecase = null,
    usecaseLocked = false,
}: ChatClientProps) {
    const [messages, setMessages] = useState([welcomeMessage])
    const [loading, setLoading] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [model, setModel] = useState(ModelType.GeminiFlash25)
    const [showSidebar, setShowSidebar] = useState(false)
    const [backendReady, setBackendReady] = useState(false)
    const [usecase, setUsecase] = useState<UsecaseType | null>(initialUsecase)
    const [heartDemoMessages, setHeartDemoMessages] = useState(getDefaultHeartDemoMessages)
    const [suggestionsLoading, setSuggestionsLoading] = useState(false)
    const pendingMessageTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([])
    const processedUserMessageIdRef = useRef<string | null>(null)
    const conversationSessionIdRef = useRef(crypto.randomUUID())

    function clearPendingMessageTimeouts() {
        pendingMessageTimeoutsRef.current.forEach(clearTimeout)
        pendingMessageTimeoutsRef.current = []
    }

    useEffect(() => {
        async function checkBackend() {
            try {
                const assistantBackendReady = await getBackendReady()

                if (assistantBackendReady) {
                    setBackendReady(true)
                } else {
                    setTimeout(() => {
                        checkBackend()
                    }, 2000)
                }
            } catch (error) {
                console.error(error)
            }
        }

        if (!backendReady) {
            checkBackend()
        }
    }, [backendReady])

    useEffect(() => {
        return () => {
            clearPendingMessageTimeouts()
        }
    }, [])

    useEffect(() => {
        async function addAssistantMessage() {
            const lastMessage = messages?.[0]
            if (!lastMessage || lastMessage.role !== 'user' || !usecase) {
                return
            }

            if (processedUserMessageIdRef.current === lastMessage.id) {
                return
            }

            processedUserMessageIdRef.current = lastMessage.id

            const conversation = messages.toReversed()
            const assistantResponsePromise = getAssistantResponse(
                conversation,
                model,
                usecase,
                conversationSessionIdRef.current,
            )
            const suggestedFollowUpsPromise = usecase === UsecaseType.Heart
                ? getSuggestedFollowUps(
                    conversation,
                    usecase,
                    conversationSessionIdRef.current,
                )
                : Promise.resolve(undefined)

            suggestedFollowUpsPromise.then((suggestedFollowUps) => {
                if (
                    processedUserMessageIdRef.current !== lastMessage.id ||
                    usecase !== UsecaseType.Heart ||
                    !suggestedFollowUps?.length
                ) {
                    return
                }

                setHeartDemoMessages(suggestedFollowUps)
            }).finally(() => {
                if (processedUserMessageIdRef.current === lastMessage.id && usecase === UsecaseType.Heart) {
                    setSuggestionsLoading(false)
                }
            }).catch((error) => {
                console.error(error)
            })

            const assistantResponse = await assistantResponsePromise

            if (processedUserMessageIdRef.current !== lastMessage.id) {
                return
            }

            const newAssistantMessages: ChatMessage[] = []
            const hasFunctionCalls = assistantResponse.function_calls.length > 0

            if (assistantResponse.freeform_response) {
                newAssistantMessages.push(createMessage({
                    role: 'assistant',
                    content: `<p>${assistantResponse.freeform_response}</p>`,
                    isThinking: hasFunctionCalls,
                }))
            }

            if (hasFunctionCalls) {
                newAssistantMessages.push(createMessage({
                    role: 'assistant',
                    content: assistantResponse.function_calls.map(call => `<code>${call}</code>`).join(', '),
                    isFunctionCall: true,
                }))
            }

            if (assistantResponse.parse) {
                newAssistantMessages.push(createMessage({
                    role: 'assistant',
                    content: assistantResponse.parse,
                }))
            }

            clearPendingMessageTimeouts()

            if (newAssistantMessages.length === 0) {
                setLoading(false)
                return
            }

            let cumulativeDelay = 0
            newAssistantMessages.forEach((message, index) => {
                if (index > 0) {
                    cumulativeDelay += 600 + Math.random() * 400
                }

                const timeoutId = setTimeout(() => {
                    setMessages(prevMessages => [message, ...prevMessages])

                    if (index === newAssistantMessages.length - 1) {
                        setLoading(false)
                        pendingMessageTimeoutsRef.current = []
                    }
                }, cumulativeDelay)

                pendingMessageTimeoutsRef.current.push(timeoutId)
            })
        }

        addAssistantMessage()
    }, [messages, model, usecase])

    function addUserMessage(formData: FormData) {
        const userMessage = formData.get('userMessage')?.toString().trim() ?? ''

        if (userMessage !== '') {
            clearPendingMessageTimeouts()
            if (usecase === UsecaseType.Heart) {
                setSuggestionsLoading(true)
            }
            setMessages([createMessage({ role: 'user', content: userMessage }), ...messages])
            setLoading(true)
        }
    }

    function resetConversation() {
        clearPendingMessageTimeouts()
        processedUserMessageIdRef.current = null
        conversationSessionIdRef.current = crypto.randomUUID()
        setMessages([welcomeMessage])
        setLoading(false)
        setSuggestionsLoading(false)

        if (usecase === UsecaseType.Heart) {
            setHeartDemoMessages(getDefaultHeartDemoMessages())
        }
    }

    function toggleModelDropdown() {
        setShowModelDropdown(!showModelDropdown)
    }

    function toggleSidebar() {
        setShowSidebar(!showSidebar)
    }

    function onSelectModel(event: React.MouseEvent<HTMLAnchorElement>) {
        setModel(event.currentTarget.innerText as ModelType)
        setShowModelDropdown(false)
    }

    function handleDemoButtonClick(event: React.MouseEvent<HTMLButtonElement>) {
        const userMessage = event.currentTarget.innerText
        clearPendingMessageTimeouts()
        if (usecase === UsecaseType.Heart) {
            setSuggestionsLoading(true)
        }
        setMessages([createMessage({ role: 'user', content: userMessage }), ...messages])
        setLoading(true)
    }

    function handleLogout() {
        logout()
    }

    function getDemoMessages() {
        if (usecase === UsecaseType.Energy) {
            return demoMessagesEnergy
        }

        if (usecase === UsecaseType.Heart) {
            return heartDemoMessages
        }

        return []
    }

    if (!usecase) {
        if (usecaseLocked) {
            return (
                <div className={styles['page-container']}>
                    <div className={loaders['page-loader']}></div>
                </div>
            )
        }

        return (
            <div className={styles['page-container']}>
                <a className={styles['usecase-link']} onClick={() => setUsecase(UsecaseType.Heart)}><Image src={heartIcon} alt="Assistant icon" width={50} height={50} />{UsecaseType.Heart}</a>
                <a className={styles['usecase-link']} onClick={() => setUsecase(UsecaseType.Energy)}><Image src={energyIcon} alt="Assistant icon" width={50} height={50} />{UsecaseType.Energy}</a>
            </div>
        )
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
                            <div className={showModelDropdown ? styles['dropdown-content'] : styles['hidden']}>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.GeminiFlash25}</a>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.Gemini}</a>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button className={styles['toolbar-button']} onClick={toggleSidebar}>Explore</button>
                        <button className={classNames(styles['toolbar-button'], styles['red-button'])} onClick={resetConversation}>Reset</button>
                        <button className={classNames(styles['toolbar-button'], styles['red-button'])} onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <div className={styles['messages-container']}>
                    {loading ? loadingMessage : null}
                    {formatMessages(messages)}
                </div>
                <form action={addUserMessage} className={styles['chat-footer']}>
                    <input
                        name='userMessage'
                        className={styles['chat-input']}
                        placeholder="Type your message here..."
                        disabled={loading}
                    ></input>
                    <button className={styles['chat-button']} disabled={loading}>Send</button>
                </form>
            </div>
            <div className={showSidebar ? styles['demo-container'] : styles['hidden']}>
                <h2>Suggested prompts</h2>
                <p>You can try these questions to explore the data and predictions:</p>
                {usecase === UsecaseType.Heart && suggestionsLoading ? (
                    <div className={styles['demo-loading']}>
                        <div className={loaders['message-loader']}></div>
                    </div>
                ) : (
                    <ul>
                        {getDemoMessages().map((message, index) => (
                            <li key={index}><button className={classNames(styles['demo-button'])} onClick={handleDemoButtonClick} disabled={loading}>{message}</button></li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
