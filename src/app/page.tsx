import styles from '@/styles/home.module.css'
import { validateForm } from '@/actions/auth'
import Image from 'next/image'
import assistantIcon from '@/assets/claire-b.png'

function AccessForm() {
    return (
        <form action={validateForm} className={styles['form-container']}>
            <input name='email' type='email' className={styles['access-input']} placeholder='Your email'></input>
            <input name='password' type='password' className={styles['access-input']} placeholder='Your password'></input>
            <button className={styles['access-button']}>Access</button>
        </form>
    )
}

export default function HomePage() {
    return (
        <div className={styles['page-container']}>
            <Image src={assistantIcon} alt="Assistant icon" width={64} height={64} />
            <h1>Claire</h1>
            <AccessForm />
        </div>
    )
}