'use server'

import { ChatMessage } from "@/types/chat"
import { initializeApp } from "firebase/app"
import { getFirestore, doc, collection, setDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import { getSession } from '@/lib/session'
import { getDemoAccessCodeForUserId } from '@/lib/demo-access'

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
    const session = await getSession()
    const finalUserId = userId !== undefined ? userId : session?.userId ?? null
    const accessCode = session?.mode === 'demo' && session.userId
        ? getDemoAccessCodeForUserId(session.userId)
        : null

    if (!docRefId) {
        const docRef = doc(collection(db, "conversations"))
        await setDoc(docRef, {
            createdAt: serverTimestamp(),
            userId: finalUserId,
            accessCode,
            messages
        })
        return docRef.id
    } else {
        const docRef = doc(db, "conversations", docRefId)
        await updateDoc(docRef, {
            accessCode,
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
