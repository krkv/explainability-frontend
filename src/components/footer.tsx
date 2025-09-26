import Image from 'next/image'
import styles from '@/styles/footer.module.css'
import utlogo from '@/assets/ut-logo.png'
import trustailogo from '@/assets/trust-ai-logo.png'

export default function Footer() {
    return (
        <>
            <div className={styles['logo-row']}>
                <div className={styles['logo-text']}>Explainability Assistant is a research project developed by the&nbsp;University&nbsp;of&nbsp;Tartu and Trust&nbsp;AI.</div>
                <div className={styles['logos']}>
                    <a href="https://ut.ee" title="University of Tartu" target="_blank" rel="noopener noreferrer">
                        <Image width={400} height={54} src={utlogo} alt="UT Logo" />
                    </a>
                    <a href="https://trustai.eu" title="Trust AI" target="_blank" rel="noopener noreferrer">
                        <Image width={200} height={54} src={trustailogo} alt="Trust AI Logo" />
                    </a>
                </div>
            </div>
            <footer className={styles['footer']}>
                <p className={styles['footer-text']}>This project was supported by the European Union&apos;s Horizon 2020 research and innovation programme under grant agreement No 952060 (Trust AI)</p>
            </footer>
        </>
    )
}