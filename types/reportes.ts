export type MunicipioSlug = "charata" | "las-brenas" | "corzuela" | "presidencia-roque-saenz-pena"

export type ReporteTipo =
  | "obra-publica" | "accidente" | "inseguridad" | "hospital"
  | "bache" | "iluminacion" | "calle" | "otro"

export type ReporteEstado =
  | "recibido" | "en-revision" | "falta-evidencia" | "verificado"
  | "publicado" | "pedido-enviado" | "respondido" | "cerrado" | "descartado"

export type NivelVerificacion = 1 | 2 | 3 | 4 | 5

// Documento que se guarda en la colección PÚBLICA (sin datos personales)
export interface ReporteCiudadano {
  id: string
  municipio: string        // label, ej "Charata"
  municipioSlug: MunicipioSlug
  tipo: ReporteTipo
  titulo: string
  descripcion: string      // sanitizada, truncada a 500 chars
  fechaHechoISO?: string   // YYYY-MM-DD
  ubicacionTexto?: string
  coordenadas?: { lat: number; lng: number }
  fuente?: string
  anonimo: boolean
  estadoInterno: ReporteEstado
  nivelVerificacion: NivelVerificacion
  visibilidadPublica: boolean
  createdAt?: string
}

export type AccidenteSubtipo =
  | "transito" | "robo-domiciliario" | "robo-comercio" | "hurto"
  | "moto-robada" | "vandalismo" | "zona-peligrosa" | "falta-iluminacion" | "otro"

export interface ReporteAccidente extends ReporteCiudadano {
  subtipo: AccidenteSubtipo
  gravedad?: "baja" | "media" | "alta"
  huboDenunciaPolicial?: "si" | "no" | "no-sabe"
  huboIntervencionMunicipal?: "si" | "no"
}

export type SaludTipo =
  | "falta-medicos" | "falta-insumos" | "demoras" | "derivaciones"
  | "ambulancia" | "guardia-saturada" | "infraestructura" | "turnos" | "atencion" | "otro"

export interface ReporteSalud extends ReporteCiudadano {
  hospital?: string
  tipoProblema: SaludTipo
  hizoReclamoFormal?: boolean
  recibioRespuesta?: boolean
}

// Payload del formulario público (incluye datos opcionales de contacto)
// ESTOS NO van a la colección pública — los procesa la API Route
export interface ReporteCiudadanoPayload {
  municipioSlug: MunicipioSlug
  tipo: ReporteTipo
  titulo: string
  descripcion: string
  fechaHechoISO?: string
  ubicacionTexto?: string
  anonimo: boolean
  autorizaPublicacion: boolean
  // Campos de accidente
  subtipo?: AccidenteSubtipo
  gravedad?: "baja" | "media" | "alta"
  huboDenunciaPolicial?: "si" | "no" | "no-sabe"
  // Campos de salud
  tipoProblema?: SaludTipo
  hospital?: string
  hizoReclamoFormal?: boolean
  // Contacto opcional (va a colección privada, nunca a la pública)
  contactoEmail?: string
}
