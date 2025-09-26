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
            <h2 className={classNames(styles['hero'], sansation.className)}>A trustworthy companion for your Machine Learning applications</h2>
            <Suspense fallback={<p>Loading video...</p>}>
                <Video fileName="/demo/video.mp4" />
            </Suspense>
            <p className={styles['text']}>Explainability Assistant is a conversational AI agent that helps professionals to explore
                and interpret their data and Machine Learning predictions. It can be applied
                to use cases in different domains such as healthcare, transportation or energy.</p>
            <h2 className={classNames(styles['home-heading'], sansation.className)}>Bring your data</h2>
            <p className={styles['text']}>Explainability Assistant integrates with your dataset and Machine Learning model.
                Just provide your data in a tabular format (CSV) and a predictive model
                (e.g. a scikit-learn model in a pickle file).
            </p>
            <h2 className={classNames(styles['home-heading'], sansation.className)}>Choose your LLM</h2>
            <p className={styles['text']}>Explainability Assistant supports different Large Language Models and providers.
                Choose an integration that fits your needs: Google, OpenAI or Hugging Face. You can even switch between
                different LLMs and providers at any time in the chat.
            </p>
            <h2 className={classNames(styles['home-heading'], sansation.className)}>Explore the predictions</h2>
            <p className={styles['text']}>Use the chat interface to talk with the agent and explore your data and model predictions.
                You can ask questions about the data, features, individual predictions, and explore how these
                predictions could change to better understand your model.
            </p>
            <h2 className={classNames(styles['home-heading'], sansation.className)}>Control everything</h2>
            <p className={styles['text']}>You are in control of your data and model at all times. The Explainability Assistant
                can be deployed to your environment of choice, or be run locally on your machine. Your sensitive data is not sent
                to any external service and you have full control over the LLM provider you use.
            </p>
            <h2 className={classNames(styles['home-heading'], sansation.className)} id="request-demo">Request a demo</h2>
            <p className={styles['text']}>Are you interested in seeing how Explainability Assistant can help your organization?
                Get in touch with our team and we will schedule a free demo session for you. We will help you analyze your use case
                and show you how Explainability Assistant can be integrated into your workflow.
            </p>
            <ContactForm />
            <Footer />
        </div>
    )
}