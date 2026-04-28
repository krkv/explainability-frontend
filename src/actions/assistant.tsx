'use server'

import { getSession } from '@/lib/session'
import { AssistantResponse, ChatMessage, ModelType, SuggestedFollowUpsResponse, UsecaseType } from "@/types/chat"

const backendHost = process.env.BACKEND_HOST
const backendPort = process.env.BACKEND_PORT
const BACKEND_READY_TIMEOUT_MS = 2_000

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

async function fetchWithTimeout(
    input: string,
    init: RequestInit,
    timeoutMs: number,
): Promise<globalThis.Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
        return await fetch(input, {
            ...init,
            signal: controller.signal,
        })
    } finally {
        clearTimeout(timeoutId)
    }
}

function isAbortError(error: unknown) {
    return error instanceof Error && error.name === 'AbortError'
}

function normalizeAssistantResponse(response: Partial<AssistantResponse> | null | undefined): AssistantResponse {
    return {
        freeform_response: response?.freeform_response,
        function_calls: Array.isArray(response?.function_calls) ? response.function_calls : [],
        parse: response?.parse,
        trace_id: response?.trace_id,
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

interface SuggestedFollowUpsOptions {
    limit?: number
    excludeSuggestions?: string[]
}

export async function getBackendReady() {
    const endpoint = 'ready'

    try {
        const response = await fetchWithTimeout(getBackendUrl(endpoint), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        }, BACKEND_READY_TIMEOUT_MS)

        if (response.ok) {
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
    const assistantResponseTimeoutMs = 30_000

    try {
        const requestBody = {
            conversation: conversation,
            model: model,
            usecase: usecase
        }

        const response = await fetchWithTimeout(getBackendUrl(endpoint), {
            method: "POST",
            headers: await getObservabilityHeaders(sessionId),
            body: JSON.stringify(requestBody)
        }, assistantResponseTimeoutMs)

        if (!response.ok) {
            throw new Error(`Backend request failed with status ${response.status}`)
        }

        const json = await response.json()

        return normalizeAssistantResponse(json.assistantResponse)
    } catch (error) {
        console.error(error instanceof Error ? error.message : error)
        if (isAbortError(error)) {
            throw new Error('Backend assistant request timed out')
        }
        throw error
    }
}

export async function getSuggestedFollowUps(
    conversation: ChatMessage[],
    usecase: UsecaseType,
    sessionId: string,
    options?: SuggestedFollowUpsOptions,
): Promise<string[] | undefined> {
    const endpoint = 'getSuggestedFollowUps'

    try {
        const response = await fetch(getBackendUrl(endpoint), {
            method: "POST",
            headers: await getObservabilityHeaders(sessionId),
            body: JSON.stringify({
                conversation,
                usecase,
                limit: options?.limit,
                exclude_suggestions: options?.excludeSuggestions,
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
