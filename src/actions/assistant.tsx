'use server'

import { ChatMessage, ModelType, UsecaseType } from "@/types/chat"

const backendHost = process.env.BACKEND_HOST
const backendPort = process.env.BACKEND_PORT

export async function getBackendReady() {
    const endpoint = 'ready'

    try {
        const timeout = new Promise(function (resolve, reject) {
            return setTimeout(function () {
                reject('Timeout');
            }, 2000);
        });

        const response = fetch(`${backendHost}:${backendPort}/${endpoint}`, {
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

export async function getAssistantResponse(conversation: ChatMessage[], model: ModelType, usecase: UsecaseType) {
    const endpoint = 'getAssistantResponse'

    try {
        const requestBody = {
            conversation: conversation,
            model: model,
            usecase: usecase
        }

        const response = await fetch(`${backendHost}:${backendPort}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
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