import { Suspense } from 'react'
import { list } from '@vercel/blob'
import styles from '@/styles/home.module.css'
import Navbar from '@/components/navbar'

export default function HomePage() {
    return (
        <div className={styles['page-container']}>
            <Navbar />
            <h2 className={styles['hero']}>A trustworthy companion for your machine learning applications</h2>
            <Suspense fallback={<p>Loading video...</p>}>
                <VideoComponent fileName="Explainability_Assistant_Demo.mp4" />
            </Suspense>
        </div>
    )
}

async function VideoComponent({ fileName }) {
    const { blobs } = await list({
        prefix: fileName,
        limit: 1,
    })
    const { url } = blobs[0]

    return (
        <video width={768} height={432} controls preload="none" aria-label="Video player" poster='images/video-poster.png'>
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    )
}