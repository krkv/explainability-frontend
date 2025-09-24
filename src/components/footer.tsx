import styles from '@/styles/footer.module.css'

export default function Footer() {
    return (
        <footer className={styles['footer']}>
            <p>&copy; {new Date().getFullYear()} Explainability Assistant. All rights reserved.</p>
        </footer>
    )
}