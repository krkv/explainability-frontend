export interface ChatMessage {
    role: "user" | "assistant"
    content: string
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