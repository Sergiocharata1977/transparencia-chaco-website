// Notas enviadas al municipio — módulo formal/documental.
// Unifica pedidos de información, notas administrativas, solicitudes vecinales
// y reclamos formales. Reemplaza conceptualmente a `pedidos_informacion` (legacy).

export type NotaTipo =
  | "pedido_informacion"
  | "nota_administrativa"
  | "solicitud_vecinal"
  | "reclamo_formal"

export type NotaEstado = "borrador" | "enviada" | "respondida" | "vencida" | "archivada"

export interface NotaMunicipio {
  id: string
  ciudadSlug: string
  ciudadNombre: string
  departamento?: string
  provincia?: string
  tipo: NotaTipo
  titulo: string
  descripcion: string
  destinatario: string
  fechaEnvioISO?: string // YYYY-MM-DD
  estado: NotaEstado
  respuesta?: string
  fechaRespuestaISO?: string // YYYY-MM-DD
  archivoUrl?: string
  publico: boolean
  createdAt?: string
  updatedAt?: string
}

export const NOTA_TIPO_LABELS: Record<NotaTipo, string> = {
  pedido_informacion: "Pedido de información",
  nota_administrativa: "Nota administrativa",
  solicitud_vecinal: "Solicitud vecinal",
  reclamo_formal: "Reclamo formal",
}

export const NOTA_ESTADO_LABELS: Record<NotaEstado, string> = {
  borrador: "Borrador",
  enviada: "Enviada",
  respondida: "Respondida",
  vencida: "Vencida",
  archivada: "Archivada",
}
