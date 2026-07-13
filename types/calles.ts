export type CalleEstadoSuperficie =
  | "asfaltada"
  | "no_asfaltada"
  | "ripio"
  | "tierra"
  | "adoquin"
  | "en_obra"
  | "sin_dato"

export type CalleEstadoObra =
  | "sin_obra"
  | "proyectada"
  | "anunciada"
  | "en_ejecucion"
  | "finalizada"
  | "paralizada"

export type CalleFuente =
  | "relevamiento_ciudadano"
  | "municipio"
  | "provincia"
  | "observatorio"
  | "imagen_satelital"

export type CalleSugerenciaSuperficie = "asfaltada" | "no_asfaltada" | "sin_dato"

export interface CalleCoordinate {
  lat: number
  lng: number
}

export interface CalleGeometry {
  type: "LineString"
  coordinates: [number, number][]
}

export interface CalleHistorialItem {
  anio: number
  estadoSuperficie: CalleEstadoSuperficie
  estadoObra?: CalleEstadoObra
  longitudMetros?: number
  cuadrasAsfaltadas?: number
  cuadrasTierra?: number
  fechaRelevamientoISO?: string
  fuente?: CalleFuente
  observaciones?: string
}

export interface CalleMunicipio {
  id: string
  ciudadSlug: string
  ciudadNombre: string
  departamento?: string
  provincia: string
  nombreCalle: string
  desde: string
  hasta: string
  barrio?: string
  orientacion?: string
  cuadras100?: number
  cuadras50?: number
  cuadrasAsfaltadas?: number
  cuadrasTierra?: number
  estadoSuperficie: CalleEstadoSuperficie
  estadoObra: CalleEstadoObra
  anioRelevamiento: number
  fechaRelevamientoISO?: string
  longitudMetros: number
  geometry?: CalleGeometry
  fuente: CalleFuente
  evidenciaUrl?: string
  fotoUrl?: string
  observaciones?: string
  obraPublicaId?: string
  obraNombre?: string
  sugerenciaSuperficie?: CalleSugerenciaSuperficie
  sugerenciaConfianza?: number
  sugerenciaFechaISO?: string
  sugerenciaDetalle?: string
  publico: boolean
  historial?: CalleHistorialItem[]
  createdAt?: string
  updatedAt?: string
}

export interface CalleFiltros {
  ciudadSlug?: string
  anio?: number
  estadoSuperficie?: CalleEstadoSuperficie
}

export interface CallesMetricas {
  totalTramos: number
  asfaltadas: number
  noAsfaltadas: number
  enObra: number
  sinDato: number
  metrosRelevados: number
  metrosAsfaltados: number
  metrosNoAsfaltados: number
  metrosEnObra: number
  porcentajeAsfaltado: number
}

export const CALLE_ESTADO_SUPERFICIE_LABELS: Record<CalleEstadoSuperficie, string> = {
  asfaltada: "Asfaltada",
  no_asfaltada: "No asfaltada",
  ripio: "Ripio",
  tierra: "Tierra",
  adoquin: "Adoquin",
  en_obra: "En obra",
  sin_dato: "Sin dato",
}

export const CALLE_ESTADO_OBRA_LABELS: Record<CalleEstadoObra, string> = {
  sin_obra: "Sin obra",
  proyectada: "Proyectada",
  anunciada: "Anunciada",
  en_ejecucion: "En ejecucion",
  finalizada: "Finalizada",
  paralizada: "Paralizada",
}

export const CALLE_FUENTE_LABELS: Record<CalleFuente, string> = {
  relevamiento_ciudadano: "Relevamiento ciudadano",
  municipio: "Municipio",
  provincia: "Provincia",
  observatorio: "Observatorio",
  imagen_satelital: "Imagen satelital",
}

export const CALLE_SUGERENCIA_SUPERFICIE_LABELS: Record<CalleSugerenciaSuperficie, string> = {
  asfaltada: "Asfaltada",
  no_asfaltada: "No asfaltada",
  sin_dato: "Sin dato",
}
