'use client'

import { LangfuseWeb } from 'langfuse'

let langfuseClient: LangfuseWeb | null | undefined

function getLangfuseBaseUrl() {
    return process.env.NEXT_PUBLIC_LANGFUSE_HOST ?? process.env.NEXT_PUBLIC_LANGFUSE_BASE_URL
}

export function isLangfuseFeedbackEnabled() {
    return Boolean(process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY && getLangfuseBaseUrl())
}

export function getLangfuseClient() {
    if (langfuseClient !== undefined) {
        return langfuseClient
    }

    const publicKey = process.env.NEXT_PUBLIC_LANGFUSE_PUBLIC_KEY
    const baseUrl = getLangfuseBaseUrl()

    if (!publicKey || !baseUrl) {
        langfuseClient = null
        return langfuseClient
    }

    langfuseClient = new LangfuseWeb({
        publicKey,
        baseUrl,
    })

    return langfuseClient
}
