export interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    isFunctionCall?: boolean
    isThinking?: boolean
}

export interface AssistantResponse {
    freeform_response?: string
    function_calls: string[]
    parse?: string
    suggested_follow_ups?: string[]
}

export enum ModelType {
    Llama = 'Llama 3.3 70B Instruct',
    Gemini = 'Gemini 2.0 Flash',
    GeminiFlash25 = 'Gemini 2.5 Flash'
}

export enum UsecaseType {
    Energy = 'Energy Consumption',
    Heart = 'Heart Disease',
}

export function isUsecaseType(value: string): value is UsecaseType {
    return Object.values(UsecaseType).includes(value as UsecaseType)
}
