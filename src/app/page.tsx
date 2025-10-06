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
                        Make your ML models explainable with conversational AI
                    </h1>
                    <p className={styles['hero-subtitle']}>
                        Stop struggling with black-box ML models. Our AI assistant helps you understand, explain, and trust your machine learning predictions through natural conversation. 
                        <strong> No coding required.</strong>
                    </p>
                    <div className={styles['hero-actions']}>
                        <a href="#contact" className={styles['cta-primary']}>Request access</a>
                        <a href="#presentation" className={styles['cta-secondary']}>Watch presentation</a>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className={styles['benefits-section']} id="benefits">
                <div className={styles['benefits-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>Why choose Explainability Assistant?</h2>
                    <div className={styles['benefits-grid']}>
                        <div className={styles['benefit-card']}>
                            <div className={styles['benefit-icon']}>💬</div>
                            <h3 className={classNames(styles['benefit-title'], sansation.className)}>Natural Conversation</h3>
                            <p className={styles['benefit-description']}>
                                Ask questions in plain English or other languages. No need to learn complex APIs or write code to understand your models.
                            </p>
                        </div>
                        <div className={styles['benefit-card']}>
                            <div className={styles['benefit-icon']}>🔍</div>
                            <h3 className={classNames(styles['benefit-title'], sansation.className)}>Deep Insights</h3>
                            <p className={styles['benefit-description']}>
                                Get feature importance, counterfactual explanations, and what-if scenarios to understand model behavior.
                            </p>
                        </div>
                        <div className={styles['benefit-card']}>
                            <div className={styles['benefit-icon']}>🛡️</div>
                            <h3 className={classNames(styles['benefit-title'], sansation.className)}>Enterprise Ready</h3>
                            <p className={styles['benefit-description']}>
                                Deploy on-premises or in your cloud. Your data never leaves your infrastructure. You are in control of all AI providers and your data.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section className={styles['usecases-section']} id="usecases">
                <div className={styles['usecases-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>Example use cases</h2>
                    <div className={styles['usecases-grid']}>
                        <div className={styles['usecase-card']}>
                            <div className={styles['usecase-icon']}>🏥</div>
                            <h3 className={classNames(styles['usecase-title'], sansation.className)}>Healthcare</h3>
                            <p className={styles['usecase-description']}>
                                Explain medical diagnosis predictions, understand risk factors, and ensure regulatory compliance.
                            </p>
                            <div className={styles['usecase-example']}>
                                <strong>Example:</strong> &ldquo;Why did the model predict high risk for patient ID 123?&rdquo;
                            </div>
                        </div>
                        <div className={styles['usecase-card']}>
                            <div className={styles['usecase-icon']}>⚡</div>
                            <h3 className={classNames(styles['usecase-title'], sansation.className)}>Energy</h3>
                            <p className={styles['usecase-description']}>
                                Optimize energy consumption predictions, identify key factors, and improve efficiency.
                            </p>
                            <div className={styles['usecase-example']}>
                                <strong>Example:</strong> &ldquo;What would happen if outdoor temperature increased by 5°C?&rdquo;
                            </div>
                        </div>
                        <div className={styles['usecase-card']}>
                            <div className={styles['usecase-icon']}>🚗</div>
                            <h3 className={classNames(styles['usecase-title'], sansation.className)}>Transportation</h3>
                            <p className={styles['usecase-description']}>
                                Understand traffic predictions, optimize routes, and improve safety models.
                            </p>
                            <div className={styles['usecase-example']}>
                                <strong>Example:</strong> &ldquo;Show me the most important features for delay prediction.&rdquo;
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Video Section */}
            <section className={styles['demo-section']} id="presentation">
                <div className={styles['demo-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>See it in action</h2>
                    <p className={styles['demo-subtitle']}>
                        Watch how Claire, our AI assistant, helps you understand your ML models through natural conversation.
                    </p>
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

            {/* FAQ Section */}
            <section className={styles['faq-section']} id="faq">
                <div className={styles['faq-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>Frequently Asked Questions</h2>
                    <div className={styles['faq-grid']}>
                        <div className={styles['faq-item']}>
                            <h3 className={classNames(styles['faq-question'], sansation.className)}>What data formats are supported?</h3>
                            <p className={styles['faq-answer']}>
                                Generally, any tabular data format is supported. You need to provide a CSV file and a pickle file for the Machine Learning model.
                            </p>
                        </div>
                        <div className={styles['faq-item']}>
                            <h3 className={classNames(styles['faq-question'], sansation.className)}>Is my data secure?</h3>
                            <p className={styles['faq-answer']}>
                                Absolutely. You can deploy on-premises or in your private cloud. Your data never leaves your infrastructure and you are in control.
                            </p>
                        </div>
                        <div className={styles['faq-item']}>
                            <h3 className={classNames(styles['faq-question'], sansation.className)}>Do I need coding skills?</h3>
                            <p className={styles['faq-answer']}>
                                No! Our conversational interface lets you explore your models using natural language. No coding required, but you can also integrate over API.
                            </p>
                        </div>
                        <div className={styles['faq-item']}>
                            <h3 className={classNames(styles['faq-question'], sansation.className)}>Which LLM models are supported?</h3>
                            <p className={styles['faq-answer']}>
                                We support OpenAI, Google, and Hugging Face providers with models like Gemini, Llama, GPT, and more. You can switch between models anytime.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles['cta-section']} id="contact">
                <div className={styles['cta-content']}>
                    <h2 className={classNames(styles['section-title'], sansation.className)}>Ready to make your ML models explainable?</h2>
                    <p className={styles['cta-description']}>
                        Join researchers and practitioners who are already using Explainability Assistant to build trust in their ML models. 
                        You can get access to an interactive demo or request a consultation to see how it can help your organization.
            </p>
            <ContactForm />
                </div>
            </section>

            <Footer />
        </div>
    )
}