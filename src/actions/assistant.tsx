'use server'

import { getSession } from '@/lib/session'
import { ChatMessage, ModelType, UsecaseType } from "@/types/chat"

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
) {
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
            return {
                "freeform_response": "I'm having trouble at the server &#128543; Please, try again later.",
                "function_calls": [],
            }
        }

        const json = await response.json();

        return json.assistantResponse
    } catch (error) {
        console.error(error.message);
        return {
            "freeform_response": "I'm having trouble connecting to the server &#128543; Please, try again later.",
            "function_calls": [],
        }
    }
}
