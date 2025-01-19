import styles from './styles.module.css'
import { validateForm } from './actions/auth';

export default function AccessForm() {
    return (
        <form action={validateForm} className={styles['horizontal-container']}>
            <input name='token' className={styles['access-input']} placeholder='Your token'></input>
            <button className={styles['access-button']}>Access</button>
        </form>
    )
}