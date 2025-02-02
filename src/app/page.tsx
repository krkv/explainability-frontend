import homeStyles from '@/styles/home.module.css'
import Link from 'next/link'

export default function HomePage() {
    return (
        <div className={homeStyles.container}>
            <Link href="/chat">Chat</Link>
        </div>
    )
}