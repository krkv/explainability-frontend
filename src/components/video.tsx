import { list } from '@vercel/blob'
import styles from '@/styles/video.module.css'

export default async function Video({ fileName }) {
    const { blobs } = await list({
        prefix: fileName,
        limit: 1,
    })
    const { url } = blobs[0]

    return (
        <div className={styles['video-section']}>
            <div className={styles['video-container']}>
                <video controls preload="none" aria-label="Video player" poster='images/video-poster.png'>
                    <source src={url} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}