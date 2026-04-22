import { isUsecaseType, UsecaseType } from '@/types/chat'

export interface DemoAccessSessionData {
    userId: string
    usecase: UsecaseType
}

function normalizeUsecase(value: string) {
    const trimmedValue = value.trim()

    if (isUsecaseType(trimmedValue)) {
        return trimmedValue
    }

    const matchedUsecase = Object.entries(UsecaseType).find(([enumKey, enumValue]) => {
        return (
            enumKey.toLowerCase() === trimmedValue.toLowerCase() ||
            enumValue.toLowerCase() === trimmedValue.toLowerCase()
        )
    })

    return matchedUsecase?.[1] ?? null
}

function getDemoAccessConfig() {
    const demoAccessCodes = process.env.DEMO_ACCESS_CODES

    if (!demoAccessCodes) {
        return {}
    }

    try {
        const parsedConfig = JSON.parse(demoAccessCodes)
        if (!parsedConfig || typeof parsedConfig !== 'object' || Array.isArray(parsedConfig)) {
            return {}
        }

        return Object.fromEntries(
            Object.entries(parsedConfig).flatMap(([accessCode, usecase]) => {
                const normalizedAccessCode = accessCode.trim()

                if (!normalizedAccessCode || typeof usecase !== 'string') {
                    return []
                }

                const normalizedUsecase = normalizeUsecase(usecase)
                if (!normalizedUsecase) {
                    return []
                }

                return [[normalizedAccessCode, normalizedUsecase] as const]
            })
        ) as Record<string, UsecaseType>
    } catch (error) {
        console.error('Failed to parse DEMO_ACCESS_CODES', error)
        return {}
    }
}

export function resolveDemoAccessCode(accessCode: string): DemoAccessSessionData | null {
    const normalizedAccessCode = accessCode.trim()
    if (!normalizedAccessCode) {
        return null
    }

    const usecase = getDemoAccessConfig()[normalizedAccessCode]
    if (!usecase) {
        return null
    }

    return {
        userId: normalizedAccessCode,
        usecase,
    }
}
