"use client"

import Image from 'next/image'
import { Sansation } from 'next/font/google'
import styles from '@/styles/navbar.module.css'
import chatIcon from '@/assets/chat.png'
import classNames from 'classnames'
import { useState } from 'react'

const sansation = Sansation({
    subsets: ['latin'],
    weight: ['300', '400', '700']
})

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    return (
        <div className={styles['navbar-container']}>
            <nav className={styles['navbar']}>
                <div className={styles['nav-section']}>
                    <Image className={styles['logo']} src={chatIcon} alt="Logo" width={40} height={40} />
                    <a href="/" className={classNames(styles['header'], sansation.className)}>
                        Explainability Assistant
                    </a>
                </div>

                {/* Desktop Navigation */}
                <div className={styles['nav-links']}>
                    <a href="#demo" className={styles['nav-link']}>Demo</a>
                    <a href="#how-it-works" className={styles['nav-link']}>How it works</a>
                    <a href="#request-demo" className={styles['nav-link']}>Contact</a>
                    <a href="/login" className={classNames(styles['navbar-button'], styles['navbar-button-a'])}>Sign in</a>
                    <a href="#request-demo" className={styles['navbar-button']}>Request access</a>
                </div>

                {/* Mobile Menu Button */}
                <button 
                    className={styles['menu-toggle']}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span className={classNames(styles['hamburger'], { [styles['active']]: isMenuOpen })}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </nav>

            {/* Mobile Menu */}
            <div className={classNames(styles['mobile-menu'], { [styles['open']]: isMenuOpen })}>
                <div className={styles['mobile-menu-content']}>
                    <a href="#demo" className={styles['mobile-nav-link']} onClick={closeMenu}>
                        Demo
                    </a>
                    <a href="#how-it-works" className={styles['mobile-nav-link']} onClick={closeMenu}>
                        How it works
                    </a>
                    <a href="#request-demo" className={styles['mobile-nav-link']} onClick={closeMenu}>
                        Contact
                    </a>
                    <div className={styles['mobile-buttons']}>
                        <a href="/login" className={classNames(styles['mobile-button'], styles['mobile-button-primary'])} onClick={closeMenu}>
                            Sign in
                        </a>
                        <a href="#request-demo" className={classNames(styles['mobile-button'], styles['mobile-button-secondary'])} onClick={closeMenu}>
                            Request access
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}