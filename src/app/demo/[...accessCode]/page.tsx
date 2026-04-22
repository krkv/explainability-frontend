import DemoAccessPage from '@/components/demo-access-page'

interface DemoAccessLinkPageProps {
    params: Promise<{ accessCode: string[] }>
}

export default async function DemoAccessLinkPage({ params }: DemoAccessLinkPageProps) {
    const { accessCode: accessCodeParts } = await params
    const accessCode = accessCodeParts.join('/')

    return (
        <DemoAccessPage
            initialAccessCode={accessCode}
            initialError='Invalid access code. Please check your code and try again.'
        />
    )
}
