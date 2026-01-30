import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAITBXe2PJUDYcjqynN9DHCnjm5Fi-vfFI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "emir-tuning-b551a.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "emir-tuning-b551a",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "emir-tuning-b551a.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "680881901552",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:680881901552:web:84c6c9a09e4aed09145735",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BED16E7GG7",
}

// Initialize Firebase
let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

// Initialize Firebase (works on both client and server)
if (!getApps().length) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Only initialize auth on client side
if (typeof window !== 'undefined') {
  auth = getAuth(app)
}

// Initialize Firestore (works on both client and server)
db = getFirestore(app)

export { db, auth }

// Helper function to get db safely
export function getDb(): Firestore {
  if (!db) {
    if (!app) {
      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    }
    db = getFirestore(app)
  }
  return db
}

// Helper function to get auth safely
export function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be used on the client side')
  }
  if (!auth) {
    if (!app) {
      app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    }
    auth = getAuth(app)
  }
  return auth
}
