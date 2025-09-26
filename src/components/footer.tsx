import styles from '@/styles/footer.module.css'

export default function Footer() {
    return (
        <footer className={styles['footer']}>
            <p className={styles['footer-text']}>This project was supported by the European Union&apos;s Horizon 2020 research and innovation programme under grant agreement No 952060 (Trust AI)</p>
        </footer>
    )
}