'use server'

import { ChatMessage } from "@/types/chat"
import { initializeApp } from "firebase/app"
import { getFirestore, doc, collection, setDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { cookies } from 'next/headers'

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

const db = getFirestore(app)

export async function handleSaveConversation(messages: ChatMessage[], docRefId: string | null, userId?: string | null) {
    if (!docRefId) {
        const docRef = doc(collection(db, "conversations"))
        // Use provided userId, or get from cookies if not provided
        const finalUserId = userId !== undefined ? userId : (await cookies()).get('userId')?.value
        await setDoc(docRef, {
            createdAt: serverTimestamp(),
            userId: finalUserId,
            messages
        })
        return docRef.id
    } else {
        const docRef = doc(db, "conversations", docRefId)
        await updateDoc(docRef, {
            messages,
            updatedAt: serverTimestamp()
        })
        return docRefId
    }
}

export async function handleUserLogin(email: string, password: string) {
    const auth = getAuth()
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user
        return user
    } catch (error) {
        const errorCode = error.code
        const errorMessage = error.message
        console.error("Error signing in:", errorCode, errorMessage)
        return null
    }
}