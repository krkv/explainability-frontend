import '@/styles/global.css'
import { Noto_Sans } from 'next/font/google'
import type { Metadata } from 'next'

const font = Noto_Sans({
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'Explainability Assistant',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={font.className}>
            <body>{children}</body>
        </html>
    )
}