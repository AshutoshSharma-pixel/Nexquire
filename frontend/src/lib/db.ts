import { db } from './firebase'
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'

// Save user profile
export const saveUserProfile = async (userId: string, data: any) => {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    updated_at: Timestamp.now()
  }, { merge: true })
}

// Get user profile
export const getUserProfile = async (userId: string) => {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? snap.data() : null
}

// Save portfolio holding
export const addHolding = async (userId: string, holding: any) => {
  await addDoc(collection(db, 'users', userId, 'portfolio'), {
    ...holding,
    created_at: Timestamp.now()
  })
}

// Get portfolio
export const getPortfolio = async (userId: string) => {
  const snap = await getDocs(collection(db, 'users', userId, 'portfolio'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Save alert
export const saveAlert = async (userId: string, alert: any) => {
  await addDoc(collection(db, 'users', userId, 'alerts'), {
    ...alert,
    created_at: Timestamp.now(),
    is_read: false
  })
}

// Get alerts
export const getAlerts = async (userId: string) => {
  const q = query(
    collection(db, 'users', userId, 'alerts'),
    orderBy('created_at', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
