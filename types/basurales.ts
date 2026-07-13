export type BasuralEstadoVerificacion =
  | "candidato" // detectado por el modelo, sin verificar
  | "verificado_foto" // verificado con fotografia
  | "verificado_campo" // verificado en el lugar
  | "descartado" // falso positivo confirmado
  | "erradicado" // existio y fue limpiado

export type BasuralFuente =
  | "modelo_espectral" // detector propio NDVI+BSI
  | "imagen_satelital" // inspeccion visual de imagen
  | "reporte_ciudadano"
  | "municipio"
  | "observatorio"

export type BasuralGravedad = "baja" | "media" | "alta"

export interface BasuralGeometry {
  type: "Polygon"
  coordinates: [number, number][][] // GeoJSON: anillo exterior de [lon, lat]
}

export interface BasuralHistorialItem {
  fechaISO: string
  areaM2?: number
  estadoVerificacion: BasuralEstadoVerificacion
  fuente?: BasuralFuente
  escenaId?: string
  observaciones?: string
}

export interface Basural {
  id: string
  ciudadSlug: string
  ciudadNombre: string
  departamento?: string
  provincia: string
  nombre?: string
  descripcion?: string
  ubicacionTexto?: string
  barrio?: string
  geometry?: BasuralGeometry
  areaM2: number
  confianza?: number
  ndviPromedio?: number
  bsiPromedio?: number
  fechaDeteccionISO: string
  escenaId?: string
  estadoVerificacion: BasuralEstadoVerificacion
  gravedad?: BasuralGravedad
  fuente: BasuralFuente
  evidenciaUrl?: string
  fotoUrl?: string
  observaciones?: string
  reclamoId?: string
  publico: boolean
  historial?: BasuralHistorialItem[]
  createdAt?: string
  updatedAt?: string
}

export interface BasuralFiltros {
  ciudadSlug?: string
  estadoVerificacion?: BasuralEstadoVerificacion
  anio?: number
}

export interface BasuralesMetricas {
  total: number
  candidatos: number
  verificados: number
  erradicados: number
  descartados: number
  areaTotalM2: number
  areaVerificadaM2: number
  conReclamo: number
}

export const BASURAL_ESTADO_VERIFICACION_LABELS: Record<BasuralEstadoVerificacion, string> = {
  candidato: "Candidato",
  verificado_foto: "Verificado con foto",
  verificado_campo: "Verificado en campo",
  descartado: "Descartado",
  erradicado: "Erradicado",
}

export const BASURAL_FUENTE_LABELS: Record<BasuralFuente, string> = {
  modelo_espectral: "Modelo espectral",
  imagen_satelital: "Imagen satelital",
  reporte_ciudadano: "Reporte ciudadano",
  municipio: "Municipio",
  observatorio: "Observatorio",
}

export const BASURAL_GRAVEDAD_LABELS: Record<BasuralGravedad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
}
