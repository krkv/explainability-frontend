'use client'

import { Sansation } from 'next/font/google'
import classNames from 'classnames'
import styles from '@/styles/login.module.css'
import { validateForm as validateFormAction } from '@/actions/auth'
import Image from 'next/image'
import Link from 'next/link'
import assistantIcon from '@/assets/claire-b.png'
import { useState } from 'react'

const sansation = Sansation({
    subsets: ['latin'],
    weight: ['300', '400', '700']
})

function AccessForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState<{email?: string, password?: string, general?: string}>({})
    const [isLoading, setIsLoading] = useState(false)

    const validateForm = () => {
        const newErrors: {email?: string, password?: string, general?: string} = {}
        
        if (!email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        if (!password.trim()) {
            newErrors.password = 'Password is required'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true)
        setErrors({})
        
        try {
            const formData = new FormData()
            formData.append('email', email)
            formData.append('password', password)
            
            await validateFormAction(formData)
        } catch {
            setErrors({ general: 'Invalid credentials. Please check your email and password.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className={styles['form-container']}>
            {errors.general && (
                <div className={styles['error-message']}>
                    {errors.general}
                </div>
            )}
            
            <div className={styles['form-group']}>
                <input 
                    name='email' 
                    type='email' 
                    className={classNames(styles['access-input'], {
                        [styles['input-error']]: errors.email
                    })}
                    placeholder='Your email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
                {errors.email && (
                    <span className={styles['field-error']}>{errors.email}</span>
                )}
            </div>
            
            <div className={styles['form-group']}>
                <input 
                    name='password' 
                    type='password' 
                    className={classNames(styles['access-input'], {
                        [styles['input-error']]: errors.password
                    })}
                    placeholder='Your password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
                {errors.password && (
                    <span className={styles['field-error']}>{errors.password}</span>
                )}
            </div>
            
            <button 
                type="submit" 
                className={styles['access-button']}
                disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Access Demo'}
            </button>
            
            <Link href="/#contact" className={styles['request-access-button']}>Request Access</Link>
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