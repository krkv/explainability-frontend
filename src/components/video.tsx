import styles from '@/styles/video.module.css'

export default function Video({ fileName }) {
    return (
        <div className={styles['video-section']}>
            <div className={styles['video-container']}>
                <video controls preload="none" aria-label="Video player" poster='demo/poster.png'>
                    <source src="/demo/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}