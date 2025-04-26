'use server'

import { ChatMessage, ModelType } from "@/types/chat"

const backendHost = process.env.BACKEND_HOST
const backendPort = process.env.BACKEND_PORT

export async function getAssistantResponse(conversation: ChatMessage[], model: ModelType) {
    const endpoint = 'getAssistantResponse'

    try {
        const requestBody = {
            conversation: conversation,
            model: model
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