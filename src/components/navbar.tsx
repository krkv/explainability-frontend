import Image from 'next/image'
import styles from '@/styles/navbar.module.css'
import chatIcon from '@/assets/chat.png'
import classNames from 'classnames'

export default function Navbar() {
    return (
        <nav className={styles['navbar']}>
            <div className={styles['nav-section']}>
                <Image className={styles['logo']} src={chatIcon} alt="Logo" width={40} height={40} />
                <h2 className={styles['header']}>Explainability Assistant</h2>
            </div>

            <div className={styles['nav-section']}>
                <a href="/login" className={classNames(styles['navbar-button'], styles['navbar-button-a'])}>Sign in</a>
                <a href="mailto:demo@explainabilityassistant.com" className={styles['navbar-button']}>Request a demo</a>
            </div>
        </nav>
    )
}