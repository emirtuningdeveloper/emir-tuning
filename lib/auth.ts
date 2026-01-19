import { 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged 
} from 'firebase/auth'
import { getAuthInstance } from './firebase'

// Admin email listesi (production'da Firestore'dan çekilebilir)
const ADMIN_EMAILS = [
  'abdrhmn.ozden44@gmail.com',
  // Buraya admin email'lerini ekleyebilirsiniz
]

export async function loginAdmin(email: string, password: string) {
  try {
    const auth = getAuthInstance()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    // Admin kontrolü
    if (!ADMIN_EMAILS.includes(userCredential.user.email || '')) {
      await signOut(auth)
      throw new Error('Bu email adresi admin yetkisine sahip değil')
    }
    
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message || 'Giriş yapılamadı')
  }
}

export async function logoutAdmin() {
  try {
    const auth = getAuthInstance()
    await signOut(auth)
  } catch (error: any) {
    throw new Error(error.message || 'Çıkış yapılamadı')
  }
}

export function getCurrentUser(): User | null {
  try {
    const auth = getAuthInstance()
    return auth.currentUser
  } catch {
    return null
  }
}

export function isAdmin(user: User | null): boolean {
  if (!user || !user.email) return false
  return ADMIN_EMAILS.includes(user.email)
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getAuthInstance()
  return onAuthStateChanged(auth, callback)
}
