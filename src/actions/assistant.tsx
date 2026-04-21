'use server'

import { getSession } from '@/lib/session'
import { AssistantResponse, ChatMessage, ModelType, SuggestedFollowUpsResponse, UsecaseType } from "@/types/chat"

const backendHost = process.env.BACKEND_HOST
const backendPort = process.env.BACKEND_PORT

function getBackendUrl(endpoint: string) {
    return `${backendHost}:${backendPort}/${endpoint}`
}

async function getObservabilityHeaders(sessionId: string) {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Session-ID": sessionId,
        "X-Request-ID": crypto.randomUUID(),
    }
    const session = await getSession()

    if (session?.userId && session.expiresAt >= new Date()) {
        headers["X-User-ID"] = session.userId
    }

    return headers
}

function createFallbackResponse(message: string): AssistantResponse {
    return {
        freeform_response: message,
        function_calls: [],
    }
}

function normalizeAssistantResponse(response: Partial<AssistantResponse> | null | undefined): AssistantResponse {
    return {
        freeform_response: response?.freeform_response,
        function_calls: Array.isArray(response?.function_calls) ? response.function_calls : [],
        parse: response?.parse,
        suggested_follow_ups: Array.isArray(response?.suggested_follow_ups)
            ? response.suggested_follow_ups.filter((suggestion): suggestion is string => typeof suggestion === 'string')
            : undefined,
    }
}

function normalizeSuggestedFollowUpsResponse(
    response: Partial<SuggestedFollowUpsResponse> | null | undefined
): SuggestedFollowUpsResponse {
    return {
        suggested_follow_ups: Array.isArray(response?.suggested_follow_ups)
            ? response.suggested_follow_ups.filter((suggestion): suggestion is string => typeof suggestion === 'string')
            : undefined,
    }
}

export async function getBackendReady() {
    const endpoint = 'ready'

    try {
        const timeout = new Promise(function (resolve, reject) {
            return setTimeout(function () {
                reject('Timeout');
            }, 2000);
        });

        const response = fetch(getBackendUrl(endpoint), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        })

        const res = await Promise.race([response, timeout]) as globalThis.Response

        if (res.ok) {
            return true
        } else {
            return false
        }
    } catch (e) {
        console.error(e)
        return false
    }
}

export async function getAssistantResponse(
    conversation: ChatMessage[],
    model: ModelType,
    usecase: UsecaseType,
    sessionId: string,
): Promise<AssistantResponse> {
    const endpoint = 'getAssistantResponse'

    try {
        const requestBody = {
            conversation: conversation,
            model: model,
            usecase: usecase
        }

        const response = await fetch(getBackendUrl(endpoint), {
            method: "POST",
            headers: await getObservabilityHeaders(sessionId),
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            return createFallbackResponse("I'm having trouble at the server &#128543; Please, try again later.")
        }

        const json = await response.json()

        return normalizeAssistantResponse(json.assistantResponse)
    } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        return createFallbackResponse("I'm having trouble connecting to the server &#128543; Please, try again later.")
    }
}

export async function getSuggestedFollowUps(
    conversation: ChatMessage[],
    usecase: UsecaseType,
    sessionId: string,
): Promise<string[] | undefined> {
    const endpoint = 'getSuggestedFollowUps'

    try {
        const response = await fetch(getBackendUrl(endpoint), {
            method: "POST",
            headers: await getObservabilityHeaders(sessionId),
            body: JSON.stringify({
                conversation,
                usecase,
            }),
        })

        if (!response.ok) {
            return undefined
        }

        const json = await response.json()
        return normalizeSuggestedFollowUpsResponse(json).suggested_follow_ups
    } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        return undefined
    }
}
