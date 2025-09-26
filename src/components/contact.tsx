"use client"

import { useForm, ValidationError } from "@formspree/react";
import styles from '@/styles/contact.module.css'

export default function ContactForm() {
    const [state, handleSubmit] = useForm(process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID);

    if (state.succeeded) {
        return <p className={styles['success-message']}>Thanks you for your message! We will get back to you shortly.</p>;
    }

    return (
        <form className={styles['contact-form']} onSubmit={handleSubmit}>
            <label htmlFor="name" hidden>Name</label>
            <input id="name" type="text" name="name" placeholder="Your name" />
            <ValidationError prefix="Name" field="name" errors={state.errors} />
            <label htmlFor="email" hidden>Email Address</label>
            <input id="email" type="email" name="email" required placeholder="Your email" />
            <ValidationError prefix="Email" field="email" errors={state.errors} />
            <label htmlFor="message" hidden>Message</label>
            <textarea id="message" name="message" required placeholder="Please describe your request here" />
            <ValidationError prefix="Message" field="message" errors={state.errors} />
            <button type="submit" disabled={state.submitting}>
                Submit
            </button>
            <ValidationError errors={state.errors} />
        </form>
    );
}
