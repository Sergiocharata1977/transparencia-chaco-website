export type PedidoEstado = "en-plazo" | "respondido-completo" | "respondido-parcial" | "sin-respuesta" | "vencido"
export type SemaforoColor = "verde" | "amarillo" | "rojo" | "gris"
export type NivelVerificacion = 1 | 2 | 3 | 4 | 5
export type EstadoEditorial = "draft" | "review" | "published" | "archived"

export interface PedidoInformacion {
  id: string
  fechaISO: string // YYYY-MM-DD
  organismo: string
  municipio: string
  municipioSlug: string
  tema: string
  textoPedido?: string
  archivoAdjunto?: string
  estado: PedidoEstado
  fechaRespuestaISO?: string
  respuestaResumen?: string // resumen público de la respuesta, no texto completo sensible
  documentosPublicos?: string[]
  nivelVerificacion: NivelVerificacion
  visibilidadPublica: boolean
  estadoEditorial: EstadoEditorial
  createdAt?: string
}

export type MedioTipo = "radio" | "portal-web" | "canal-tv" | "streaming" | "grafica" | "red-social" | "otro"

export interface Medio {
  id: string
  nombre: string
  ciudadPrincipal: string
  ciudadSlug: string
  tipo: MedioTipo
  sitioWeb?: string
  redesSociales?: string[]
  responsableInformado?: string
  razonSocial?: string
  contactoPublico?: string // solo info pública, no datos de personas privadas
  descripcion?: string
  estado: "activo" | "inactivo" | "sin-verificar"
  recibePautaOficial?: boolean
  indiceTransparencia?: number // 0-100
  semaforo?: SemaforoColor
  visibilidadPublica: boolean
  estadoEditorial: EstadoEditorial
  createdAt?: string
}

export interface PautaOficial {
  id: string
  medioId: string
  medioNombre: string
  organismo: string
  municipio: string
  municipioSlug: string
  periodo: string
  monto?: string
  concepto?: string
  numeroDocumento?: string // nro de resolución, orden de pago, etc.
  fuenteDocumental?: string
  archivoAdjunto?: string
  estadoVerificacion: "sin-verificar" | "con-documento" | "confirmado" | "observado"
  visibilidadPublica: boolean
  estadoEditorial: EstadoEditorial
  createdAt?: string
}

export type ContratacionTipo = "licitacion" | "contratacion-directa" | "concurso" | "convenio" | "desconocido"
export type CumplimientoEstado = "sin-evaluar" | "en-ejecucion" | "cumplido" | "observado"

export interface ProveedorEstado {
  id: string
  nombre: string
  rubro: string
  ciudad: string
  ciudadSlug: string
  organismoContratante: string
  tipoContratacion: ContratacionTipo
  objeto?: string
  monto?: string
  periodo?: string
  fuenteDocumental?: string
  archivoAdjunto?: string
  estadoCumplimiento: CumplimientoEstado
  semaforo?: SemaforoColor
  visibilidadPublica: boolean
  estadoEditorial: EstadoEditorial
  createdAt?: string
}

export interface CriteriosRanking {
  publicaListadoObras: boolean
  publicaPresupuesto: boolean
  publicaContratistas: boolean
  publicaAvanceFisico: boolean
  publicaFechas: boolean
  respondePedidos: boolean
  publicaDocumentos: boolean
}

export const PESOS_RANKING: Record<keyof CriteriosRanking, number> = {
  publicaListadoObras: 20,
  publicaPresupuesto: 20,
  publicaContratistas: 15,
  publicaAvanceFisico: 15,
  publicaFechas: 10,
  publicaDocumentos: 10,
  respondePedidos: 10,
}

export function calcularPuntajeRanking(criterios: CriteriosRanking): number {
  return (Object.entries(criterios) as [keyof CriteriosRanking, boolean][]).reduce(
    (sum, [k, v]) => sum + (v ? PESOS_RANKING[k] : 0),
    0,
  )
}

export interface RankingMunicipio {
  municipio: string
  municipioSlug: string
  puntajeTotal: number
  criterios: CriteriosRanking
  obrasRegistradas: number
  obrasParalizadas: number
  accidentesReportados: number
  reclamosSalud: number
  pedidosSinRespuesta: number
  updatedAt?: string
}
