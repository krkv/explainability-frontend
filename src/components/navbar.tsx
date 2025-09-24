import Image from 'next/image'
import { Sansation } from 'next/font/google'
import styles from '@/styles/navbar.module.css'
import chatIcon from '@/assets/chat.png'
import classNames from 'classnames'

const sansation = Sansation({
    subsets: ['latin'],
    weight: ['300', '400', '700']
})

export default function Navbar() {
    return (
        <div className={styles['navbar-container']}>
            <nav className={styles['navbar']}>
                <div className={styles['nav-section']}>
                    <Image className={styles['logo']} src={chatIcon} alt="Logo" width={40} height={40} />
                    <h2 className={classNames(styles['header'], sansation.className)}>Explainability Assistant</h2>
                </div>

                <div className={styles['nav-section']}>
                    <a href="/login" className={classNames(styles['navbar-button'], styles['navbar-button-a'])}>Sign in</a>
                    <a href="mailto:demo@explainabilityassistant.com" className={styles['navbar-button']}>Request a demo</a>
                </div>
            </nav>
        </div>
    )
}