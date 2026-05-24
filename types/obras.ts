export type ObraEstado = "anunciada" | "iniciada" | "en-ejecucion" | "paralizada" | "finalizada" | "sin-informacion"
export type ObraEjecucion = "administracion-propia" | "empresa-contratista" | "ejecucion-provincial" | "ejecucion-nacional" | "desconocido"
export type ObraOrigenFondos = "municipal" | "provincial" | "nacional" | "mixto" | "desconocido"
export type ObraTipo = "pavimento" | "ripio" | "iluminacion" | "cloacas" | "edificio-publico" | "obra-hidraulica" | "plaza" | "parque" | "otro"
export type NivelVerificacion = 1 | 2 | 3 | 4 | 5
export type EstadoEditorial = "draft" | "review" | "published" | "archived"

export interface Coordenadas {
  lat: number
  lng: number
}

export interface ObraPublica {
  id: string
  municipio: string       // label legible, ej: "Charata"
  municipioSlug: string   // slug canónico, ej: "charata"
  nombre: string
  descripcion: string
  ubicacionTexto: string
  coordenadas?: Coordenadas
  tipo: ObraTipo
  origenFondos: ObraOrigenFondos
  ejecucion: ObraEjecucion
  responsableInformado?: string
  contratista?: string
  presupuestoInformado?: string
  fechaAnuncioISO?: string
  fechaInicioISO?: string
  fechaFinISO?: string
  estado: ObraEstado
  avancePorcentaje?: number
  fotos?: string[]
  documentos?: string[]
  fuenteInformacion?: string
  nivelVerificacion: NivelVerificacion
  pedidoInformeAsociado?: boolean
  visibilidadPublica: boolean
  estadoEditorial: EstadoEditorial
  createdAt?: string
  updatedAt?: string
}

export interface ObraFiltros {
  municipioSlug?: string
  estado?: ObraEstado
  tipo?: ObraTipo
  ejecucion?: ObraEjecucion
}

export interface ObraResumen {
  municipio: string
  municipioSlug: string
  total: number
  finalizadas: number
  enEjecucion: number
  paralizadas: number
  sinInfo: number
}
