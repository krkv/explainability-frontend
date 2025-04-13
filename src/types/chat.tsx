export interface ChatMessage {
    role: "user" | "assistant"
    content: string
}

export enum ModelType {
    Llama = 'Llama 3.3 70B Instruct',
    Gemini = 'Gemini 2.0 Flash'
}
