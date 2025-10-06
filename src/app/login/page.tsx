import { Sansation } from 'next/font/google'
import classNames from 'classnames'
import styles from '@/styles/login.module.css'
import { validateForm } from '@/actions/auth'
import Image from 'next/image'
import assistantIcon from '@/assets/claire-b.png'

const sansation = Sansation({
    subsets: ['latin'],
    weight: ['300', '400', '700']
})

function AccessForm() {
    return (
        <form action={validateForm} className={styles['form-container']}>
            <input name='email' type='email' className={styles['access-input']} placeholder='Your email'></input>
            <input name='password' type='password' className={styles['access-input']} placeholder='Your password'></input>
            <button className={styles['access-button']}>Access Demo</button>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className={styles['page-container']}>
            <Image src={assistantIcon} alt="Assistant icon" width={64} height={64} />
            <h1 className={classNames(styles['page-title'], sansation.className)}>Explainability Assistant</h1>
            <AccessForm />
        </div>
    )
}