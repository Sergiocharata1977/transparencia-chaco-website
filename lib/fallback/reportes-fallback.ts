// Sin datos hardcodeados: reportes, accidentes y reclamos de salud se cargan desde
// Firestore. Estos arrays vacios evitan mostrar contenido inventado en el sitio
// publico mientras las colecciones no tengan datos reales.
import type { ReporteAccidente, ReporteCiudadano, ReporteSalud } from "@/types/reportes"

export const fallbackReportes: ReporteCiudadano[] = []
export const fallbackAccidentes: ReporteAccidente[] = []
export const fallbackReportesSalud: ReporteSalud[] = []
