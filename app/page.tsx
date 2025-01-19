import styles from './styles.module.css'
import AccessForm from './access'

export default function Page() {
    return (
        <div className={styles.container}>
            <AccessForm />
        </div>
    )
}