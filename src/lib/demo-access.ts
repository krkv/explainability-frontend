import 'server-only'

import { createSession } from '@/lib/session'
import { resolveDemoAccessCode } from '@/lib/demo-access-config'

export async function createDemoSessionFromAccessCode(accessCode: string) {
    const demoAccess = resolveDemoAccessCode(accessCode)

    if (!demoAccess) {
        return null
    }

    await createSession({
        userId: demoAccess.userId,
        usecase: demoAccess.usecase,
        mode: 'demo',
    })

    return demoAccess
}
