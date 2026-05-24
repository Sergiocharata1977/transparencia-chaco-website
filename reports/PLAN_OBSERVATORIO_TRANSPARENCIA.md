# Plan Observatorio Ciudadano de Transparencia — Ejecución multi-agente

**Fecha:** 2026-05-24
**Feature:** Expandir el sitio de transparencia de Charata/Chaco en un Observatorio Ciudadano con 8 módulos nuevos: Obras Públicas, Reportes Ciudadanos, Accidentes/Inseguridad, Salud/Hospital, Pedidos de Información, Ranking de Transparencia, Mapa Interactivo, y Observatorio de Medios/Proveedores del Estado.
**Proyecto:** `Web Site transparencia` (Next.js 16 + Firebase/Firestore + shadcn/ui + Tailwind CSS 4 + TypeScript 5)
**Ciudades cubiertas:** Charata · Las Breñas · Corzuela · Presidencia Roque Sáenz Peña (Chaco, Argentina)

---

## Contexto del proyecto (para todos los agentes)

- **Framework:** Next.js 16 con App Router (`app/`)
- **Estilos:** Tailwind CSS 4 + shadcn/ui (Radix UI). Componentes en `components/ui/`
- **Base de datos:** Firebase 12 / Firestore con patrón try/catch + fallback a datos hardcodeados
- **Patrones clave:**
  - Tipos en `types/` (ej: `types/site.ts`)
  - Servicios Firebase en `lib/firebase/` (ej: `lib/firebase/public-site.ts`)
  - Datos fallback en `lib/` (ej: `lib/site-content.ts`)
  - Páginas como "use client" cuando tienen filtros/formularios
  - `hasFirebaseClientConfig` de `@/lib/firebase/config` para decidir si usar Firestore
  - `getFirebaseDb()` devuelve la instancia de Firestore o `null`
  - Todas las funciones de servicio hacen: `if (!hasFirebaseClientConfig) return fallback`
- **Importaciones:** usar alias `@/` (ej: `@/types/obras`, `@/lib/firebase/obras`)
- **Validación:** Zod + React Hook Form cuando hay formularios
- **Iconos:** Lucide React

---

## Estado real del proyecto al 2026-05-24

- El repositorio GitHub ya existe y está publicado.
- El proyecto Vercel ya existe y está publicado.
- El proyecto Firebase `transparencia-chaco-website` ya existe.
- La base Firestore `(default)` ya fue creada en `us-central1`.
- Las reglas e índices base ya fueron desplegados.
- La web actual ya tiene una capa `firebase-ready` con fallback y no debe romperse.
- **Importante:** no se debe cargar contenido inicial automático. Las colecciones deben quedar vacías para carga manual posterior.

---

## Correcciones obligatorias del plan

Estas correcciones prevalecen sobre cualquier prompt detallado más abajo.

1. **No sembrar datos reales ni demo en Firestore.**
   - Los archivos `lib/fallback/*` pueden existir solo como fallback técnico/local.
   - Las colecciones reales de Firebase deben quedar vacías al terminar esta etapa.

2. **No escribir formularios públicos directo a Firestore desde el cliente en producción.**
   - `reportes_ciudadanos`, `denuncias` y formularios equivalentes deben entrar por `API Routes` (`app/api/...`) con validación Zod, sanitización y rate limiting.
   - El cliente no debe tener `allow create: if true` sobre colecciones sensibles como solución final de producción.

3. **Los datos de contacto no deben vivir en la colección pública.**
   - `contacto`, email, teléfono o datos personales deben guardarse en una colección privada separada o en un documento privado asociado.
   - La colección pública solo debe contener contenido sanitizado y publicable.

4. **El panel admin no debe entrar en la misma ola que el hardening de seguridad.**
   - El panel admin se mueve a una **Ola 6** separada.
   - Requiere antes: modelo de roles, reglas Firestore revisadas, estrategia de Auth y validación de acceso.

5. **Todas las fechas consultables en Firestore deben tener formato ordenable.**
   - No alcanza con strings como `"15 de Marzo, 2024"` para queries.
   - Usar campos técnicos como `createdAt` y, cuando aplique, `fechaHechoISO` o `fechaInicioISO`.

6. **Nombres canónicos y slugs obligatorios.**
   - Canonical labels:
     - `Charata`
     - `Las Breñas`
     - `Corzuela`
     - `Presidencia Roque Sáenz Peña`
   - Slugs:
     - `charata`
     - `las-brenas`
     - `corzuela`
     - `presidencia-roque-saenz-pena`
   - `"Sáenz Peña"` puede usarse solo como etiqueta corta en UI, no como valor canónico principal.

7. **Módulos con riesgo legal/editorial requieren disclaimer y revisión manual.**
   - Accidentes / inseguridad
   - Salud / hospital
   - Medios / pauta
   - Reportes ciudadanos
   - Proveedores del Estado

8. **Reglas e índices ya existen y deben evolucionarse incrementalmente.**
   - No asumir proyecto Firebase vacío.
   - Cualquier cambio en `firestore.rules` o `firestore.indexes.json` debe partir del estado actual del repo.

9. **Noticias / publicaciones y registros estructurados deben tener alta interna.**
   - El frontend público solo consulta y visualiza.
   - El alta, edición, despublicación y moderación deben hacerse desde una sección interna con usuarios autenticados.
   - Esto aplica especialmente a:
     - `publicaciones` / noticias
     - `obras_publicas`
     - `pedidos_informacion`
     - `medios`
     - `pauta_oficial`
     - `proveedores_estado`
     - `ranking_municipios`

10. **Modelo editorial mínimo para noticias/publicaciones.**
   - Debe existir estado editorial como mínimo:
     - `draft`
     - `review`
     - `published`
     - `archived`
   - El sitio público solo muestra `published`.
   - La fecha pública visible no reemplaza a campos técnicos como `publishedAt` y `updatedAt`.

---

## Resumen de olas

| Ola | Agentes | Paralelos entre sí | Dependen de |
|-----|---------|---------------------|-------------|
| 1 | A, B, C | Sí | Nada |
| 2 | A, B, C, D | Sí | Ola 1 completa |
| 3 | A, B, C, D | Sí | Ola 1 completa |
| 4 | A, B | Sí | Ola 2 + Ola 3 completas |
| 5 | A | No | Ola 4 completa |
| 6 | A, B | Sí | Ola 5 completa |

### Ajuste ejecutivo del plan

- **Ola 5 corregida:** hardening Firebase + endpoints de intake público.
- **Ola 6 nueva:** panel admin seguro y protegido.
- El conteo original de "13 agentes" era útil como borrador, pero operativo y seguro conviene ejecutarlo en **6 olas** con el panel admin separado.

---

## Ola 1 — Tipos TypeScript + Servicios Firebase
> Ejecutar Agente A + Agente B + Agente C en PARALELO
> Cada agente escribe archivos distintos — no hay conflictos.

---

### Agente A — Obras Públicas: tipos y servicio Firebase

**Puede ejecutarse en paralelo con:** Agente B y Agente C de esta misma ola
**Depende de:** nada — es la primera ola

#### Objetivo
Crear los tipos TypeScript para el módulo de Obras Públicas y su servicio Firebase con patrón de fallback.

#### Archivos a crear
- `types/obras.ts` — todos los tipos del módulo
- `lib/firebase/obras.ts` — funciones de lectura/escritura Firestore
- `lib/fallback/obras-fallback.ts` — datos de ejemplo cuando Firebase no está configurado

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con TypeScript 5, Firebase 12/Firestore, y shadcn/ui.

El proyecto tiene la siguiente estructura relevante:
- `types/site.ts` — tipos existentes (Municipio, Publicacion, DenunciaPayload)
- `lib/firebase/public-site.ts` — patrón de servicios Firebase que debes copiar exactamente
- `lib/firebase/config.ts` — expone `getFirebaseDb()` y `hasFirebaseClientConfig`

**Patrón obligatorio** (leer `lib/firebase/public-site.ts` como modelo):
```
if (!hasFirebaseClientConfig) return fallback
try { const db = getFirebaseDb(); if (!db) return fallback; ... } catch { return fallback }
```

**Tarea 1: crear `types/obras.ts`** con estos tipos exactos:

```typescript
export type ObraEstado = "anunciada" | "iniciada" | "en-ejecucion" | "paralizada" | "finalizada" | "sin-informacion"
export type ObraEjecucion = "administracion-propia" | "empresa-contratista" | "ejecucion-provincial" | "ejecucion-nacional" | "desconocido"
export type ObraOrigenFondos = "municipal" | "provincial" | "nacional" | "mixto" | "desconocido"
export type ObraTipo = "pavimento" | "ripio" | "iluminacion" | "cloacas" | "edificio-publico" | "obra-hidraulica" | "plaza" | "parque" | "otro"
export type NivelVerificacionObra = 1 | 2 | 3 | 4 | 5

export interface Coordenadas {
  lat: number
  lng: number
}

export interface ObraPublica {
  id: string
  municipio: string
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
  fechaAnuncio?: string
  fechaInicio?: string
  fechaFinPrometida?: string
  estado: ObraEstado
  avancePorcentaje?: number
  fotos?: string[]
  documentos?: string[]
  fuenteInformacion?: string
  nivelVerificacion: NivelVerificacionObra
  pedidoInformeAsociado?: boolean
  visibilidadPublica: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ObraFiltros {
  municipio?: string
  estado?: ObraEstado
  tipo?: ObraTipo
  ejecucion?: ObraEjecucion
}
```

**Tarea 2: crear `lib/fallback/obras-fallback.ts`** con un array `fallbackObras: ObraPublica[]` de 6 obras de ejemplo reales para las ciudades Charata, Las Breñas, Corzuela, Sáenz Peña (2 por estado variado, con datos coherentes con la región del Chaco, Argentina). Incluir obras con diferentes estados (anunciada, en-ejecucion, paralizada, finalizada) y distintos tipos (pavimento, iluminacion, cloacas, plaza).

**Tarea 3: crear `lib/firebase/obras.ts`** con estas funciones (siguiendo el patrón de `lib/firebase/public-site.ts`):

```typescript
import { fallbackObras } from "@/lib/fallback/obras-fallback"
import type { ObraPublica, ObraFiltros } from "@/types/obras"

// Lee obras de Firestore (colección "obras_publicas"), ordenadas por fechaInicio desc, limit 100
// Filtrar por visibilidadPublica == true en la query
// Función normalize: normalizeObra(docId: string, data: Record<string, unknown>): ObraPublica
export async function getObrasPublicas(filtros?: ObraFiltros): Promise<ObraPublica[]>

// Lee una obra por ID
export async function getObraById(id: string): Promise<ObraPublica | null>

// Agrupa obras por municipio y devuelve conteos por estado
export function getResumenObrasPorMunicipio(obras: ObraPublica[]): Record<string, { total: number; finalizadas: number; paralizadas: number; sinInfo: number }>
```

**No debes:**
- Modificar archivos existentes
- Crear páginas ni componentes UI
- Agregar autenticación (solo lectura pública)

**Criterio de éxito:** `npx tsc --noEmit` pasa sin errores en los archivos creados.

---

### Agente B — Reportes Ciudadanos, Accidentes y Salud: tipos y servicio Firebase

**Puede ejecutarse en paralelo con:** Agente A y Agente C de esta misma ola
**Depende de:** nada — es la primera ola

#### Objetivo
Crear los tipos TypeScript para reportes ciudadanos, accidentes e inseguridad, y reclamos de salud, más su servicio Firebase.

#### Archivos a crear
- `types/reportes.ts` — tipos de los tres submódulos
- `lib/firebase/reportes.ts` — funciones Firestore
- `lib/fallback/reportes-fallback.ts` — datos de ejemplo

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con TypeScript 5, Firebase 12/Firestore. Debes crear tipos y servicios para tres submódulos relacionados: reportes ciudadanos generales, accidentes/inseguridad, y reclamos de salud.

Leer como modelo: `lib/firebase/public-site.ts` y `types/site.ts`.

**Tarea 1: crear `types/reportes.ts`** con estos tipos:

```typescript
export type MunicipioChaco = "Charata" | "Las Breñas" | "Corzuela" | "Sáenz Peña"

export type ReporteTipo =
  | "obra-publica" | "accidente" | "inseguridad" | "hospital"
  | "bache" | "iluminacion" | "calle" | "otro"

export type ReporteEstado =
  | "recibido" | "en-revision" | "falta-evidencia" | "verificado"
  | "publicado" | "pedido-enviado" | "respondido" | "cerrado" | "descartado"

export type NivelVerificacion = 1 | 2 | 3 | 4 | 5

export interface ReporteCiudadano {
  id: string
  municipio: string
  tipo: ReporteTipo
  titulo: string
  descripcion: string
  fechaHecho: string
  ubicacionTexto?: string
  coordenadas?: { lat: number; lng: number }
  foto?: string
  fuente?: string
  contacto?: string
  anonimo: boolean
  autorizaPublicacion: boolean
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

export interface ReporteCiudadanoPayload {
  municipio: string
  tipo: ReporteTipo
  titulo: string
  descripcion: string
  fechaHecho: string
  ubicacionTexto?: string
  anonimo: boolean
  autorizaPublicacion: boolean
  subtipo?: AccidenteSubtipo
  tipoProblema?: SaludTipo
  hospital?: string
  gravedad?: "baja" | "media" | "alta"
}
```

**Tarea 2: crear `lib/fallback/reportes-fallback.ts`** con arrays de ejemplo:
- `fallbackReportes: ReporteCiudadano[]` (8 reportes variados, ciudades del Chaco, sin datos personales reales)
- `fallbackAccidentes: ReporteAccidente[]` (4 accidentes ejemplo)
- `fallbackReportesSalud: ReporteSalud[]` (4 reclamos de salud ejemplo)

Todos con `visibilidadPublica: true`, `nivelVerificacion: 1`, `estadoInterno: "publicado"`.

**Tarea 3: crear `lib/firebase/reportes.ts`** con:

```typescript
// getReportes(municipio?: string): Promise<ReporteCiudadano[]>
// — colección "reportes_ciudadanos", where visibilidadPublica == true, orderBy createdAt desc, limit 50

// getAccidentes(municipio?: string): Promise<ReporteAccidente[]>
// — colección "accidentes", where visibilidadPublica == true, orderBy createdAt desc, limit 50

// getReportesSalud(municipio?: string): Promise<ReporteSalud[]>
// — colección "reclamos_salud", where visibilidadPublica == true, orderBy createdAt desc, limit 50

// submitReporteCiudadano(payload: ReporteCiudadanoPayload): Promise<void>
// — CORRECCION: no escribir directo desde cliente a Firestore como solución final.
// — implementar ingreso via API Route server-side que persista:
//    1) colección privada de intake con contacto/datos sensibles
//    2) colección pública sanitizada solo cuando el equipo lo apruebe
```

Seguir exactamente el patrón de `lib/firebase/public-site.ts` con try/catch y fallback.

**No debes:** modificar archivos existentes, crear páginas UI, incluir datos de personas reales, ni dejar abierto `allow create: if true` como solución final de producción.

**Criterio de éxito:** `npx tsc --noEmit` pasa sin errores.

---

### Agente C — Pedidos de Información, Medios, Proveedores y Ranking: tipos y servicio

**Puede ejecutarse en paralelo con:** Agente A y Agente B de esta misma ola
**Depende de:** nada — es la primera ola

#### Objetivo
Crear los tipos TypeScript para pedidos de información pública, medios de comunicación, proveedores del Estado y ranking de transparencia, más su servicio Firebase.

#### Archivos a crear
- `types/transparencia.ts` — tipos de los cuatro submódulos
- `lib/firebase/transparencia.ts` — funciones Firestore
- `lib/fallback/transparencia-fallback.ts` — datos de ejemplo

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con TypeScript 5, Firebase 12/Firestore. Debes crear tipos y servicios para cuatro submódulos de transparencia institucional.

Leer como modelo: `lib/firebase/public-site.ts` y `types/site.ts`.

**Tarea 1: crear `types/transparencia.ts`** con estos tipos:

```typescript
export type PedidoEstado = "en-plazo" | "respondido-completo" | "respondido-parcial" | "sin-respuesta" | "vencido"
export type SemaforoColor = "verde" | "amarillo" | "rojo" | "gris"
export type NivelVerificacion = 1 | 2 | 3 | 4 | 5

export interface PedidoInformacion {
  id: string
  fecha: string
  organismo: string
  municipio: string
  tema: string
  textoPedido?: string
  archivoAdjunto?: string
  estado: PedidoEstado
  fechaRespuesta?: string
  respuestaRecibida?: string
  documentosAsociados?: string[]
  nivelVerificacion: NivelVerificacion
  visibilidadPublica: boolean
  createdAt?: string
}

export type MedioTipo = "radio" | "portal-web" | "canal-tv" | "streaming" | "grafica" | "red-social" | "otro"

export interface Medio {
  id: string
  nombre: string
  ciudadPrincipal: string
  tipo: MedioTipo
  sitioWeb?: string
  redesSociales?: string[]
  responsableInformado?: string
  razonSocial?: string
  contacto?: string
  descripcion?: string
  estado: "activo" | "inactivo" | "sin-verificar"
  recibePautaOficial?: boolean
  indiceTransparencia?: number
  semaforo?: SemaforoColor
  visibilidadPublica: boolean
  createdAt?: string
}

export interface PautaOficial {
  id: string
  medioId: string
  medioNombre: string
  organismo: string
  municipio: string
  periodo: string
  monto?: string
  concepto?: string
  fuenteDocumental?: string
  estadoVerificacion: "sin-verificar" | "con-documento" | "confirmado" | "observado"
  visibilidadPublica: boolean
  createdAt?: string
}

export type ContratacionTipo = "licitacion" | "contratacion-directa" | "concurso" | "convenio" | "desconocido"
export type CumplimientoEstado = "sin-evaluar" | "en-ejecucion" | "cumplido" | "observado"

export interface ProveedorEstado {
  id: string
  nombre: string
  rubro: string
  ciudad: string
  organismoContratante: string
  tipoContratacion: ContratacionTipo
  objeto?: string
  monto?: string
  periodo?: string
  fuenteDocumental?: string
  estadoCumplimiento: CumplimientoEstado
  semaforo?: SemaforoColor
  visibilidadPublica: boolean
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

export interface RankingMunicipio {
  municipio: string
  puntajeTotal: number
  criterios: CriteriosRanking
  obrasRegistradas: number
  obrasParalizadas: number
  accidentesReportados: number
  reclamosSalud: number
  pedidosSinRespuesta: number
  updatedAt?: string
}

export function calcularPuntajeRanking(criterios: CriteriosRanking): number {
  // 20 pts publicaListadoObras, 20 pts publicaPresupuesto,
  // 15 pts publicaContratistas, 15 pts publicaAvanceFisico,
  // 10 pts publicaFechas, 10 pts publicaDocumentos, 10 pts respondePedidos
  const pesos: Record<keyof CriteriosRanking, number> = {
    publicaListadoObras: 20, publicaPresupuesto: 20, publicaContratistas: 15,
    publicaAvanceFisico: 15, publicaFechas: 10, publicaDocumentos: 10, respondePedidos: 10,
  }
  return Object.entries(criterios).reduce((sum, [k, v]) => sum + (v ? pesos[k as keyof CriteriosRanking] : 0), 0)
}
```

**Tarea 2: crear `lib/fallback/transparencia-fallback.ts`** con:
- `fallbackPedidos: PedidoInformacion[]` (6 pedidos para los 4 municipios, con estados variados)
- `fallbackMedios: Medio[]` (4 medios ficticios, uno por municipio del Chaco)
- `fallbackPautas: PautaOficial[]` (4 pautas ficticias)
- `fallbackProveedores: ProveedorEstado[]` (6 proveedores ficticios)
- `fallbackRanking: RankingMunicipio[]` (4 entradas, una por municipio, con puntajes realistas 20–60)

**Tarea 3: crear `lib/firebase/transparencia.ts`** con:

```typescript
// getPedidosInformacion(municipio?: string): Promise<PedidoInformacion[]>
// — colección "pedidos_informacion", where visibilidadPublica == true, orderBy fecha desc, limit 50

// getMedios(municipio?: string): Promise<Medio[]>
// — colección "medios", where visibilidadPublica == true, orderBy nombre, limit 50

// getPautasOficiales(municipio?: string): Promise<PautaOficial[]>
// — colección "pauta_oficial", where visibilidadPublica == true, orderBy createdAt desc, limit 100

// getMedioById(id: string): Promise<Medio | null>

// getProveedores(municipio?: string): Promise<ProveedorEstado[]>
// — colección "proveedores_estado", where visibilidadPublica == true, limit 100

// getRankingMunicipios(): Promise<RankingMunicipio[]>
// — colección "ranking_municipios", orderBy puntajeTotal desc
```

Seguir exactamente el patrón de `lib/firebase/public-site.ts` con try/catch y fallback.

**No debes:** modificar archivos existentes ni crear páginas UI.

**Criterio de éxito:** `npx tsc --noEmit` pasa sin errores.

---

## Ola 2 — Páginas de lectura pública (módulos principales)
> Ejecutar SOLO después de que Ola 1 esté completa
> Ejecutar Agente A + Agente B + Agente C + Agente D en PARALELO

---

### Agente A — Página Obras Públicas

**Puede ejecutarse en paralelo con:** Agentes B, C y D de esta ola
**Depende de:** Ola 1 completa (necesita `types/obras.ts` y `lib/firebase/obras.ts`)

#### Objetivo
Crear la página de listado y el detalle de Obras Públicas con filtros por municipio, estado y tipo.

#### Archivos a crear
- `app/obras-publicas/page.tsx` — listado con filtros
- `app/obras-publicas/[id]/page.tsx` — ficha detallada de una obra
- `app/obras-publicas/loading.tsx` — skeleton de carga

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui. Las páginas similares ya hechas están en `app/municipios/page.tsx` y `app/municipios/[slug]/page.tsx` — úsalas como modelo de estructura.

Ya existen los tipos en `types/obras.ts` y las funciones `getObrasPublicas()` y `getObraById()` en `lib/firebase/obras.ts`.

**`app/obras-publicas/page.tsx`** — "use client", filtros por municipio (Charata/Las Breñas/Corzuela/Sáenz Peña), estado (ObraEstado) y tipo (ObraTipo).

Mostrar cada obra como una Card con:
- Badge de estado con colores: verde=finalizada, amarillo=en-ejecucion, rojo=paralizada, gris=anunciada/sin-informacion, azul=iniciada
- Nombre, municipio, tipo, origen de fondos, responsable informado
- Barra de progreso si `avancePorcentaje` está definido
- Nivel de verificación (1-5) como pequeños íconos o texto
- Enlace a `/obras-publicas/[id]`

Mostrar contador: "X obras registradas" con desglose por estado.

**`app/obras-publicas/[id]/page.tsx`** — ficha completa de la obra:
- Breadcrumb: Inicio > Obras Públicas > [nombre]
- Todos los campos de ObraPublica en formato tabular (usar Table de shadcn)
- Badge de estado grande y visible
- Sección "Clasificación de ejecución" explicando quién es responsable
- Si `pedidoInformeAsociado == true`, mostrar aviso "Pedido de información público enviado"
- Badge de nivel de verificación con descripción: 1=Reporte ciudadano, 2=Con foto/documento, 3=Múltiples fuentes, 4=Documento oficial, 5=Respuesta oficial
- Botón "Volver a Obras Públicas"

**`app/obras-publicas/loading.tsx`** — usar Skeleton de shadcn para simular la carga del listado.

**No debes:** crear servicios Firebase, modificar archivos existentes fuera de la carpeta `app/obras-publicas/`, agregar mapas (van en otra ola).

**Criterio de éxito:** Las páginas renderizan sin errores de TypeScript. La página de listado muestra obras con filtros funcionales. La ficha muestra todos los campos.

---

### Agente B — Página Accidentes e Inseguridad

**Puede ejecutarse en paralelo con:** Agentes A, C y D de esta ola
**Depende de:** Ola 1 completa (necesita `types/reportes.ts` y `lib/firebase/reportes.ts`)

#### Objetivo
Crear la página de accidentes e inseguridad con listado filtrable, estadísticas básicas y aviso legal de anonimización.

#### Archivos a crear
- `app/accidentes-seguridad/page.tsx` — listado con filtros y estadísticas
- `app/accidentes-seguridad/loading.tsx` — skeleton

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui.

Ya existen los tipos `ReporteAccidente`, `AccidenteSubtipo` en `types/reportes.ts` y la función `getAccidentes(municipio?)` en `lib/firebase/reportes.ts`.

**`app/accidentes-seguridad/page.tsx`** — "use client":

Estructura visual:
1. Header con título "Seguridad y Accidentes" + descripción breve
2. **Banner legal** (AlertDialog o Card con borde amarillo): "Los reportes muestran hechos anonimizados. No se publican nombres de personas ni acusaciones. Fuente: reportes ciudadanos y fuentes públicas verificadas."
3. Estadísticas en Cards: total de reportes, por municipio (mini-gráfico o números), por subtipo
4. Filtros: municipio, subtipo (AccidenteSubtipo), gravedad
5. Listado de ReporteAccidente como Cards:
   - Badge de subtipo con íconos apropiados (AlertTriangle, Shield, etc. de Lucide)
   - Municipio, ubicación, fecha, descripción resumida
   - Badge de gravedad (rojo=alta, amarillo=media, verde=baja)
   - Nivel de verificación
   - NO mostrar: contacto, nombre de personas, datos personales

**Importante:** Nunca mostrar el campo `contacto` ni datos que identifiquen personas. La descripción se trunca a 150 caracteres si es pública.

**`app/accidentes-seguridad/loading.tsx`** — Skeleton básico.

**No debes:** crear servicios, modificar archivos fuera de `app/accidentes-seguridad/`, crear formularios de carga (van en /cargar-reporte).

**Criterio de éxito:** Página renderiza sin errores. El banner legal es visible. No se exponen datos personales.

---

### Agente C — Página Salud y Hospital

**Puede ejecutarse en paralelo con:** Agentes A, B y D de esta ola
**Depende de:** Ola 1 completa (necesita `types/reportes.ts` y `lib/firebase/reportes.ts`)

#### Objetivo
Crear la página de reclamos de salud con listado, estadísticas por tipo de problema y aviso de privacidad médica.

#### Archivos a crear
- `app/salud-hospital/page.tsx` — listado con filtros y estadísticas
- `app/salud-hospital/loading.tsx` — skeleton

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui.

Ya existen los tipos `ReporteSalud`, `SaludTipo` en `types/reportes.ts` y la función `getReportesSalud(municipio?)` en `lib/firebase/reportes.ts`.

**`app/salud-hospital/page.tsx`** — "use client":

1. Header: "Salud Pública y Hospital"
2. **Banner de privacidad médica** (Card con borde rojo suave): "No se publican diagnósticos, historias clínicas ni datos de pacientes. Los reclamos son anónimos y verificados antes de su publicación."
3. Cards de estadísticas:
   - Total de reclamos
   - Distribución por tipo de problema (usar Recharts BarChart o simplemente números en Cards)
   - Reclamos por municipio
4. Filtros: municipio, tipo de problema (SaludTipo)
5. Listado como Cards:
   - Tipo de problema con ícono Lucide apropiado (Heart, AlertCircle, Clock, etc.)
   - Hospital (si está disponible), municipio, fecha
   - Descripción truncada a 120 chars
   - Si `hizoReclamoFormal == true`, mostrar badge "Con reclamo formal"
   - Nivel de verificación

**NO mostrar nunca:** campo `contacto`, ni ningún dato que identifique al paciente o a personas individuales.

**`app/salud-hospital/loading.tsx`** — Skeleton básico.

**No debes:** crear servicios, modificar archivos fuera de `app/salud-hospital/`.

**Criterio de éxito:** Página renderiza sin errores. Los banners de privacidad son visibles.

---

### Agente D — Página Pedidos de Información Pública

**Puede ejecutarse en paralelo con:** Agentes A, B y C de esta ola
**Depende de:** Ola 1 completa (necesita `types/transparencia.ts` y `lib/firebase/transparencia.ts`)

#### Objetivo
Crear la página de seguimiento de pedidos de acceso a la información pública con semáforo de respuestas.

#### Archivos a crear
- `app/pedidos-informacion/page.tsx` — listado con semáforo y estadísticas
- `app/pedidos-informacion/loading.tsx` — skeleton

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui.

Ya existen los tipos `PedidoInformacion`, `PedidoEstado` en `types/transparencia.ts` y la función `getPedidosInformacion(municipio?)` en `lib/firebase/transparencia.ts`.

**`app/pedidos-informacion/page.tsx`** — "use client":

1. Header: "Pedidos de Acceso a la Información Pública"
2. Subtítulo explicativo: "Registramos todos los pedidos de información enviados a municipios, provincia y organismos públicos. Monitoreo según Ley 27.275 y normativa provincial del Chaco."
3. **Semáforo resumen** — Cards grandes por estado:
   - Verde: "Respondido completo" + conteo
   - Amarillo: "Respondido parcial" + conteo
   - Rojo: "Sin respuesta / Vencido" + conteo
   - Gris: "En plazo" + conteo
4. Filtros: municipio, estado (PedidoEstado), organismo
5. Tabla (usar Table de shadcn) con columnas: Fecha, Organismo/Municipio, Tema, Estado (badge con color), Respuesta
6. O alternativamente Cards si la tabla queda muy ancha en mobile

Estado → color del badge:
- "respondido-completo" → verde
- "respondido-parcial" → amarillo
- "sin-respuesta" | "vencido" → rojo
- "en-plazo" → gris/azul

**`app/pedidos-informacion/loading.tsx`** — Skeleton.

**No debes:** crear servicios, modificar archivos fuera de `app/pedidos-informacion/`.

**Criterio de éxito:** El semáforo es visualmente claro. La tabla es responsive. Los estados tienen colores correctos.

---

## Ola 3 — Páginas de análisis y formulario ciudadano
> Ejecutar SOLO después de que Ola 1 esté completa
> Ejecutar Agente A + Agente B + Agente C + Agente D en PARALELO

---

### Agente A — Página Ranking de Transparencia

**Puede ejecutarse en paralelo con:** Agentes B, C y D de esta ola
**Depende de:** Ola 1 completa (necesita `types/transparencia.ts` y `lib/firebase/transparencia.ts`)

#### Objetivo
Crear la página de ranking comparativo de transparencia municipal con índice 0–100 por municipio.

#### Archivos a crear
- `app/ranking-transparencia/page.tsx`
- `app/ranking-transparencia/loading.tsx`

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui. El proyecto ya tiene Recharts 2 instalado.

Ya existen `RankingMunicipio`, `CriteriosRanking`, `calcularPuntajeRanking()` en `types/transparencia.ts` y `getRankingMunicipios()` en `lib/firebase/transparencia.ts`.

**`app/ranking-transparencia/page.tsx`** — "use client":

1. Header: "Índice de Transparencia Municipal"
2. Subtítulo: "Medimos 7 criterios objetivos de acceso a la información pública. Puntaje de 0 a 100."

3. **Tabla comparativa** (el componente más importante):
   Mostrar con Table de shadcn:
   - Municipio | Puntaje | Obras publicadas | Presupuesto | Contratistas | Avance | Fechas | Documentos | Responde pedidos
   - Cada criterio: ✓ (verde) o ✗ (rojo) usando Lucide CheckCircle / XCircle
   - Puntaje total: número grande con color (0-39 rojo, 40-69 amarillo, 70-100 verde)
   - Ordenar por puntaje desc

4. **Gráfico de barras** (BarChart de Recharts) mostrando puntaje por municipio, colores por nivel.

5. **Panel explicativo** de criterios con el peso de cada uno:
   - Publica listado de obras: 20 pts
   - Publica presupuesto: 20 pts
   - Publica contratistas/responsables: 15 pts
   - Publica avance físico: 15 pts
   - Publica fechas: 10 pts
   - Publica documentos: 10 pts
   - Responde pedidos de información: 10 pts

6. **Estadísticas secundarias** por municipio: obras registradas, accidentes, reclamos salud, pedidos sin respuesta.

7. Footer de sección: "Este índice se actualiza con los datos cargados en el observatorio. Un municipio puede mejorar su puntaje publicando información proactivamente."

**Criterio de éxito:** La tabla y el gráfico son claros. El criterio de puntuación es legible.

---

### Agente B — Páginas Medios y Observatorio de Pauta

**Puede ejecutarse en paralelo con:** Agentes A, C y D de esta ola
**Depende de:** Ola 1 completa (necesita `types/transparencia.ts` y `lib/firebase/transparencia.ts`)

#### Objetivo
Crear el listado de medios de comunicación y la ficha de cada medio con pauta oficial, monitoreo de cobertura e índice de transparencia informativa.

#### Archivos a crear
- `app/medios/page.tsx` — listado con semáforo
- `app/medios/[id]/page.tsx` — ficha de medio
- `app/medios/loading.tsx` — skeleton

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui.

Ya existen `Medio`, `PautaOficial`, `MedioTipo`, `SemaforoColor` en `types/transparencia.ts` y las funciones `getMedios()`, `getMedioById()`, `getPautasOficiales()` en `lib/firebase/transparencia.ts`.

**`app/medios/page.tsx`** — "use client":

1. Header: "Observatorio de Medios, Pauta Oficial y Transparencia Informativa"
2. Párrafo institucional: "Registramos los medios de comunicación locales, su vínculo con el Estado a través de pauta oficial, y su cobertura de temas de interés público. Todo dato proviene de fuentes documentales. Cada medio puede enviar aclaraciones."
3. Filtros: ciudad, tipo de medio, semáforo
4. Cards por medio con:
   - Nombre + tipo (Badge)
   - Ciudad
   - Semáforo (verde/amarillo/rojo/gris) como Badge prominente con significado
   - Índice de transparencia si está definido (número/100)
   - "Recibe pauta oficial: Sí/No/Sin datos"
   - Botón "Ver ficha completa"

**`app/medios/[id]/page.tsx`**:
- Breadcrumb: Inicio > Medios > [nombre]
- Ficha completa del medio
- Sección "Pauta oficial registrada": lista de PautaOficial con período, monto, fuente, estado verificación
- Sección "Índice de Transparencia Informativa" con los 10 criterios (0-100 pts):
  - Informa responsables: 10 pts
  - Datos de contacto verificables: 10 pts
  - Informa pauta oficial: 15 pts
  - Distingue publicidad de noticia: 15 pts
  - Cubre obras públicas: 10 pts
  - Cubre pedidos de información: 10 pts
  - Cubre reclamos ciudadanos: 10 pts
  - Permite derecho a respuesta: 10 pts
  - Tiene política editorial: 5 pts
  - Rectifica información: 5 pts
- Botón "Enviar aclaración o respuesta" (abre Dialog con formulario simple — nombre, texto, email)

**Nota legal obligatoria** en el footer de la ficha: "Este observatorio publica datos de interés público con base en fuentes documentales y pedidos de información. Todo medio mencionado puede solicitar corrección o derecho a respuesta."

**Criterio de éxito:** El semáforo es visible. La nota legal está presente en cada ficha. El botón de derecho a respuesta funciona.

---

### Agente C — Formulario Cargar Reporte Ciudadano

**Puede ejecutarse en paralelo con:** Agentes A, B y D de esta ola
**Depende de:** Ola 1 completa (necesita `types/reportes.ts` y `lib/firebase/reportes.ts`)

#### Objetivo
Crear el formulario unificado para que cualquier vecino pueda cargar un reporte ciudadano (obra, accidente, inseguridad, hospital, infraestructura).

#### Archivos a crear
- `app/cargar-reporte/page.tsx` — formulario con validación Zod

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4, shadcn/ui, React Hook Form 7 y Zod 3.

El formulario existente de denuncias (`app/denuncias/page.tsx`) es el modelo a seguir en estructura y estilo. Úsalo como referencia exacta.

Ya existe `ReporteCiudadanoPayload` en `types/reportes.ts` y la función `submitReporteCiudadano(payload)` en `lib/firebase/reportes.ts`.

**Corrección obligatoria para esta página:** el submit debe terminar pegando a un endpoint `app/api/reportes/route.ts` o equivalente. No dejar escritura pública directa a Firestore desde cliente para producción.

**`app/cargar-reporte/page.tsx`** — "use client":

Formulario con pasos o secciones visibles:

**Sección 1 — Tipo de reporte** (selector grande con íconos, tipo card-radio):
- Obra pública (Building2)
- Accidente de tránsito (Car)
- Hecho de inseguridad (Shield)
- Problema hospitalario (Heart)
- Bache / calle (AlertTriangle)
- Iluminación (Lightbulb)
- Otro (HelpCircle)

**Sección 2 — Datos básicos:**
- Ciudad (Select: Charata / Las Breñas / Corzuela / Sáenz Peña)
- Título del reporte (Input, max 100 chars)
- Fecha del hecho (Input type date, no futura)
- Ubicación (Input texto, ej: "Barrio Norte, esquina Av. X")
- Descripción (Textarea, min 20 chars, max 500 chars)

**Sección 3 — Campos condicionales** (según tipo elegido):
- Si "accidente" o "inseguridad": Subtipo (Select con AccidenteSubtipo), Gravedad (baja/media/alta), ¿Hubo denuncia policial? (radio)
- Si "hospital": Hospital/centro de salud (Input), Tipo de problema (Select SaludTipo), ¿Hizo reclamo formal? (checkbox)

**Sección 4 — Privacidad:**
- Checkbox "Publicar como anónimo" (default: true)
- Checkbox "Autorizo la publicación de este reporte" (requerido para enviar)
- Texto: "Si no autorizás la publicación, el reporte llega a nuestro equipo pero no se publica."
- Email de contacto (opcional, no publicado, y almacenado fuera de la colección pública)

**Aviso legal obligatorio** antes del botón submit: "No incluyas nombres de personas, datos personales ni acusaciones individuales. El equipo revisa cada reporte antes de publicarlo."

Esquema Zod:
```typescript
const reporteSchema = z.object({
  municipio: z.string().min(1, "Seleccioná una ciudad"),
  tipo: z.enum(["obra-publica","accidente","inseguridad","hospital","bache","iluminacion","otro"]),
  titulo: z.string().min(5).max(100),
  descripcion: z.string().min(20).max(500),
  fechaHecho: z.string().min(1, "Ingresá la fecha"),
  ubicacionTexto: z.string().optional(),
  anonimo: z.boolean().default(true),
  autorizaPublicacion: z.boolean().refine(v => v === true, "Debés autorizar la publicación"),
  subtipo: z.string().optional(),
  tipoProblema: z.string().optional(),
  hospital: z.string().optional(),
  gravedad: z.enum(["baja","media","alta"]).optional(),
  contacto: z.string().email().optional().or(z.literal("")),
})
```

Al enviar: llamar a la capa de ingreso segura (`/api/reportes` o wrapper equivalente), mostrar Toast de éxito con mensaje "Reporte recibido. Lo revisaremos antes de publicarlo.", resetear formulario.

**Criterio de éxito:** El formulario valida correctamente. El aviso legal es visible. Enviar llama a `submitReporteCiudadano`.

---

### Agente D — Página Proveedores del Estado

**Puede ejecutarse en paralelo con:** Agentes A, B y C de esta ola
**Depende de:** Ola 1 completa (necesita `types/transparencia.ts` y `lib/firebase/transparencia.ts`)

#### Objetivo
Crear la página de proveedores y contratistas del Estado con semáforo y ranking de concentración de contrataciones.

#### Archivos a crear
- `app/proveedores-estado/page.tsx`
- `app/proveedores-estado/loading.tsx`

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui.

Ya existen `ProveedorEstado`, `ContratacionTipo`, `CumplimientoEstado`, `SemaforoColor` en `types/transparencia.ts` y la función `getProveedores(municipio?)` en `lib/firebase/transparencia.ts`.

**`app/proveedores-estado/page.tsx`** — "use client":

1. Header: "Proveedores y Contratistas del Estado"
2. Párrafo: "Registramos contrataciones públicas identificadas mediante pedidos de información, resoluciones y documentos oficiales. Este registro no implica irregularidad: es una herramienta de control ciudadano."
3. Estadísticas: total de proveedores registrados, por municipio, por tipo de contratación
4. Filtros: municipio, tipo de contratación, estado de cumplimiento, semáforo
5. Cards por proveedor:
   - Nombre + Rubro (Badge)
   - Organismo contratante + Ciudad
   - Tipo de contratación (Licitación / Directa / etc.)
   - Monto si disponible
   - Semáforo (Badge verde/amarillo/rojo/gris)
   - Estado de cumplimiento
   - Fuente documental si disponible

6. **Ranking de concentración** (sección colapsable con Accordion):
   "Empresas con más contrataciones identificadas" — ordenar por cantidad de apariciones.

7. Footer de sección con nota legal similar a la de medios.

**Criterio de éxito:** La nota legal es visible. El ranking de concentración está presente.

---

## Ola 4 — Mapa interactivo + Integración de navegación
> Ejecutar SOLO después de que Olas 2 y 3 estén completas
> Ejecutar Agente A + Agente B en PARALELO

---

### Agente A — Mapa Ciudadano Interactivo

**Puede ejecutarse en paralelo con:** Agente B de esta ola
**Depende de:** Olas 2 y 3 completas

#### Objetivo
Crear la página del mapa interactivo que visualiza obras, reportes, accidentes y reclamos de salud con colores por estado. Instalar react-leaflet.

#### Archivos a crear
- `app/mapa-ciudadano/page.tsx`
- `components/mapa/mapa-ciudadano.tsx` — componente cliente del mapa
- `components/mapa/leyenda-mapa.tsx` — leyenda de colores

#### Archivos a modificar
- `package.json` — agregar `leaflet` y `react-leaflet` (pnpm add leaflet react-leaflet @types/leaflet)

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui.

**Importante:** Leaflet no funciona en SSR. Todos los componentes del mapa deben ser "use client" y el import debe ser dinámico con `{ ssr: false }` en Next.js.

**Paso 1:** Instalar dependencias:
```bash
pnpm add leaflet react-leaflet @types/leaflet
```

**`components/mapa/mapa-ciudadano.tsx`** — "use client":
- Mapa centrado en la región del Chaco: lat -27.45, lng -61.3, zoom 8
- Capas (toggle por tipo):
  - Obras públicas: círculos coloreados por estado (verde=finalizada, amarillo=en-ejecucion, rojo=paralizada, gris=anunciada, azul=iniciada)
  - Reportes ciudadanos: íconos violeta (punto/marker)
  - Accidentes: íconos naranja
  - Reclamos salud: íconos rosa/rojo suave
- Popup al hacer click: nombre, municipio, estado, fecha, enlace a ficha completa si aplica
- Para obras sin coordenadas, NO mostrar en el mapa (solo si tienen `coordenadas`)
- Ciudades marcadas: Charata (-27.433, -61.183), Las Breñas (-27.083, -61.083), Corzuela (-27.0, -60.95), Sáenz Peña (-26.789, -60.438)

**`components/mapa/leyenda-mapa.tsx`**:
- Leyenda visual con colores y significados
- Toggle para mostrar/ocultar cada capa

**`app/mapa-ciudadano/page.tsx`**:
- Header: "Mapa Ciudadano"
- Import dinámico del mapa: `const MapaCiudadano = dynamic(() => import("@/components/mapa/mapa-ciudadano"), { ssr: false })`
- Filtro de municipio sobre el mapa
- Contadores por tipo

**Nota sobre Leaflet en Next.js:** Importar el CSS de Leaflet en el componente cliente:
```typescript
import "leaflet/dist/leaflet.css"
```
Y corregir el problema de íconos en Next.js:
```typescript
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: ..., iconUrl: ..., shadowUrl: ... })
```

**Criterio de éxito:** El mapa renderiza sin errores. Los colores coinciden con la leyenda. No hay errores de SSR.

---

### Agente B — Integración Navbar, Footer y Home

**Puede ejecutarse en paralelo con:** Agente A de esta ola
**Depende de:** Olas 2 y 3 completas

#### Objetivo
Actualizar la navegación principal, el footer y la página home para incluir todos los módulos nuevos del observatorio.

#### Archivos a modificar
- `components/navbar.tsx` — agregar nuevas rutas al menú
- `components/footer.tsx` — agregar enlaces a nuevas secciones
- `app/page.tsx` — agregar tarjetas de módulos en el home

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Tailwind CSS 4 y shadcn/ui. Lee los tres archivos actuales antes de modificarlos: `components/navbar.tsx`, `components/footer.tsx`, `app/page.tsx`.

**`components/navbar.tsx`** — agregar estos ítems de menú manteniendo el estilo existente:

Menú principal actualizado:
```
Inicio                     → /
Obras Públicas             → /obras-publicas
Mapa Ciudadano             → /mapa-ciudadano
Seguridad y Accidentes     → /accidentes-seguridad
Salud / Hospital           → /salud-hospital
Pedidos de Información     → /pedidos-informacion
Ranking de Transparencia   → /ranking-transparencia
Medios y Pauta             → /medios
Proveedores del Estado     → /proveedores-estado
Cargar Reporte             → /cargar-reporte   ← botón destacado (variant="default" o accent)
Municipios                 → /municipios
Quiénes somos              → /quienes-somos
```

El botón "Cargar Reporte" debe ser visualmente destacado (color primario o acento).

**`components/footer.tsx`** — agregar columna nueva "Observatorio" con enlaces a los módulos nuevos. Mantener columnas existentes.

**`app/page.tsx`** — agregar después de la sección existente de municipios y publicaciones:

Sección "Módulos del Observatorio" con Cards en grid (3 cols desktop, 1 col mobile):
1. Obras Públicas — íconos Building2 — "Seguimiento de obras por municipio, ejecutor y estado"
2. Mapa Ciudadano — MapPin — "Visualizá todas las obras y reportes en el mapa"
3. Seguridad y Accidentes — Shield — "Reportes anonimizados de hechos de inseguridad"
4. Salud / Hospital — Heart — "Reclamos ciudadanos sobre el sistema de salud"
5. Pedidos de Información — FileText — "Seguimiento de pedidos de acceso a información pública"
6. Ranking de Transparencia — BarChart2 — "Índice comparativo de transparencia municipal"
7. Medios y Pauta — Newspaper — "Observatorio de pauta oficial y medios de comunicación"
8. Cargar Reporte — Plus — "Reportá un problema público" — con link prominente

**No debes:** crear nuevas páginas ni modificar archivos fuera de los 3 listados.

**Criterio de éxito:** Todas las rutas nuevas aparecen en el navbar. El botón "Cargar Reporte" es visualmente diferenciado. El home muestra los 8 módulos.

---

## Ola 5 — Hardening Firebase + Endpoints de intake público
> Ejecutar SOLO después de que Ola 4 esté completa
> Ejecutar primero seguridad e ingreso server-side antes del admin

---

### Agente A — Actualizar configuración Firebase (rules + indexes)

**Puede ejecutarse en paralelo con:** Agente B de esta ola
**Depende de:** Ola 4 completa

#### Objetivo
Actualizar las reglas de Firestore y crear los índices necesarios para soportar todas las colecciones nuevas.

#### Archivos a modificar
- `firestore.rules` — agregar reglas para colecciones nuevas
- `firestore.indexes.json` — agregar índices compuestos necesarios

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con Firebase 12. Leer los archivos actuales `firestore.rules` y `firestore.indexes.json` antes de modificarlos.

**`firestore.rules`** — agregar reglas para estas colecciones nuevas:

```
// Colecciones de LECTURA PÚBLICA (solo docs con visibilidadPublica == true):
// obras_publicas, accidentes, reclamos_salud, pedidos_informacion
// medios, pauta_oficial, proveedores_estado, ranking_municipios

// Colecciones de INGRESO PUBLICO:
// reportes_ciudadanos y formularios equivalentes deben entrar por API server-side.
// Evitar `allow create: if true` en producción para colecciones sensibles.

// Todo lo demás: solo autenticados
```

Regla base de pattern:
- Lectura pública de docs individuales: `allow read: if resource.data.visibilidadPublica == true`
- Lectura de listados públicos: permitir solo a colecciones realmente publicables y con documentos sanitizados
- Escritura: solo `request.auth != null`
- Ingresos públicos: preferir API Route server-side antes que reglas abiertas

**`firestore.indexes.json`** — agregar índices compuestos para:
- `obras_publicas`: [municipio ASC, estado ASC, __name__ ASC], [visibilidadPublica ASC, fechaInicio DESC]
- `accidentes`: [visibilidadPublica ASC, municipio ASC, createdAt DESC]
- `reclamos_salud`: [visibilidadPublica ASC, municipio ASC, createdAt DESC]
- `pedidos_informacion`: [visibilidadPublica ASC, municipio ASC, fecha DESC]
- `medios`: [visibilidadPublica ASC, ciudadPrincipal ASC, nombre ASC]
- `pauta_oficial`: [visibilidadPublica ASC, municipio ASC, createdAt DESC]
- `proveedores_estado`: [visibilidadPublica ASC, ciudad ASC, createdAt DESC]
- `reportes_ciudadanos`: [estadoInterno ASC, createdAt DESC]

**Criterio de éxito:** Las reglas cubren todas las colecciones nuevas. Los índices tienen el formato válido de Firestore.

---

### Agente B — Endpoints de intake público seguros

**Puede ejecutarse en paralelo con:** nadie, si todavía no cerró Agente A
**Depende de:** Agente A de esta ola

#### Objetivo
Crear endpoints server-side para ingresos públicos con validación, sanitización y separación entre datos públicos y privados.

#### Archivos a crear
- `app/api/reportes/route.ts`
- `app/api/denuncias/route.ts` si aplica
- `lib/server/rate-limit.ts` o util equivalente
- `lib/server/sanitize-public-input.ts`

#### Criterio de éxito
- Los formularios públicos ya no dependen de escritura abierta desde cliente.
- Los datos sensibles no terminan en colecciones públicas.

---

## Ola 6 — Sección interna segura
> Ejecutar SOLO después de que Ola 5 esté completa
> Requiere estrategia explícita de Auth + roles

### Agente A — Base de acceso interno

**Puede ejecutarse en paralelo con:** Agente B de esta ola
**Depende de:** Ola 5 completa

#### Objetivo
Crear la base de una sección interna segura, con autenticación Firebase, navegación privada y revisión de ingresos ciudadanos.

#### Archivos a crear
- `app/interno/page.tsx` o redirect a login
- `app/interno/login/page.tsx` — login con Firebase Auth
- `app/interno/dashboard/page.tsx` — panel principal
- `app/interno/reportes/page.tsx` — gestión de reportes pendientes
- `lib/firebase/admin.ts` — funciones de escritura autenticadas

#### Prompt completo para el agente

Estás trabajando en un proyecto Next.js 16 con App Router, TypeScript 5, Firebase 12 (Firestore + Firebase Auth), Tailwind CSS 4 y shadcn/ui.

**`lib/firebase/admin.ts`** — funciones que requieren autenticación:

```typescript
import { doc, updateDoc, serverTimestamp, getDoc, getDocs, collection, query, where, orderBy, limit } from "firebase/firestore"
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth"
import type { ReporteEstado, NivelVerificacion } from "@/types/reportes"

// Actualizar estado de un reporte
export async function updateReporteEstado(
  coleccion: string,
  id: string,
  estado: ReporteEstado,
  nivelVerificacion: NivelVerificacion,
  visibilidadPublica: boolean
): Promise<void>

// Obtener reportes pendientes de revisión (estadoInterno in ["recibido", "en-revision"])
export async function getReportesPendientes(): Promise<unknown[]>

// Login admin
export async function loginAdmin(email: string, password: string): Promise<void>
export async function logoutAdmin(): Promise<void>
```

**`app/interno/login/page.tsx`** — formulario de login simple:
- Email + password
- Botón "Ingresar"
- Al autenticar con Firebase Auth, redirigir a `/interno/dashboard`
- Si hay error, mostrar mensaje con Toast

**`app/interno/dashboard/page.tsx`**:
- Verificar autenticación (si no está logueado, redirigir a `/interno/login`)
- Cards de resumen: reportes pendientes, publicaciones en borrador, obras sin publicar, pedidos sin estado
- Links a sub-secciones de gestión internas

**`app/interno/reportes/page.tsx`**:
- Tabla de reportes con `estadoInterno: "recibido"` o `"en-revision"`
- Por cada reporte: tipo, municipio, título, fecha, descripción resumida
- Acciones en cada fila:
  - Select para cambiar `estadoInterno`
  - Checkbox `visibilidadPublica`
  - Select para `nivelVerificacion`
  - Botón "Guardar cambios"

**Importante:**
- Usar `onAuthStateChanged` de Firebase Auth para verificar sesión
- No hardcodear credenciales
- El panel debe funcionar aunque Firebase no esté configurado (mostrar aviso)
- No asumir que cualquier usuario autenticado es admin
- Definir criterio mínimo de acceso antes de publicar este módulo

### Agente B — Módulo interno de publicaciones / noticias

**Puede ejecutarse en paralelo con:** Agente A de esta ola
**Depende de:** Ola 5 completa

#### Objetivo
Crear una sección interna específica para gestionar noticias/publicaciones sin depender del frontend público.

#### Archivos a crear
- `app/interno/publicaciones/page.tsx` — listado interno
- `app/interno/publicaciones/nueva/page.tsx` — alta de publicación
- `app/interno/publicaciones/[id]/page.tsx` — edición
- `types/publicaciones-admin.ts` o extender `types/site.ts` si conviene
- funciones internas en `lib/firebase/admin.ts` o módulo dedicado

#### Requerimientos mínimos
- Tabla/listado de publicaciones con estado editorial
- Alta manual de noticia
- Edición de título, extracto, contenido, categoría, municipio, imagen
- Cambio de estado: `draft`, `review`, `published`, `archived`
- Campo técnico `publishedAt`
- Campo técnico `updatedAt`
- La web pública `/publicaciones` solo debe consultar las publicaciones en estado `published`

#### Decisión funcional
- El sistema de noticias pasa a tener dos capas:
  - **Pública:** lectura y visualización
  - **Interna:** gestión completa por usuarios autenticados

### Agente C — Altas internas de registros no públicos

**Puede ejecutarse en paralelo con:** Agentes A y B de esta ola
**Depende de:** Ola 5 completa

#### Objetivo
Crear la base de pantallas internas para dar de alta registros que no deben nacer desde el frontend público.

#### Alcance inicial
- `app/interno/obras/page.tsx`
- `app/interno/pedidos/page.tsx`
- `app/interno/medios/page.tsx`
- `app/interno/proveedores/page.tsx`

#### Alcance funcional mínimo
- Alta manual
- Edición básica
- Estado de publicación / visibilidad
- Campos técnicos `createdAt`, `updatedAt`
- Sin exposición pública automática hasta marcar como publicable

### Agente D — Roles / acceso mínimo para interno

**Puede ejecutarse en paralelo con:** Agentes A, B y C de esta ola
**Depende de:** Ola 5 completa

#### Objetivo
Definir y aplicar una condición mínima de acceso a la sección interna para evitar que cualquier usuario autenticado obtenga permisos de revisión o edición.

#### Alcance mínimo aceptable
- Documentar criterio de acceso
- Reflejarlo en reglas / checks de toda la sección interna
- Dejar explícito si se usa lista blanca temporal o claims

**Criterio de éxito:** Login funciona con Firebase Auth. La sección interna queda protegida. Los módulos editoriales no quedan abiertos a cualquier usuario autenticado.

---

## Verificación final

### Checklist de rutas (verificar que todas carguen sin error 404 ni TypeScript)
- [ ] `/obras-publicas` — listado con filtros
- [ ] `/obras-publicas/[id]` — ficha de obra
- [ ] `/accidentes-seguridad` — listado con banner legal
- [ ] `/salud-hospital` — listado con banner de privacidad
- [ ] `/pedidos-informacion` — semáforo + tabla
- [ ] `/ranking-transparencia` — tabla + gráfico Recharts
- [ ] `/medios` — listado con semáforo
- [ ] `/medios/[id]` — ficha con derecho a respuesta
- [ ] `/proveedores-estado` — listado + ranking concentración
- [ ] `/cargar-reporte` — formulario Zod completo
- [ ] `/mapa-ciudadano` — mapa Leaflet sin errores SSR
- [ ] `/interno/login` — login Firebase Auth
- [ ] `/interno/dashboard` — panel interno protegido
- [ ] `/interno/publicaciones` — gestión de noticias
- [ ] `/interno/obras` — gestión interna de obras
- [ ] `/interno/pedidos` — gestión interna de pedidos
- [ ] `/interno/medios` — gestión interna de medios
- [ ] `/interno/proveedores` — gestión interna de proveedores
- [ ] Navbar muestra todos los ítems nuevos
- [ ] Home muestra los 8 módulos

### Checklist de datos y Firebase
- [ ] `types/obras.ts` exporta todos los tipos correctamente
- [ ] `types/reportes.ts` exporta todos los tipos correctamente
- [ ] `types/transparencia.ts` exporta todos los tipos correctamente
- [ ] Todas las funciones de `lib/firebase/` tienen fallback cuando Firebase no está configurado
- [ ] `firestore.rules` cubre todas las colecciones nuevas
- [ ] `firestore.indexes.json` tiene los índices compuestos
- [ ] `publicaciones` públicas filtran solo estado editorial `published`
- [ ] noticias y registros internos no dependen de alta desde frontend público

### Checklist legal/editorial
- [ ] `/accidentes-seguridad` tiene banner de anonimización visible
- [ ] `/salud-hospital` tiene banner de privacidad médica visible
- [ ] `/cargar-reporte` tiene aviso legal antes del botón submit
- [ ] `/medios/[id]` tiene nota de derecho a respuesta
- [ ] `/proveedores-estado` tiene nota legal
- [ ] Ninguna página expone campo `contacto` de los reportes
- [ ] Formulario de reporte tiene checkbox de autorización de publicación

### Checklist de TypeScript
- [ ] `npx tsc --noEmit` sin errores al terminar todas las olas

### Orden de ejecución recomendado
```
Ola 1 (paralelo) → Ola 2 (paralelo) → Ola 3 (paralelo) → Ola 4 (paralelo) → Ola 5 (seguridad e intake) → Ola 6 (admin)
Agentes de Ola 2 y 3 pueden ejecutarse en paralelo entre sí (dependen solo de Ola 1)
```

---

## Notas técnicas importantes

### Sobre el mapa (Ola 4 Agente A)
- Leaflet requiere `"use client"` y import dinámico `{ ssr: false }` — sin esto Next.js falla en el build
- Coordenadas de las ciudades del Chaco: Charata (-27.433, -61.183), Las Breñas (-27.083, -61.083), Corzuela (-27.0, -60.95), Sáenz Peña (-26.789, -60.438)
- Alternativa si Leaflet da problemas: usar `@vis.gl/react-google-maps` o un mapa SVG estático con overlays

### Sobre datos sensibles
- El campo `contacto` de ReporteCiudadano no debe estar en la colección pública final
- Los datos de contacto deben persistirse por separado del contenido publicable
- Los reclamos de salud no incluyen diagnósticos ni datos de pacientes
- Los accidentes solo muestran hechos georreferenciados, sin personas identificables

### Sobre el panel admin
- Firebase Auth requiere habilitar "Email/Password" en Firebase Console
- Las variables de entorno del servidor para el admin SDK van en `.env.local` (nunca en el frontend)
- El admin panel es mínimo: gestión de reportes pendientes, no un CMS completo
- El admin panel no debe publicarse sin criterio de roles/acceso explícito

### Sobre la sección interna
- Noticias/publicaciones deben administrarse desde `/interno/publicaciones`
- Los registros que no puedan darse de alta desde frontend público deben tener alta interna
- La sección interna actúa como backoffice operativo/editorial, no como parte del sitio público

### Nombres de ciudades a usar consistentemente
- "Charata"
- "Las Breñas" (no "La Breña")
- "Corzuela" (cubre la zona de Consuelo)
- "Sáenz Peña" o "Presidencia Roque Sáenz Peña"
