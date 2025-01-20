import '@/styles/global.css'
import { Noto_Sans } from 'next/font/google'

const font = Noto_Sans({
    subsets: ['latin'],
})

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