import { Suspense } from 'react'
import { Sansation } from 'next/font/google'
import classNames from 'classnames'
import styles from '@/styles/home.module.css'
import Navbar from '@/components/navbar'
import Video from '@/components/video'
import Footer from '@/components/footer'
import ContactForm from '@/components/contact'

const sansation = Sansation({
    subsets: ['latin'],
    weight: ['300', '400', '700']
})

export default function HomePage() {
    return (
        <div className={styles['page-container']}>
            <Navbar />
            
            {/* Hero Section */}
            <section className={styles['hero-section']}>
                <div className={styles['hero-content']}>
                    <h1 className={classNames(styles['hero-title'], sansation.className)}>
                        A trustworthy companion for your Machine Learning applications
                    </h1>
                    <p className={styles['hero-subtitle']}>
                        Explainability Assistant is a novel conversational AI agent that helps professionals explore
                        and interpret their data and Machine Learning predictions across healthcare, transportation, energy, and more.
                    </p>
                    <div className={styles['hero-actions']}>
                        <a href="#request-demo" className={styles['cta-primary']}>Request access</a>
                        <a href="/login" className={styles['cta-secondary']}>Sign in</a>
                    </div>
                </div>
            </section>

            {/* Demo Video Section */}
            <section className={styles['demo-section']} id="demo">
                <div className={styles['demo-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>See it in action</h2>
                    <Suspense fallback={<div className={styles['video-loading']}>Loading video...</div>}>
                        <Video fileName="https://github.com/krkv/explainability-frontend/raw/refs/heads/main/public/demo/video.mp4" />
                    </Suspense>
                </div>
            </section>

            {/* Process Section */}
            <section className={styles['process-section']} id="how-it-works">
                <div className={styles['process-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>How it works</h2>
                    <div className={styles['process-steps']}>
                        <div className={styles['process-step']}>
                            <div className={styles['step-number']}>1</div>
                            <div className={styles['step-content']}>
                                <div className={styles['step-icon']}>📊</div>
                                <h3 className={classNames(styles['step-title'], sansation.className)}>Integrate your data</h3>
                                <p className={styles['step-description']}>
                                    Start by adding your tabular dataset in CSV format and your trained Machine Learning model 
                                    (e.g., scikit-learn model saved as a pickle file). The system will automatically 
                                    analyze and prepare your data for exploration and explanation.
                                </p>
                            </div>
                        </div>
                        
                        <div className={styles['process-step']}>
                            <div className={styles['step-number']}>2</div>
                            <div className={styles['step-content']}>
                                <div className={styles['step-icon']}>🤖</div>
                                <h3 className={classNames(styles['step-title'], sansation.className)}>Select your AI model</h3>
                                <p className={styles['step-description']}>
                                    Choose from multiple Large Language Model providers including Google, OpenAI, 
                                    or Hugging Face. You can switch between different models at any time to find 
                                    the one that best understands your domain.
                                </p>
                            </div>
                        </div>
                        
                        <div className={styles['process-step']}>
                            <div className={styles['step-number']}>3</div>
                            <div className={styles['step-content']}>
                                <div className={styles['step-icon']}>💬</div>
                                <h3 className={classNames(styles['step-title'], sansation.className)}>Start exploring</h3>
                                <p className={styles['step-description']}>
                                    Begin a conversation with the AI assistant to explore your data and model predictions. 
                                    Ask questions about specific features, individual predictions, or request explanations 
                                    for how your model makes decisions.
                                </p>
                            </div>
                        </div>
                        
                        <div className={styles['process-step']}>
                            <div className={styles['step-number']}>4</div>
                            <div className={styles['step-content']}>
                                <div className={styles['step-icon']}>🔒</div>
                                <h3 className={classNames(styles['step-title'], sansation.className)}>Deploy securely</h3>
                                <p className={styles['step-description']}>
                                    Deploy the solution to your preferred environment or run it locally on your infrastructure. 
                                    Your sensitive data remains completely private with full control over all AI providers 
                                    and no external data transmission.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles['cta-section']} id="request-demo">
                <div className={styles['cta-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>Ready to get started?</h2>
                    <p className={styles['cta-description']}>
                        Are you interested in seeing how Explainability Assistant can help your organization?
                        Get in touch with our team and we'll schedule a free demo session. We'll help you analyze 
                        your use case and show you how to integrate Explainability Assistant into your workflow.
                    </p>
                    <ContactForm />
                </div>
            </section>

            <Footer />
        </div>
    )
}