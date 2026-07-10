import { cert, getApp, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

function getAdminApp() {
  if (getApps().length > 0) return getApp()

  // .trim() es crítico: un salto de línea o espacio invisible al final del valor
  // en Vercel (típico al pegar credenciales) hace que verifyIdToken rechace el
  // claim "aud" del token (projectId "xxx\n" != "xxx") y devuelva 401 en todo el admin.
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim()
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").trim()

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Firebase Admin: variables de entorno FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY son requeridas")
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

export function getAdminDb() {
  return getFirestore(getAdminApp())
}

export function getAdminAuth() {
  return getAuth(getAdminApp())
}
