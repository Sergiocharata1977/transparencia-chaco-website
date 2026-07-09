// Sin datos hardcodeados: pedidos, medios, pautas, proveedores y ranking se cargan
// desde Firestore. Estos arrays vacios evitan mostrar contenido inventado en el
// sitio publico mientras las colecciones no tengan datos reales.
import type { Medio, PautaOficial, PedidoInformacion, ProveedorEstado, RankingMunicipio } from "@/types/transparencia"

export const fallbackPedidos: PedidoInformacion[] = []
export const fallbackMedios: Medio[] = []
export const fallbackPautas: PautaOficial[] = []
export const fallbackProveedores: ProveedorEstado[] = []
export const fallbackRanking: RankingMunicipio[] = []
