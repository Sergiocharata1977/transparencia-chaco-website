// Reclamos por ente — módulo ciudadano/operativo.
// Unifica denuncias, reportes y reclamos ciudadanos, clasificados por
// ente responsable. Reemplaza conceptualmente a `reportes_ciudadanos` (legacy).

export type ReclamoEnte =
  | "municipio"
  | "hospital"
  | "seguridad"
  | "escuela"
  | "servicios_publicos"
  | "concejo"
  | "otro"

export type ReclamoTipo = "denuncia" | "reclamo" | "sugerencia" | "alerta"

export type ReclamoEstado =
  | "pendiente"
  | "en_revision"
  | "publicado"
  | "derivado"
  | "respondido"
  | "rechazado"

export type ReclamoPrioridad = "baja" | "media" | "alta" | "urgente"

export interface Reclamo {
  id: string
  ciudadSlug: string
  ciudadNombre: string
  departamento?: string
  provincia?: string
  enteResponsable: ReclamoEnte
  tipo: ReclamoTipo
  titulo: string
  descripcion: string
  ubicacionTexto?: string
  estado: ReclamoEstado
  prioridad: ReclamoPrioridad
  publico: boolean
  respuestaOficial?: string
  createdAt?: string
  updatedAt?: string
}

export const RECLAMO_ENTE_LABELS: Record<ReclamoEnte, string> = {
  municipio: "Municipio",
  hospital: "Hospital",
  seguridad: "Policía / Seguridad",
  escuela: "Escuela",
  servicios_publicos: "Servicios públicos",
  concejo: "Concejo",
  otro: "Otro organismo",
}

export const RECLAMO_TIPO_LABELS: Record<ReclamoTipo, string> = {
  denuncia: "Denuncia",
  reclamo: "Reclamo",
  sugerencia: "Sugerencia",
  alerta: "Alerta",
}

export const RECLAMO_ESTADO_LABELS: Record<ReclamoEstado, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  publicado: "Publicado",
  derivado: "Derivado",
  respondido: "Respondido",
  rechazado: "Rechazado",
}

export const RECLAMO_PRIORIDAD_LABELS: Record<ReclamoPrioridad, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  urgente: "Urgente",
}
