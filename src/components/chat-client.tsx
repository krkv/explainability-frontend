'use client'

import { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import Image from 'next/image'
import { logout } from '@/actions/auth'
import { getAssistantResponse, getBackendReady, getSuggestedFollowUps } from '@/actions/assistant'
import assistantIcon from '@/assets/claire-b.png'
import heartIcon from '@/assets/heart-disease.png'
import energyIcon from '@/assets/energy-consumption.png'
import MessageFeedback from '@/components/message-feedback'
import styles from '@/styles/chat.module.css'
import loaders from '@/styles/loaders.module.css'
import { AssistantResponse, ChatMessage, ModelType, UsecaseType } from '@/types/chat'

interface ChatClientProps {
    initialUsecase?: UsecaseType | null
    usecaseLocked?: boolean
}

type FollowUpAnimationState = 'idle' | 'entering' | 'exiting' | 'fading'

interface FollowUpSuggestion {
    id: string
    text: string
    animationState: FollowUpAnimationState
}

interface PendingSuggestionTimeout {
    timeoutId: ReturnType<typeof setTimeout>
    resolve: () => void
}

const SUGGESTION_TRANSITION_MS = 400
const MAX_HEART_SUGGESTIONS = 10
const NEW_HEART_SUGGESTION_COUNT = 3
const ASSISTANT_RESPONSE_TIMEOUT_MS = 30_000

const timedOutAssistantResponses = [
    "I couldn't process that question this time. Please try again.",
    "That request did not complete in time. Please try again.",
    "I wasn't able to finish that response just now. Please try again.",
    "Something got stuck while I was processing that question. Please try again.",
    "I couldn't get a response in time for that question. Please try again.",
]

function createMessage(message: Omit<ChatMessage, 'id'>): ChatMessage {
    return {
        id: crypto.randomUUID(),
        ...message,
    }
}

function createFollowUpSuggestion(
    text: string,
    animationState: FollowUpAnimationState = 'idle',
): FollowUpSuggestion {
    return {
        id: crypto.randomUUID(),
        text,
        animationState,
    }
}

function getRandomTimedOutAssistantResponse() {
    const randomIndex = Math.floor(Math.random() * timedOutAssistantResponses.length)
    return timedOutAssistantResponses[randomIndex]
}

function createTimedOutAssistantResponse() {
    return {
        freeform_response: getRandomTimedOutAssistantResponse(),
        function_calls: [],
    }
}

function createTimeoutPromise() {
    return new Promise<AssistantResponse>((resolve) => {
        setTimeout(() => resolve(createTimedOutAssistantResponse()), ASSISTANT_RESPONSE_TIMEOUT_MS)
    })
}

function hasRenderableAssistantContent(response: AssistantResponse) {
    return Boolean(
        response.freeform_response
        || response.parse
        || response.function_calls.length > 0
    )
}

async function getAssistantResponseWithFallback(
    conversation: ChatMessage[],
    model: ModelType,
    usecase: UsecaseType,
    sessionId: string,
) {
    const requestPromise = getAssistantResponse(
        conversation,
        model,
        usecase,
        sessionId,
    )
        .then((response) => {
            if (hasRenderableAssistantContent(response)) {
                return response
            }

            return createTimeoutPromise()
        })
        .catch((error) => {
            console.error(error)
            return createTimeoutPromise()
        })

    return Promise.race([
        requestPromise,
        createTimeoutPromise(),
    ])
}

const welcomeMessage: ChatMessage = {
    id: 'welcome-message',
    role: 'assistant',
    content: "<p>Hello! I'm Claire, your explainability assistant. I am here to help you better understand your data, models and predictions.</p>\
    <p>Ask me anything using the chat box below. Or explore the suggested prompts on the right.</p>"
}

function formatMessages(messages: ChatMessage[]) {
    function isFeedbackTarget(message: ChatMessage, index: number) {
        if (
            message.role !== 'assistant'
            || !message.traceId
            || message.isFunctionCall
            || message.isThinking
        ) {
            return false
        }

        return !messages.slice(0, index).some((candidate) =>
            candidate.role === 'assistant'
            && candidate.traceId === message.traceId
            && !candidate.isFunctionCall
            && !candidate.isThinking
        )
    }

    return messages.map((message, index) => {
        if (message.role === 'assistant') {
            if (message.isFunctionCall) {
                return <div key={message.id} className={styles['bubble-assistant']}>
                    {index === 0 && (
                        <div className={styles['assistant-icon-wrap']}>
                            <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
                        </div>
                    )}
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
                    {index === 0 && (
                        <div className={styles['assistant-icon-wrap']}>
                            <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
                        </div>
                    )}
                    <div
                        className={classNames(
                            styles['message-thinking'],
                            index !== 0 ? styles['message-assistant-padded'] : null
                        )}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                    ></div>
                </div>
            }

            const showFeedback = isFeedbackTarget(message, index)

            return <div key={message.id} className={styles['bubble-assistant']}>
                {index === 0 && (
                    <div
                        className={classNames(
                            styles['assistant-icon-wrap'],
                            showFeedback ? styles['assistant-icon-wrap-lifted'] : null
                        )}
                    >
                        <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
                    </div>
                )}
                <div className={styles['assistant-message-stack']}>
                    <div
                        className={classNames(
                            styles['message-assistant'],
                            index !== 0 ? styles['message-assistant-padded'] : null
                        )}
                        dangerouslySetInnerHTML={{ __html: message.content }}
                    ></div>
                    {showFeedback ? (
                        <div
                            className={classNames(
                                styles['message-assistant-feedback'],
                                index !== 0 ? styles['message-assistant-padded'] : null
                            )}
                        >
                            <MessageFeedback traceId={message.traceId} />
                        </div>
                    ) : null}
                </div>
            </div>
        }

        return <div key={message.id} className={styles['message-user']}>{message.content}</div>
    })
}

const loadingMessage = <div key={0} className={styles['bubble-assistant']}>
    <div className={styles['assistant-icon-wrap']}>
        <Image src={assistantIcon} alt="Assistant icon" width={50} height={50} />
    </div>
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
    'What is the current dataset?',
    'How many patients are predicted positive?',
    'What are the patient IDs?',
    'Show me the data for patient 10',
    'Is patient 10 predicted heart disease?',
    'Explain the prediction for patient 10',
    'How can we change the prediction for patient 10?',
    'What is the accuracy of the model?',
    'What kind of machine learning model is used?',
    'How does the model generally decide whether a patient has heart disease?',
]

function getDefaultHeartDemoMessages() {
    return demoMessagesHeart.map((message) => createFollowUpSuggestion(message))
}

export default function ChatClient({
    initialUsecase = null,
    usecaseLocked = false,
}: ChatClientProps) {
    const [messages, setMessages] = useState([welcomeMessage])
    const [loading, setLoading] = useState(false)
    const [showModelDropdown, setShowModelDropdown] = useState(false)
    const [model, setModel] = useState(ModelType.GeminiFlashLite31Preview)
    const [showSidebar, setShowSidebar] = useState(true)
    const [backendReady, setBackendReady] = useState(false)
    const [usecase, setUsecase] = useState<UsecaseType | null>(initialUsecase)
    const [heartDemoMessages, setHeartDemoMessages] = useState(getDefaultHeartDemoMessages)
    const pendingMessageTimeoutsRef = useRef<Array<ReturnType<typeof setTimeout>>>([])
    const pendingSuggestionTimeoutsRef = useRef<PendingSuggestionTimeout[]>([])
    const processedUserMessageIdRef = useRef<string | null>(null)
    const conversationSessionIdRef = useRef(crypto.randomUUID())
    const inputRef = useRef<HTMLInputElement>(null)
    const shouldShowLoadingMessage = loading && messages[0]?.role !== 'assistant'

    function focusComposer() {
        window.requestAnimationFrame(() => {
            inputRef.current?.focus()
        })
    }

    function clearPendingMessageTimeouts() {
        pendingMessageTimeoutsRef.current.forEach(clearTimeout)
        pendingMessageTimeoutsRef.current = []
    }

    function clearPendingSuggestionTimeouts() {
        pendingSuggestionTimeoutsRef.current.forEach(({ timeoutId, resolve }) => {
            clearTimeout(timeoutId)
            resolve()
        })
        pendingSuggestionTimeoutsRef.current = []
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
            clearPendingSuggestionTimeouts()
        }
    }, [])

    useEffect(() => {
        if (!usecase || !backendReady || loading) {
            return
        }

        focusComposer()
    }, [backendReady, loading, usecase])

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
            const assistantResponse = await getAssistantResponseWithFallback(
                conversation,
                model,
                usecase,
                conversationSessionIdRef.current,
            )

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
                    traceId: assistantResponse.trace_id,
                }))
            }

            if (hasFunctionCalls) {
                newAssistantMessages.push(createMessage({
                    role: 'assistant',
                    content: assistantResponse.function_calls.map(call => `<code>${call}</code>`).join(', '),
                    isFunctionCall: true,
                    traceId: assistantResponse.trace_id,
                }))
            }

            if (assistantResponse.parse) {
                newAssistantMessages.push(createMessage({
                    role: 'assistant',
                    content: assistantResponse.parse,
                    traceId: assistantResponse.trace_id,
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

    async function replaceHeartSuggestion(
        selectedSuggestion: FollowUpSuggestion,
        conversation: ChatMessage[],
        sessionId: string,
    ) {
        const remainingSuggestions = heartDemoMessages.filter(
            (suggestion) => suggestion.id !== selectedSuggestion.id
        )
        const remainingSuggestionTexts = remainingSuggestions.map((suggestion) => suggestion.text)

        setHeartDemoMessages((prevMessages) =>
            prevMessages.map((suggestion) =>
                suggestion.id === selectedSuggestion.id
                    ? { ...suggestion, animationState: 'exiting' }
                    : suggestion
            )
        )

        const removeSuggestionPromise = new Promise<void>((resolve) => {
            const timeoutId = setTimeout(() => {
                setHeartDemoMessages((prevMessages) =>
                    prevMessages.filter((suggestion) => suggestion.id !== selectedSuggestion.id)
                )
                pendingSuggestionTimeoutsRef.current = pendingSuggestionTimeoutsRef.current.filter(
                    (pendingTimeout) => pendingTimeout.timeoutId !== timeoutId
                )
                resolve()
            }, SUGGESTION_TRANSITION_MS)

            pendingSuggestionTimeoutsRef.current.push({ timeoutId, resolve })
        })

        const replacementPromise = getSuggestedFollowUps(
            conversation,
            UsecaseType.Heart,
            sessionId,
            {
                limit: NEW_HEART_SUGGESTION_COUNT,
                excludeSuggestions: [...remainingSuggestionTexts, selectedSuggestion.text],
            },
        )

        const [replacementSuggestions] = await Promise.all([
            replacementPromise,
            removeSuggestionPromise,
        ])

        if (!replacementSuggestions?.length || conversationSessionIdRef.current !== sessionId) {
            return
        }

        const visibleSuggestionTexts = new Set(
            remainingSuggestionTexts.map((suggestion) => suggestion.toLowerCase())
        )
        const newSuggestions = replacementSuggestions.filter((suggestion) => {
            const normalizedSuggestion = suggestion.toLowerCase()

            if (visibleSuggestionTexts.has(normalizedSuggestion)) {
                return false
            }

            visibleSuggestionTexts.add(normalizedSuggestion)
            return true
        })

        if (!newSuggestions.length) {
            return
        }

        const overflowCount = Math.max(
            0,
            remainingSuggestions.length + newSuggestions.length - MAX_HEART_SUGGESTIONS
        )

        if (overflowCount > 0) {
            const suggestionIdsToRemove = remainingSuggestions
                .slice(0, overflowCount)
                .map((suggestion) => suggestion.id)

            setHeartDemoMessages((prevMessages) =>
                prevMessages.map((suggestion) =>
                    suggestionIdsToRemove.includes(suggestion.id)
                        ? { ...suggestion, animationState: 'fading' }
                        : suggestion
                )
            )

            await new Promise<void>((resolve) => {
                const timeoutId = setTimeout(() => {
                    setHeartDemoMessages((prevMessages) =>
                        prevMessages.filter((suggestion) => !suggestionIdsToRemove.includes(suggestion.id))
                    )
                    pendingSuggestionTimeoutsRef.current = pendingSuggestionTimeoutsRef.current.filter(
                        (pendingTimeout) => pendingTimeout.timeoutId !== timeoutId
                    )
                    resolve()
                }, SUGGESTION_TRANSITION_MS)

                pendingSuggestionTimeoutsRef.current.push({ timeoutId, resolve })
            })

            if (conversationSessionIdRef.current !== sessionId) {
                return
            }
        }

        setHeartDemoMessages((prevMessages) => [
            ...prevMessages,
            ...newSuggestions.map((suggestion) => createFollowUpSuggestion(suggestion, 'entering')),
        ])
    }

    function submitUserMessage(
        userMessage: string,
        selectedSuggestion?: FollowUpSuggestion,
    ) {
        if (userMessage === '') {
            return
        }

        clearPendingMessageTimeouts()

        const nextUserMessage = createMessage({ role: 'user', content: userMessage })
        const conversation = [...messages].toReversed()
        conversation.push(nextUserMessage)

        setMessages((prevMessages) => [nextUserMessage, ...prevMessages])
        setLoading(true)

        if (usecase === UsecaseType.Heart && selectedSuggestion) {
            void replaceHeartSuggestion(
                selectedSuggestion,
                conversation,
                conversationSessionIdRef.current,
            )
        }
    }

    function addUserMessage(formData: FormData) {
        const userMessage = formData.get('userMessage')?.toString().trim() ?? ''
        submitUserMessage(userMessage)
    }

    function resetConversation() {
        clearPendingMessageTimeouts()
        clearPendingSuggestionTimeouts()
        processedUserMessageIdRef.current = null
        conversationSessionIdRef.current = crypto.randomUUID()
        setMessages([welcomeMessage])
        setLoading(false)
        focusComposer()

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
        const selectedSuggestionId = event.currentTarget.dataset.suggestionId

        if (usecase === UsecaseType.Heart && selectedSuggestionId) {
            const selectedSuggestion = heartDemoMessages.find((suggestion) => suggestion.id === selectedSuggestionId)

            if (selectedSuggestion) {
                submitUserMessage(selectedSuggestion.text, selectedSuggestion)
                return
            }
        }

        submitUserMessage(event.currentTarget.innerText)
    }

    function handleLogout() {
        logout()
    }

    function getDemoMessages() {
        if (usecase === UsecaseType.Energy) {
            return demoMessagesEnergy
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
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.GeminiFlashLite31Preview}</a>
                                <a className={styles['toolbar-button']} onClick={onSelectModel}>{ModelType.Gpt54Mini}</a>
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
                    {shouldShowLoadingMessage ? loadingMessage : null}
                    {formatMessages(messages)}
                </div>
                <form action={addUserMessage} className={styles['chat-footer']}>
                    <input
                        ref={inputRef}
                        name='userMessage'
                        className={styles['chat-input']}
                        placeholder="Type your message here..."
                        autoFocus
                        disabled={loading}
                    ></input>
                    <button className={styles['chat-button']} disabled={loading}>Send</button>
                </form>
            </div>
            <div className={showSidebar ? styles['demo-container'] : styles['hidden']}>
                <h2>Suggested prompts</h2>
                <p>You can try these questions to explore the data and predictions:</p>
                <ul className={styles['suggestions-list']}>
                    {usecase === UsecaseType.Heart ? heartDemoMessages.map((message) => (
                        <li
                            key={message.id}
                            className={classNames(
                                styles['suggestion-item'],
                                message.animationState === 'entering' ? styles['suggestion-item-entering'] : null,
                                message.animationState === 'exiting' ? styles['suggestion-item-exiting'] : null,
                                message.animationState === 'fading' ? styles['suggestion-item-fading'] : null,
                            )}
                        >
                            <button
                                className={classNames(styles['demo-button'])}
                                onClick={handleDemoButtonClick}
                                disabled={loading || message.animationState === 'exiting'}
                                data-suggestion-id={message.id}
                            >
                                {message.text}
                            </button>
                        </li>
                    )) : getDemoMessages().map((message, index) => (
                        <li key={index}>
                            <button className={classNames(styles['demo-button'])} onClick={handleDemoButtonClick} disabled={loading}>{message}</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
