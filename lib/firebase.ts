import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCeIWQMuVfXI5CnBmBGqGGHbxKT80u24vM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "emir-tuning.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "emir-tuning",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "emir-tuning.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "991446420644",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:991446420644:web:64400054067aa2e77cea31",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-BVBNB6J4Z3",
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
