import { auth } from './firebase'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const signInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider())

export const logOut = () => signOut(auth)

export const onAuthChange = (callback: any) =>
  onAuthStateChanged(auth, callback)
