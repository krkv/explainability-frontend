'use server'

import { ChatMessage } from "@/types/chat"
import { initializeApp } from "firebase/app"
import { getFirestore, doc, collection, setDoc, serverTimestamp, updateDoc } from "firebase/firestore"

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

export async function getNewConversationId() {
    const docRef = doc(collection(db, "conversations"))
    await setDoc(docRef, {
        createdAt: serverTimestamp()
    })
    return docRef.id
}

export async function saveConversationToFirestore(messages: ChatMessage[], docRefId: string) {
    const docRef = doc(db, "conversations", docRefId)
    await updateDoc(docRef, {
        messages,
        updatedAt: serverTimestamp()
    })
}
