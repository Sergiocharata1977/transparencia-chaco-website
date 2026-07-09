// Sin datos hardcodeados: las obras se cargan desde Firestore (coleccion obras_publicas).
// Este array vacio evita mostrar contenido inventado cuando la coleccion aun no tiene datos.
import type { ObraPublica } from "@/types/obras"

export const fallbackObras: ObraPublica[] = []
