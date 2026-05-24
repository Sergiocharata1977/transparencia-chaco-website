import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { getFirebaseDb } from "@/lib/firebase/config"
import type { ReporteCiudadano, ReporteEstado, NivelVerificacion } from "@/types/reportes"

// Obtener reportes pendientes (estadoInterno: "recibido" o "en-revision")
export async function getReportesPendientes(): Promise<ReporteCiudadano[]> {
  const db = getFirebaseDb()
  if (!db) return []
  try {
    const snapshot = await getDocs(
      query(
        collection(db, "reportes_ciudadanos"),
        where("estadoInterno", "in", ["recibido", "en-revision"]),
        orderBy("createdAt", "asc"),
        limit(50),
      ),
    )
    return snapshot.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        }) as ReporteCiudadano,
    )
  } catch (e) {
    console.error("Error cargando reportes pendientes:", e)
    return []
  }
}

// Actualizar estado de un reporte
export async function actualizarReporte(
  id: string,
  campos: {
    estadoInterno: ReporteEstado
    nivelVerificacion: NivelVerificacion
    visibilidadPublica: boolean
    observacionInterna?: string
  },
): Promise<void> {
  const db = getFirebaseDb()
  if (!db) throw new Error("Firebase no configurado")
  await updateDoc(doc(db, "reportes_ciudadanos", id), {
    ...campos,
    updatedAt: serverTimestamp(),
  })
}
