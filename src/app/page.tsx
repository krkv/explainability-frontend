import { Suspense } from 'react'
import { Sansation } from 'next/font/google'
import Image from 'next/image'
import classNames from 'classnames'
import styles from '@/styles/home.module.css'
import Navbar from '@/components/navbar'
import Video from '@/components/video'
import Footer from '@/components/footer'
import utlogo from '@/assets/ut-logo.png'
import trustailogo from '@/assets/trust-ai-logo.png'

const sansation = Sansation({
    subsets: ['latin'],
    weight: ['300', '400', '700']
})

export default function HomePage() {
    return (
        <div className={styles['page-container']}>
            <Navbar />
            <h2 className={classNames(styles['hero'], sansation.className)}>A trustworthy companion for your machine learning applications</h2>
            <Suspense fallback={<p>Loading video...</p>}>
                <Video fileName="Explainability_Assistant_Demo.mp4" />
            </Suspense>
            <p className={styles['text']}>Explainability Assistant is a conversational interface designed
                to help professionals better understand Machine Learning models and their predictions. It can be applied
                to use cases in different domains such as healthcare, transportation or energy.</p>
            <div className={styles['logo-row']}>
                <Image width={400} height={54} src={utlogo} alt="UT Logo" />
                <Image width={200} height={54} src={trustailogo} alt="Trust-AI Logo" />
            </div>
            <Footer />
        </div>
    )
}