'use server'

import { ChatMessage } from "@/types/chat"

const backendHost = process.env.BACKEND_HOST
const backendPort = process.env.BACKEND_PORT

export async function getAssistantResponse(conversation: ChatMessage[]) {
    const endpoint = 'getAssistantResponse'

    try {
        const response = await fetch(`${backendHost}:${backendPort}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ conversation })
        })

        if (!response.ok) {
            return "Well, this is confusing. Please, try again later."
        }

        const json = await response.json();

        return json.assistantResponse
    } catch (error) {
        console.error(error.message);
        return "I'm having trouble connecting to the server. Please, try again later."
    }
}