'use server'

const backendHost = process.env.BACKEND_HOST
const backendPort = process.env.BACKEND_PORT

export async function getAssistantResponse(userMessage: string) {
    const endpoint = 'getAssistantResponse'

    try {
        const response = await fetch(`${backendHost}:${backendPort}/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userInput: userMessage })
        })

        if (!response.ok) {
            return "Well, this is confusing. Please, try again later."
        }

        const json = await response.json();

        return json.assistantResponse
    } catch (error) {
        console.error(error.message);
        return "Can't connect to the assistant."
    }
}