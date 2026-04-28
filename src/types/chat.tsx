export interface ChatMessage {
    id: string
    role: "user" | "assistant"
    content: string
    isFunctionCall?: boolean
    isThinking?: boolean
    traceId?: string
}

export interface AssistantResponse {
    freeform_response?: string
    function_calls: string[]
    parse?: string
    trace_id?: string
    suggested_follow_ups?: string[]
}

export interface SuggestedFollowUpsResponse {
    suggested_follow_ups?: string[]
}

export enum ModelType {
    GeminiFlashLite31Preview = 'gemini-3.1-flash-lite-preview',
    GeminiPro31Preview = 'gemini-3.1-pro-preview',
}

export enum UsecaseType {
    Energy = 'Energy Consumption',
    Heart = 'Heart Disease',
}

export function isUsecaseType(value: string): value is UsecaseType {
    return Object.values(UsecaseType).includes(value as UsecaseType)
}
