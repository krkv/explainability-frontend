'use client'

import { useState } from 'react'
import Image from 'next/image'
import classNames from 'classnames'
import { sansation } from '@/fonts/sansation'
import assistantIcon from '@/assets/claire-b.png'
import { validateDemoAccess as validateDemoAccessAction } from '@/actions/auth'
import styles from '@/styles/login.module.css'

interface DemoAccessPageProps {
    initialAccessCode?: string
    initialError?: string | null
}

export default function DemoAccessPage({
    initialAccessCode = '',
    initialError = null,
}: DemoAccessPageProps) {
    const [accessCode, setAccessCode] = useState(initialAccessCode)
    const [errors, setErrors] = useState<{ accessCode?: string, general?: string }>(
        initialError ? { general: initialError } : {}
    )
    const [isLoading, setIsLoading] = useState(false)

    const validateForm = () => {
        const newErrors: { accessCode?: string, general?: string } = {}

        if (!accessCode.trim()) {
            newErrors.accessCode = 'Access code is required'
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
            formData.append('accessCode', accessCode)

            await validateDemoAccessAction(formData)
        } catch {
            setErrors({ general: 'Invalid access code. Please check your code and try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={styles['page-container']}>
            <Image src={assistantIcon} alt="Assistant icon" width={64} height={64} />
            <h1 className={classNames(styles['page-title'], sansation.className)}>
                Explainability Assistant
            </h1>

            <form onSubmit={handleSubmit} className={styles['form-container']}>
                {errors.general && <div className={styles['error-message']}>{errors.general}</div>}

                <p className={styles['page-subtitle']}>
                    Enter your access code to open the chat
                </p>

                <div className={styles['form-group']}>
                    <input
                        name='accessCode'
                        type='text'
                        className={classNames(styles['access-input'], {
                            [styles['input-error']]: errors.accessCode,
                        })}
                        placeholder='Your access code'
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        disabled={isLoading}
                    />
                    {errors.accessCode && (
                        <span className={styles['field-error']}>{errors.accessCode}</span>
                    )}
                </div>

                <button type='submit' className={styles['access-button']} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Enter'}
                </button>

                <p className={styles['info-message']}>
                    To request an access code, please write to{' '}
                    <a href='mailto:access@explainabilityassistant.com'>
                        access@explainabilityassistant.com
                    </a>
                    .
                </p>
            </form>
        </div>
    )
}
