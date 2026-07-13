# Plan Detector Satelital Propio (Basurales + Clasificación de Calles) — Ejecución multi-agente

**Fecha:** 2026-07-13
**Feature:** Detector satelital propio 100% TypeScript/Vercel inspirado en el detector de basurales de Fractal/Bunge y Born, sin portar su pipeline Python: módulo `basurales` (ABM + página pública + mapa), servicio Copernicus adaptado de SIG-Agro, detección espectral (NDVI+BSI) con vectorización propia, flujo candidato→verificación→publicación→reclamo, y clasificación espectral de calles existentes (asfaltada vs no asfaltada) como sugerencia para el admin.
**Proyectos afectados:** `transparencia-chaco-website` (único repo tocado; se lee código de `D:\Proyectos\SIG-Agro` como referencia)
**Documentos relacionados:** `reports/ARQUITECTURA_DATOS.md`, `reports/HANDOFF_ACTUAL.md`

---

## Decisiones de diseño (leer antes de ejecutar)

1. **Cero dependencias nuevas.** El repo en `D:` no puede correr `pnpm install`, por lo que no se puede regenerar `pnpm-lock.yaml`. Nada de `@turf`, `geotiff.js` ni similares. Todo el procesamiento geométrico/raster se escribe a mano en `lib/satelital/` (parser TIFF mínimo, clustering de píxeles, hull, muestreo sobre LineString). Son funciones puras y chicas.
2. **El cómputo pesado lo hace Copernicus, no Vercel.** Se usa el patrón probado en SIG-Agro: la Process API de Copernicus Data Space Ecosystem (CDSE) ejecuta un *evalscript* píxel a píxel en sus servidores y devuelve un raster chico (una ciudad como Charata a 10 m/px ≈ 400×500 px). Vercel solo parsea ese buffer y agrupa píxeles.
3. **El modelo propone, el humano confirma.** Todo lo que sale del detector nace con `estadoVerificacion: "candidato"` y `publico: false`. Nada se publica sin verificación humana (foto/campo). Igual para calles: el satélite escribe `sugerenciaSuperficie`, nunca pisa `estadoSuperficie`.
4. **Limitación asumida y documentada:** Sentinel-2 tiene 10 m/px. Detecta basurales grandes (≳2.500 m²) y distingue asfalto (oscuro) de tierra (suelo brillante rojizo). NO detecta microbasurales de esquina ni distingue ripio de tierra — eso queda para el canal ciudadano y la verificación del admin.
5. **Credenciales:** se reutiliza el patrón OAuth2 client-credentials de CDSE de SIG-Agro. Variables: `CDSE_CLIENT_ID`, `CDSE_CLIENT_SECRET`, `CDSE_TOKEN_URL` (opcional). Deben cargarse en `.env.local` y en Vercel. Se puede reusar el OAuth client de SIG-Agro o crear uno nuevo en el dashboard de CDSE (gratuito).
6. **Rutas de detección con `export const maxDuration = 60`** para no morir en el timeout default de Vercel.
7. **Sin índices Firestore nuevos:** el cliente público lee `basurales` con `orderBy("createdAt","desc")` + filtro client-side de `publico`, igual que `calles_municipio`.

---

## Resumen de olas

| Ola | Agentes | Paralelos entre sí | Dependen de |
|-----|---------|---------------------|-------------|
| 1 | A, B, C, D | Sí | Nada |
| 2 | A, B, C, D | Sí | Ola 1 completa |
| 3 | A, B, C, D | Sí | Ola 2 completa |
| 4 | A | No aplica (único) | Ola 3 completa |

- **Ola 1 — Fundaciones:** tipos, servicio Copernicus, utilidades raster/geo, reglas Firestore.
- **Ola 2 — Backend:** CRUD admin de basurales, endpoint de detección de basurales, endpoint de clasificación de calles, lib cliente pública.
- **Ola 3 — Frontend:** ABM `/admin/basurales`, página pública `/basurales`, sugerencias en `/admin/calles`, navegación + capa en mapa ciudadano.
- **Ola 4 — Cierre:** verificación integral, documentación, commit y push.

---

## Ola 1 — Fundaciones (tipos, servicio satelital, utilidades, reglas)
> Ejecutar Agente A + Agente B + Agente C + Agente D en PARALELO

### Agente A — Tipos del módulo basurales
**Puede ejecutarse en paralelo con:** Agentes B, C y D
**Depende de:** nada — es la primera ola

#### Objetivo
Crear `types/basurales.ts` con todos los tipos, enums y labels del módulo, siguiendo el patrón exacto de `types/calles.ts`.

#### Archivos a crear
- `types/basurales.ts` — tipos, enums, labels y métricas del módulo basurales.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Firebase, repo `transparencia-chaco-website`. Leer `types/calles.ts` como modelo de estilo (enums string union + interfaces + `Record<..., string>` de labels, sin dependencias externas).

Crear `types/basurales.ts` con exactamente esto:

```typescript
export type BasuralEstadoVerificacion =
  | "candidato"          // detectado por el modelo, sin verificar
  | "verificado_foto"    // verificado con fotografía
  | "verificado_campo"   // verificado en el lugar
  | "descartado"         // falso positivo confirmado
  | "erradicado"         // existió y fue limpiado

export type BasuralFuente =
  | "modelo_espectral"   // detector propio NDVI+BSI
  | "imagen_satelital"   // inspección visual de imagen
  | "reporte_ciudadano"
  | "municipio"
  | "observatorio"

export type BasuralGravedad = "baja" | "media" | "alta"

export interface BasuralGeometry {
  type: "Polygon"
  coordinates: [number, number][][]  // GeoJSON: anillo exterior de [lon, lat]
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
  confianza?: number          // 0-1, score del detector
  ndviPromedio?: number
  bsiPromedio?: number
  fechaDeteccionISO: string   // YYYY-MM-DD
  escenaId?: string           // id de la escena Sentinel-2 usada
  estadoVerificacion: BasuralEstadoVerificacion
  gravedad?: BasuralGravedad
  fuente: BasuralFuente
  evidenciaUrl?: string
  fotoUrl?: string
  observaciones?: string
  reclamoId?: string          // id del doc en coleccion `reclamos` si se generó reclamo
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
```

Agregar además `BASURAL_ESTADO_VERIFICACION_LABELS`, `BASURAL_FUENTE_LABELS` y `BASURAL_GRAVEDAD_LABELS` (Record completo con labels en español sin tildes problemáticas, siguiendo el estilo de `CALLE_ESTADO_SUPERFICIE_LABELS`).

NO tocar ningún otro archivo. Criterio de éxito: el archivo existe, exporta todo lo listado, y `rg "BasuralEstadoVerificacion" types/` lo encuentra.

---

### Agente B — Servicio Copernicus (auth + STAC + Process API + evalscripts)
**Puede ejecutarse en paralelo con:** Agentes A, C y D
**Depende de:** nada — es la primera ola

#### Objetivo
Portar el cliente CDSE de SIG-Agro a este repo: autenticación OAuth2, búsqueda de escenas STAC y pedidos a la Process API con los dos evalscripts del proyecto (máscara de basural y multibanda para calles).

#### Archivos a crear
- `lib/satelital/copernicus.ts` — auth + STAC + Process API + evalscripts.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript, repo `transparencia-chaco-website`. Este código correrá SOLO server-side (API routes). No usar ninguna dependencia externa: solo `fetch` nativo.

Existe una implementación de referencia probada en producción en otro repo hermano: `D:\Proyectos\SIG-Agro\src\services\copernicus-auth.ts` y `D:\Proyectos\SIG-Agro\src\services\sentinel-hub.ts`. Si podés leerlos, usalos como modelo. Si no, acá está todo lo esencial:

- Token URL: `https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token` (override con env `CDSE_TOKEN_URL`), flow `client_credentials` con `CDSE_CLIENT_ID` / `CDSE_CLIENT_SECRET`, body `application/x-www-form-urlencoded`. Cachear token en variable de módulo con margen de 30 s antes de expirar.
- STAC search: POST `https://stac.dataspace.copernicus.eu/v1/search` con `{ collections: ["sentinel-2-l2a"], bbox: [lonMin, latMin, lonMax, latMax], datetime: "desde/hasta", query: { "eo:cloud_cover": { lte: maxNubes } }, sortby: [{ field: "properties.datetime", direction: "desc" }], limit }`.
- Process API: POST `https://sh.dataspace.copernicus.eu/api/v1/process` con `{ input: { bounds: { bbox, properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" } }, data: [{ type: "sentinel-2-l2a", dataFilter: { timeRange, maxCloudCoverage } }] }, output: { width, height, responses: [{ identifier: "default", format: { type: "image/tiff" } }] }, evalscript }` → devuelve un GeoTIFF como `ArrayBuffer`.

Crear `lib/satelital/copernicus.ts` que exporte:

```typescript
export interface BboxGeo { lonMin: number; latMin: number; lonMax: number; latMax: number }
export interface EscenaDisponible { id: string; fecha: string; cloudCover: number }

export async function buscarEscenas(bbox: BboxGeo, fechaDesde: string, fechaHasta: string, maxNubes?: number, limite?: number): Promise<EscenaDisponible[]>

// Máscara de candidatos a basural: 1 banda UINT8, valores 0/1
export async function obtenerMascaraBasural(bbox: BboxGeo, fechaDesde: string, fechaHasta: string, width: number, height: number): Promise<ArrayBuffer>

// Reflectancias para clasificar calles: 4 bandas FLOAT32 (B02, B03, B04, B08)
export async function obtenerBandasCalles(bbox: BboxGeo, fechaDesde: string, fechaHasta: string, width: number, height: number): Promise<ArrayBuffer>
```

Evalscript de la máscara de basural (detección de suelo degradado/descarga — NDVI bajo + suelo desnudo BSI + exclusión de agua):

```javascript
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B02","B03","B04","B08","B11","dataMask"] }],
    output: { bands: 1, sampleType: "UINT8" }
  }
}
function evaluatePixel(s) {
  if (s.dataMask === 0) return [0];
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04 + 1e-10);
  const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08 + 1e-10);
  const bsi  = ((s.B11 + s.B04) - (s.B08 + s.B02)) / ((s.B11 + s.B04) + (s.B08 + s.B02) + 1e-10);
  const esAgua = ndwi > 0.2;
  const esCandidato = !esAgua && ndvi < 0.2 && bsi > 0.05;
  return [esCandidato ? 1 : 0];
}
```

Evalscript multibanda para calles:

```javascript
//VERSION=3
function setup() {
  return { input: [{ bands: ["B02","B03","B04","B08"] }], output: { bands: 4, sampleType: "FLOAT32" } }
}
function evaluatePixel(s) { return [s.B02, s.B03, s.B04, s.B08]; }
```

Manejo de errores: si la respuesta no es ok, lanzar `Error` con status + texto (mismo estilo que SIG-Agro). Si faltan las env vars, lanzar error claro "Faltan CDSE_CLIENT_ID o CDSE_CLIENT_SECRET".

NO crear rutas API ni tocar tipos de otros módulos. Criterio de éxito: el archivo compila conceptualmente (imports correctos, tipos consistentes) y no importa nada fuera de la stdlib.

---

### Agente C — Utilidades raster y geometría (sin dependencias)
**Puede ejecutarse en paralelo con:** Agentes A, B y D
**Depende de:** nada — es la primera ola

#### Objetivo
Escribir a mano las utilidades que reemplazan a GDAL/turf: parser mínimo de GeoTIFF sin comprimir, clustering de píxeles por componentes conexas, hull convexo, conversión píxel→lon/lat y muestreo de puntos a lo largo de una LineString.

#### Archivos a crear
- `lib/satelital/tiff.ts` — parser mínimo de TIFF/GeoTIFF sin compresión.
- `lib/satelital/geo.ts` — clustering, hull, mapeo píxel↔geo, muestreo sobre polilíneas.

#### Prompt completo para el agente
Proyecto Next.js + TypeScript, repo `transparencia-chaco-website`. REGLA DURA: cero dependencias externas — solo TypeScript puro y `DataView`/`ArrayBuffer`. Este código corre server-side sobre buffers chicos (< 5 MB).

**`lib/satelital/tiff.ts`** — parser mínimo de los GeoTIFF que devuelve la Process API de Sentinel Hub (little-endian o big-endian, SIN compresión, organizados en strips). Exportar:

```typescript
export interface RasterTiff {
  width: number
  height: number
  bands: number            // SamplesPerPixel
  sampleFormat: "uint" | "float"
  bitsPerSample: number
  // valor de la banda `b` en (x, y); para UINT8 devuelve 0..255, para FLOAT32 el float
  get(x: number, y: number, b: number): number
}

export function parseTiff(buffer: ArrayBuffer): RasterTiff
```

Implementación: leer header (II/MM + magic 42), recorrer el primer IFD, extraer tags 256 (ImageWidth), 257 (ImageLength), 258 (BitsPerSample), 259 (Compression — si ≠ 1 lanzar `Error("TIFF comprimido no soportado")`), 273 (StripOffsets), 277 (SamplesPerPixel), 278 (RowsPerStrip), 279 (StripByteCounts), 339 (SampleFormat). Soportar múltiples strips y lectura interleaved por píxel (chunky, PlanarConfiguration 1). Con eso alcanza — los TIFF de Sentinel Hub cumplen este perfil. Documentar en un comentario de cabecera que es un parser de perfil restringido.

**`lib/satelital/geo.ts`** — exportar:

```typescript
export interface BboxGeo { lonMin: number; latMin: number; lonMax: number; latMax: number }

// centro del píxel (x,y) de un raster width×height que cubre bbox → [lon, lat]
export function pixelALonLat(x: number, y: number, width: number, height: number, bbox: BboxGeo): [number, number]

// [lon,lat] → píxel {x,y} (clamped a los bordes)
export function lonLatAPixel(lon: number, lat: number, width: number, height: number, bbox: BboxGeo): { x: number; y: number }

export interface ClusterPixeles {
  pixeles: Array<{ x: number; y: number }>
  count: number
}

// componentes conexas (4-conectividad) sobre un predicado de máscara
export function agruparPixeles(width: number, height: number, esMascara: (x: number, y: number) => boolean, minPixeles: number): ClusterPixeles[]

// hull convexo (monotone chain) de los centros de píxel convertidos a lon/lat,
// devuelto como anillo GeoJSON cerrado [[lon,lat],...] (primer punto repetido al final).
// Si el cluster tiene < 3 píxeles, devolver el rectángulo del bbox del cluster.
export function clusterAPoligono(cluster: ClusterPixeles, width: number, height: number, bbox: BboxGeo): [number, number][]

// área aproximada en m² de un anillo [[lon,lat],...] (shoelace con corrección cos(lat) — precisión suficiente a escala urbana)
export function areaAnilloM2(anillo: [number, number][]): number

// puntos cada `pasoMetros` a lo largo de una LineString [[lon,lat],...] (interpolación lineal, metros aproximados con cos(lat))
export function muestrearLineString(coordinates: [number, number][], pasoMetros: number): [number, number][]

// bbox que contiene todas las coordenadas dadas, con margen `margenGrados`
export function bboxDeCoordenadas(coords: [number, number][], margenGrados: number): BboxGeo
```

`agruparPixeles`: usar flood-fill iterativo con pila (no recursión, para no reventar stack) y un `Uint8Array` de visitados. Descartar clusters con `count < minPixeles`.

NO tocar otros archivos, NO importar de `lib/satelital/copernicus.ts` (mantener ambos módulos independientes). Criterio de éxito: ambos archivos existen, exportan las firmas exactas y no tienen imports externos.

---

### Agente D — Reglas Firestore y variables de entorno
**Puede ejecutarse en paralelo con:** Agentes A, B y C
**Depende de:** nada — es la primera ola

#### Objetivo
Agregar la colección `basurales` a `firestore.rules` y documentar las variables CDSE.

#### Archivos a modificar
- `firestore.rules` — bloque para `basurales`: `read` público, `write` solo autenticado (mismo patrón que `calles_municipio`).
- `.env.example` — si existe, agregar `CDSE_CLIENT_ID=`, `CDSE_CLIENT_SECRET=`, `CDSE_TOKEN_URL=` con comentario; si no existe, crearlo solo con esas tres claves comentadas.

#### Prompt completo para el agente
Repo `transparencia-chaco-website`, Firebase Firestore. Leer `firestore.rules` y ubicar el bloque de `calles_municipio` (read público / write autenticado). Agregar inmediatamente después un bloque idéntico para `match /basurales/{id}`. El filtrado por `publico` lo hace el cliente, igual que el resto de las colecciones del observatorio — no meter condiciones de campo en las rules.

Después, buscar `.env.example` en la raíz. Si existe, agregar al final:

```
# Copernicus Data Space Ecosystem (detector satelital) — crear OAuth client en dashboard CDSE
CDSE_CLIENT_ID=
CDSE_CLIENT_SECRET=
# CDSE_TOKEN_URL=  (opcional, tiene default)
```

Si no existe, crearlo con solo ese bloque. NO tocar `firestore.indexes.json` (no hacen falta índices compuestos: las lecturas públicas usan solo `orderBy createdAt`). NO desplegar reglas (eso es manual del usuario). Criterio de éxito: `rg "basurales" firestore.rules` devuelve el bloque nuevo.

---

## Ola 2 — Backend (APIs admin y lib cliente)
> Ejecutar SOLO después de que Ola 1 esté completa
> Ejecutar Agente A + Agente B + Agente C + Agente D en PARALELO

### Agente A — API CRUD `/api/admin/basurales`
**Puede ejecutarse en paralelo con:** Agentes B, C y D
**Depende de:** Ola 1 completa (usa `types/basurales.ts`)

#### Objetivo
CRUD admin de la colección `basurales`, calcado del patrón de calles.

#### Archivos a crear
- `app/api/admin/basurales/route.ts` — GET (listar hasta 500) + POST (crear).
- `app/api/admin/basurales/[id]/route.ts` — PATCH (editar, con append a historial cuando cambian campos de relevamiento) + DELETE.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Firebase Admin SDK, repo `transparencia-chaco-website`. Modelos exactos a leer antes de escribir: `app/api/admin/calles/route.ts` y `app/api/admin/calles/[id]/route.ts` (auth con `requireAdminAuth` de `lib/api/admin-auth.ts`, Zod `safeParse`, helper `cleanUndefined`, `FieldValue.serverTimestamp()`, y patrón de `historial`). Tipos de dominio en `types/basurales.ts` (ya existe — leerlo).

Colección: `basurales`. Schema Zod de creación (espejo de la interfaz `Basural`, sin `id/createdAt/updatedAt/historial`):
- `ciudadSlug` (min 2), `ciudadNombre` (min 2), `departamento?`, `provincia` default `"Chaco"`.
- `nombre?` (max 150), `descripcion?` (max 2000), `ubicacionTexto?` (max 200), `barrio?` (max 120).
- `geometry`: objeto `{ type: z.literal("Polygon"), coordinates: z.array(z.array(z.tuple([z.number(), z.number()])).min(4)).min(1) }` opcional.
- `areaM2` number min 0 default 0; `confianza?` number 0–1; `ndviPromedio?`, `bsiPromedio?` numbers.
- `fechaDeteccionISO` regex `^\d{4}-\d{2}-\d{2}$`; `escenaId?` (max 200).
- `estadoVerificacion` enum `["candidato","verificado_foto","verificado_campo","descartado","erradicado"]` default `"candidato"`.
- `gravedad?` enum `["baja","media","alta"]`.
- `fuente` enum `["modelo_espectral","imagen_satelital","reporte_ciudadano","municipio","observatorio"]` default `"observatorio"`.
- `evidenciaUrl?`/`fotoUrl?` url-o-vacío; `observaciones?` (max 1000); `reclamoId?` (max 120); `publico` boolean default false.

POST: al crear, iniciar `historial` con un item `{ fechaISO: fechaDeteccionISO, areaM2, estadoVerificacion, fuente, escenaId?, observaciones? }` (limpiando undefined). PATCH: schema todo opcional; si cambia `estadoVerificacion` o `areaM2`, agregar item al historial con `FieldValue.arrayUnion(...)` y fecha del día; siempre `updatedAt`. DELETE directo.

NO tocar tipos, ni rules, ni frontend. Criterio de éxito: ambos routes espejan la estructura de los de calles, con 401 sin token y 400 con datos inválidos.

---

### Agente B — Endpoint de detección de basurales
**Puede ejecutarse en paralelo con:** Agentes A, C y D
**Depende de:** Ola 1 completa (usa `lib/satelital/copernicus.ts`, `lib/satelital/tiff.ts`, `lib/satelital/geo.ts`, `types/basurales.ts`)

#### Objetivo
Orquestador que ejecuta el detector sobre el bbox de una ciudad y guarda candidatos en Firestore.

#### Archivos a crear
- `app/api/admin/deteccion/basurales/route.ts` — POST protegido con `requireAdminAuth`.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Firebase Admin SDK, repo `transparencia-chaco-website`. Leer primero: `lib/satelital/copernicus.ts`, `lib/satelital/tiff.ts`, `lib/satelital/geo.ts`, `types/basurales.ts`, `lib/api/admin-auth.ts`, y `app/api/admin/calles/route.ts` como modelo de estructura de route.

Crear `app/api/admin/deteccion/basurales/route.ts` con `export const maxDuration = 60` y un POST que:

1. `requireAdminAuth`.
2. Body Zod: `{ ciudadSlug: string, ciudadNombre: string, departamento?: string, bbox: { lonMin, latMin, lonMax, latMax } (numbers, validar lonMin<lonMax y latMin<latMax y que el bbox no supere ~0.15 grados de lado para limitar tamaño), fechaDesde: string fecha, fechaHasta: string fecha, minPixeles?: number (default 6), maxNubes?: number (default 20) }`.
3. `buscarEscenas(bbox, fechaDesde, fechaHasta, maxNubes, 1)` — si no hay escenas, responder 404 `{ error: "Sin escenas Sentinel-2 disponibles sin nubes en ese rango" }`. Guardar `escenaId` y `fecha` de la primera.
4. Calcular `width/height` del raster a 10 m/px: `width = round((lonMax-lonMin) * 111320 * cos(latCentro) / 10)`, `height = round((latMax-latMin) * 110540 / 10)`, clampear ambos a máx 1500.
5. `obtenerMascaraBasural(...)` → `parseTiff` → `agruparPixeles(width, height, (x,y) => raster.get(x,y,0) >= 1, minPixeles)`.
6. Por cluster: `clusterAPoligono` → anillo; `areaAnilloM2`; descartar área < 1000 m². Si quedan más de 40 clusters, responder 422 `{ error: "Demasiados candidatos — la zona necesita umbrales más estrictos", candidatos: <n> }` sin escribir nada (protección contra falsos positivos masivos, p. ej. campo arado).
7. Dedupe: leer docs existentes de `basurales` con ese `ciudadSlug` (Admin SDK, hasta 500). Para cada candidato nuevo, si el centroide cae dentro del bbox (con margen de 30 m) del `geometry` de un existente NO descartado, saltearlo y contarlo como `duplicados`.
8. Crear cada candidato en `basurales` con: campos denormalizados de ciudad, `geometry: { type: "Polygon", coordinates: [anillo] }`, `areaM2` redondeada, `fechaDeteccionISO` = fecha de la escena, `escenaId`, `estadoVerificacion: "candidato"`, `fuente: "modelo_espectral"`, `confianza: 0.5` fijo (el evalscript es binario; documentar en comentario), `publico: false`, `createdAt/updatedAt` serverTimestamp, `historial` inicial (mismo formato que el POST del CRUD).
9. Responder `{ escenaId, fecha, candidatosCreados, duplicados, descartadosPorArea }`.

Manejo de errores: try/catch global → 500 con `console.error`; errores de credenciales CDSE → 500 `{ error: "Configuracion CDSE faltante o invalida" }`.

NO crear UI. NO modificar el CRUD (Agente A lo hace en paralelo — no tocar sus archivos). Criterio de éxito: el route existe, compila conceptualmente y cubre los pasos 1–9.

---

### Agente C — Clasificación espectral de calles (sugerencias)
**Puede ejecutarse en paralelo con:** Agentes A, B y D
**Depende de:** Ola 1 completa (usa `lib/satelital/*`)

#### Objetivo
Extender el tipo `CalleMunicipio` con campos de sugerencia satelital y crear el endpoint que muestrea las geometrías existentes y escribe la sugerencia en cada tramo.

#### Archivos a modificar
- `types/calles.ts` — agregar campos de sugerencia.
- `lib/firebase/calles.ts` — normalizar los campos nuevos en `normalizeCalle`.

#### Archivos a crear
- `app/api/admin/deteccion/calles/route.ts` — POST protegido.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Firebase Admin SDK, repo `transparencia-chaco-website`. Leer: `types/calles.ts`, `lib/firebase/calles.ts`, `lib/satelital/copernicus.ts`, `lib/satelital/tiff.ts`, `lib/satelital/geo.ts`, `lib/api/admin-auth.ts`.

**1. `types/calles.ts`** — agregar a la interfaz `CalleMunicipio` (todos opcionales, al final, antes de `createdAt`):

```typescript
sugerenciaSuperficie?: "asfaltada" | "no_asfaltada" | "sin_dato"
sugerenciaConfianza?: number      // 0-1
sugerenciaFechaISO?: string       // fecha de la escena usada
sugerenciaDetalle?: string        // ej: "8/10 puntos oscuros (asfalto probable)"
```

**2. `lib/firebase/calles.ts`** — en `normalizeCalle`, mapear los 4 campos nuevos (mismo estilo defensivo que el resto).

**3. `app/api/admin/deteccion/calles/route.ts`** — `export const maxDuration = 60`, POST que:

1. `requireAdminAuth`.
2. Body Zod: `{ ciudadSlug: string, fechaDesde: string, fechaHasta: string, maxNubes?: number (default 20) }`.
3. Leer de `calles_municipio` (Admin SDK) los docs con ese `ciudadSlug` que tengan `geometry` con ≥ 2 coordenadas. Si no hay ninguno, 404 `{ error: "No hay tramos con geometria para esa ciudad" }`.
4. `bboxDeCoordenadas` de TODAS las coordenadas de todos los tramos, margen 0.002 grados. Calcular width/height a 10 m/px (misma fórmula que detección de basurales, clamp 1500).
5. `buscarEscenas` (si no hay → 404) + `obtenerBandasCalles` → `parseTiff` (4 bandas FLOAT32: B02, B03, B04, B08).
6. Por cada tramo: `muestrearLineString(geometry.coordinates, 15)` → por cada punto `lonLatAPixel` → leer las 4 bandas. Clasificar cada punto:
   - `brillo = (B02+B03+B04)/3`; `ndvi = (B08-B04)/(B08+B04+1e-10)`.
   - **Punto asfalto:** `brillo < 0.11` y `ndvi < 0.3` (superficie oscura no vegetada).
   - **Punto suelo:** `brillo >= 0.17` y `B04 > B02` (suelo brillante rojizo — tierra/ripio del Chaco).
   - Resto: indefinido (vegetación de veredas/árboles que tapa la calle a 10 m/px es esperable).
7. Sugerencia del tramo: si ≥ 60% de los puntos definidos son asfalto → `"asfaltada"`; si ≥ 60% son suelo → `"no_asfaltada"`; si hay < 3 puntos definidos o ninguna mayoría → `"sin_dato"`. `sugerenciaConfianza` = proporción de la mayoría (0 si sin_dato). `sugerenciaDetalle` = ej. `"7/9 puntos oscuros (asfalto probable)"`.
8. Escribir en cada doc SOLO los 4 campos `sugerencia*` + `updatedAt` (batch de Firestore, hasta 400 por batch). PROHIBIDO tocar `estadoSuperficie`, `historial` o cualquier otro campo — la sugerencia nunca pisa el dato relevado.
9. Responder `{ escenaId, fecha, tramosAnalizados, sugerenciasAsfaltada, sugerenciasNoAsfaltada, sinDato }`.

Documentar en comentario de cabecera del route: "Sentinel-2 10 m/px: una calle ≈ 1 pixel. La clasificación es una sugerencia a verificar por el admin; no distingue ripio de tierra."

NO tocar la página admin de calles ni el CRUD de calles. Criterio de éxito: tipos extendidos, normalizador actualizado, route con los pasos 1–9.

---

### Agente D — Lib cliente pública de basurales
**Puede ejecutarse en paralelo con:** Agentes A, B y C
**Depende de:** Ola 1 completa (usa `types/basurales.ts`)

#### Objetivo
Lectura pública de `basurales` desde Firebase cliente + cálculo de métricas, espejo de `lib/firebase/calles.ts`.

#### Archivos a crear
- `lib/firebase/basurales.ts` — `getBasurales(filtros?)` + `calcularMetricasBasurales(...)`.

#### Prompt completo para el agente
Proyecto Next.js + Firebase cliente, repo `transparencia-chaco-website`. Modelo exacto: `lib/firebase/calles.ts` (guard `hasFirebaseClientConfig`, query `orderBy("createdAt","desc")` + `limit(500)`, normalizador defensivo campo por campo, filtro `publico` client-side, catch → `[]`). Tipos en `types/basurales.ts`.

Crear `lib/firebase/basurales.ts`:
- `normalizeBasural(docId, data)` privado — normalizar TODOS los campos de la interfaz `Basural` con el mismo estilo defensivo (`String(...)`, `Number(...)`, geometría validando `type === "Polygon"` y arrays de pares numéricos).
- `export async function getBasurales(filtros?: BasuralFiltros): Promise<Basural[]>` — colección `basurales`, filtra `publico === true` SIEMPRE, después `ciudadSlug`, `estadoVerificacion` y `anio` (comparando contra `fechaDeteccionISO.slice(0,4)`).
- `export function calcularMetricasBasurales(basurales: Basural[]): BasuralesMetricas` — total, candidatos, verificados (`verificado_foto` + `verificado_campo`), erradicados, descartados, `areaTotalM2`, `areaVerificadaM2` (solo verificados), `conReclamo` (con `reclamoId`).

NO crear páginas ni componentes. Criterio de éxito: firmas exactas, sin usar `where()` de Firestore (filtros client-side como calles, para no requerir índices).

---

## Ola 3 — Frontend (admin + público + navegación)
> Ejecutar SOLO después de que Ola 2 esté completa
> Ejecutar Agente A + Agente B + Agente C + Agente D en PARALELO

### Agente A — ABM `/admin/basurales` con detección y flujo de verificación
**Puede ejecutarse en paralelo con:** Agentes B, C y D
**Depende de:** Ola 2 completa

#### Objetivo
Página admin completa: tabla con tabs por estado de verificación, formulario de alta/edición con editor de polígono en mapa, botón "Ejecutar detección satelital" y acción "Generar reclamo".

#### Archivos a crear
- `components/mapa/editor-poligono-basural.tsx` — editor Leaflet para dibujar/editar el polígono con clicks.
- `app/admin/basurales/page.tsx` — ABM.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Firebase Auth cliente + shadcn/Radix + Tailwind + Leaflet, repo `transparencia-chaco-website`. Modelos exactos a leer: `app/admin/calles/page.tsx` (auth guard con `subscribeAuthState`, `getIdToken` en headers Bearer, Dialog + React Hook Form + Zod, tabla, AlertDialog de borrado, toggle público) y `components/mapa/editor-tramo-calle.tsx` (patrón de editor Leaflet con `dynamic import` sin SSR, clicks sobre el mapa). Tipos: `types/basurales.ts`. APIs ya existentes: `GET/POST /api/admin/basurales`, `PATCH/DELETE /api/admin/basurales/[id]`, `POST /api/admin/deteccion/basurales`, `POST /api/admin/reclamos` (leer su schema en `app/api/admin/reclamos/route.ts`). Ciudades con `getCiudadesActivas()` de `lib/firebase/ciudades.ts`.

**`components/mapa/editor-poligono-basural.tsx`:** adaptar el patrón de `editor-tramo-calle.tsx` a polígonos: cada click agrega un vértice, se dibuja el polígono en construcción, botones "Cerrar polígono", "Deshacer último punto" y "Limpiar". Props: `value?: [number, number][][]` (GeoJSON Polygon coordinates), `onChange(coordinates)`, `centro?: [lat, lng]`. Recordar que GeoJSON es `[lon, lat]` y Leaflet `[lat, lng]` — convertir en el borde del componente.

**`app/admin/basurales/page.tsx`:**
- Tabs (Radix Tabs, ya hay ejemplos en `/admin/medios`): "Candidatos" (`estadoVerificacion === "candidato"`), "Verificados" (`verificado_foto`/`verificado_campo`), "Erradicados", "Descartados", "Todos".
- Tabla: Fecha detección | Nombre/Ubicación | Ciudad | Área (m²) | Fuente | Estado | Público | Reclamo | Acciones.
- Form (Dialog + RHF + Zod espejo del schema del POST): ciudad (Select desde `getCiudadesActivas`, denormalizando `ciudadNombre`/`departamento`/`provincia` al guardar), nombre, descripción, ubicación, barrio, gravedad, estadoVerificacion, fuente, fechaDeteccionISO (date), evidenciaUrl, fotoUrl, observaciones, publico (Checkbox), y el editor de polígono (al cerrar el polígono, calcular área client-side no hace falta — la manda 0 y el admin puede editarla; si viene del detector ya trae área).
- Card superior "Detección satelital": Select de ciudad, inputs fechaDesde/fechaHasta (default: últimos 90 días), campo bbox editable con 4 inputs numéricos (precargar bbox aproximado de Charata: lonMin -61.24, latMin -27.24, lonMax -61.16, latMax -27.18) y botón "Ejecutar detección" → POST `/api/admin/deteccion/basurales` → toast con `candidatosCreados/duplicados` y recarga de tabla.
- Acciones por fila: Editar, Eliminar (AlertDialog), toggle Público, y para candidatos: "Verificar" (abre el form con estadoVerificacion preseleccionado) y "Descartar" (PATCH directo a `estadoVerificacion: "descartado"`).
- Acción "Generar reclamo" (solo en verificados sin `reclamoId`): POST a `/api/admin/reclamos` con `{ ciudadSlug, ciudadNombre, departamento, provincia, enteResponsable: "servicios_publicos", tipo: "reclamo", prioridad: "alta", titulo: "Basural a cielo abierto: " + (nombre || ubicacionTexto || "sin nombre"), descripcion: descripcion || "Basural detectado y verificado por el observatorio (" + Math.round(areaM2) + " m2)", ubicacionTexto, publico: false, estado: "pendiente" }` — ajustar al schema real que leas en el route de reclamos. Con el id devuelto, PATCH al basural con `reclamoId`. Toast de éxito.

NO tocar navegación (sidebar/dashboard — lo hace el Agente D). NO tocar la página pública. Criterio de éxito: página completa con los flujos candidato→verificar→publicar→reclamo operables desde la tabla.

---

### Agente B — Página pública `/basurales` + mapa
**Puede ejecutarse en paralelo con:** Agentes A, C y D
**Depende de:** Ola 2 completa

#### Objetivo
Página pública con métricas, filtros, tabla y mapa Leaflet de polígonos coloreados por estado, mostrando SOLO registros públicos.

#### Archivos a crear
- `components/mapa/mapa-basurales.tsx` — mapa Leaflet de polígonos.
- `app/basurales/page.tsx` — página pública.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Tailwind + Leaflet, repo `transparencia-chaco-website`, identidad visual teal/cristal con bloques blancos y celestes (ver `app/calles-pavimento/page.tsx` como modelo integral: carga client-side desde lib de Firebase, filtros por municipio/año, cards de métricas, tabla, mapa con `dynamic import` sin SSR, estados vacíos honestos). Datos: `getBasurales` y `calcularMetricasBasurales` de `lib/firebase/basurales.ts`; labels de `types/basurales.ts`.

**`components/mapa/mapa-basurales.tsx`:** modelo `components/mapa/mapa-calles-pavimento.tsx`, pero con `Polygon` de Leaflet en vez de líneas. Colores por `estadoVerificacion`: candidato ámbar, verificado_* rojo, erradicado verde, descartado no se muestra. Popup: nombre/ubicación, área m², fecha detección, fuente (label), estado (label), y si `fotoUrl` un link "Ver foto". Recordar conversión GeoJSON `[lon,lat]` → Leaflet `[lat,lng]`.

**`app/basurales/page.tsx`:**
- Header centrado: título "Basurales a Cielo Abierto", bajada explicando que el observatorio detecta sitios con imágenes satelitales Sentinel-2 y los verifica con evidencia antes de publicarlos (metodología en positivo, consistente con la portada).
- Métricas: total publicados, verificados, erradicados, área total (m² o ha si > 10.000).
- Filtros: municipio (Select con ciudades activas de `getCiudadesActivas`), año, estado de verificación.
- Bloque metodología corto: "Cómo detectamos" — 3 pasos (satélite propone → vecinos y observatorio verifican → se reclama al municipio y se monitorea la erradicación). Mencionar inspiración en el detector de basurales de Fractal/Fundación Bunge y Born con link a `https://fractalargentina.org/`.
- Tabla detalle + mapa (dynamic import).
- Estado vacío honesto si no hay registros públicos.

Solo registros con `publico === true` (la lib ya filtra). NO tocar navegación ni admin. Criterio de éxito: página renderiza con datos vacíos sin romper, mapa solo client-side.

---

### Agente C — Sugerencias satelitales en `/admin/calles`
**Puede ejecutarse en paralelo con:** Agentes A, B y D
**Depende de:** Ola 2 completa

#### Objetivo
Integrar la clasificación espectral al ABM de calles: botón para ejecutarla, columna de sugerencia y acción "Aceptar sugerencia".

#### Archivos a modificar
- `app/admin/calles/page.tsx` — único archivo.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript, repo `transparencia-chaco-website`. Leer `app/admin/calles/page.tsx` completo antes de tocar (es un ABM grande con RHF + Zod + tabla + editor de mapa). Tipos extendidos en `types/calles.ts` (`sugerenciaSuperficie`, `sugerenciaConfianza`, `sugerenciaFechaISO`, `sugerenciaDetalle` — ya existen). Endpoint nuevo: `POST /api/admin/deteccion/calles` con body `{ ciudadSlug, fechaDesde, fechaHasta }` (Bearer token igual que el resto).

Cambios, manteniendo el estilo existente de la página:
1. Botón "Clasificar con satélite" junto a los controles superiores: abre un Dialog chico con Select de ciudad + fechas (default últimos 90 días) + botón ejecutar → POST al endpoint → toast con `tramosAnalizados` y conteos → recargar la tabla.
2. Columna nueva "Sugerencia sat." en la tabla: si el tramo tiene `sugerenciaSuperficie`, badge (verde "Asfaltada" / ámbar "No asfaltada" / gris "Sin dato") con `title={sugerenciaDetalle}`; si la sugerencia difiere de `estadoSuperficie` actual, resaltar el badge con un anillo (ring) para que el admin lo note.
3. Acción por fila "Aceptar sugerencia" (solo visible si hay sugerencia definida y difiere del estado actual): PATCH al tramo mapeando `"asfaltada"` → `estadoSuperficie: "asfaltada"` y `"no_asfaltada"` → `estadoSuperficie: "tierra"` (el admin puede refinarlo a ripio manualmente después), con confirm dialog simple. Recargar tras aceptar.

NO tocar el endpoint, ni los tipos, ni otros archivos. NO cambiar la lógica existente de alta/edición. Criterio de éxito: `rg "sugerenciaSuperficie" app/admin/calles/page.tsx` con hits en tabla y acción.

---

### Agente D — Navegación, dashboard y capa en mapa ciudadano
**Puede ejecutarse en paralelo con:** Agentes A, B y C
**Depende de:** Ola 2 completa

#### Objetivo
Cablear el módulo en toda la navegación: menú público, footer, sidebar admin, dashboard admin y capa opcional de basurales en `/mapa-ciudadano`.

#### Archivos a modificar
- `components/navbar.tsx` — entrada "Basurales" en el dropdown Observatorio.
- `components/footer.tsx` — link `/basurales` en la columna correspondiente.
- `components/admin/admin-shell.tsx` — item "Basurales" (icono `Trash2` de lucide) en Gestión de Contenido.
- `app/admin/dashboard/page.tsx` — card "Basurales" con la misma estética de las existentes.
- `components/mapa/mapa-ciudadano.tsx` y `app/mapa-ciudadano/page.tsx` — capa opcional de polígonos de basurales públicos (mismo patrón con el que se integró la capa de calles; leer cómo se hizo y replicarlo usando `getBasurales` de `lib/firebase/basurales.ts`).

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript, repo `transparencia-chaco-website`. El módulo nuevo tiene: página pública `/basurales`, admin `/admin/basurales`, lib `lib/firebase/basurales.ts`, tipos `types/basurales.ts`.

1. `components/navbar.tsx`: leer la estructura del dropdown Observatorio y agregar "Basurales" apuntando a `/basurales`, después de "Calles y Pavimento" si existe esa entrada. Respetar el patrón desktop + mobile (panel con `details`).
2. `components/footer.tsx`: agregar el link en la misma columna donde está Calles y Pavimento.
3. `components/admin/admin-shell.tsx`: item "Basurales" → `/admin/basurales`, icono `Trash2` (verificar que `lucide-react@0.454.0` lo exporta — sí existe; NO usar iconos exóticos, ya hubo un deploy roto por `Road`).
4. `app/admin/dashboard/page.tsx`: card "Basurales" (título, descripción corta "Detección satelital y verificación de basurales a cielo abierto", link a `/admin/basurales`, icono `Trash2`), misma estética que las cards existentes.
5. Capa en mapa ciudadano: leer `components/mapa/mapa-ciudadano.tsx` y `app/mapa-ciudadano/page.tsx` para ver cómo se integró la capa opcional de calles; replicar el patrón con un toggle "Basurales" que carga `getBasurales()` y pinta `Polygon` rojos (verificados) y ámbar (candidatos NO se muestran en el mapa público — solo `publico === true`, que la lib ya garantiza; colorear por estado con los mismos colores que `mapa-basurales.tsx`: verificados rojo, erradicados verde).

NO tocar las páginas nuevas (`/basurales`, `/admin/basurales` — otros agentes las escriben en paralelo). Criterio de éxito: `rg "/basurales" components/ app/admin/dashboard app/mapa-ciudadano` muestra los 5 puntos cableados.

---

## Ola 4 — Cierre (verificación, documentación, commit)
> Ejecutar SOLO después de que Ola 3 esté completa

### Agente A — Verificación integral y documentación
**Puede ejecutarse en paralelo con:** nadie (único)
**Depende de:** Ola 3 completa

#### Objetivo
Revisar consistencia de todo lo generado, actualizar la documentación del proyecto y dejar el trabajo commiteado y pusheado.

#### Archivos a modificar
- `reports/ARQUITECTURA_DATOS.md` — sección de la colección `basurales` (campos, API, páginas) + campos `sugerencia*` en la doc de `calles_municipio`.
- `reports/HANDOFF_ACTUAL.md` — entrada nueva con lo hecho, pendientes y riesgos.

#### Prompt completo para el agente
Repo `transparencia-chaco-website` clonado en `D:` SIN `node_modules` — regla operativa: NO correr pnpm/npm; validar solo con controles livianos.

1. **Consistencia de imports y firmas:** con `rg`, verificar que (a) todos los imports de `types/basurales`, `lib/satelital/*` y `lib/firebase/basurales` apuntan a archivos existentes; (b) las firmas usadas en los routes coinciden con las exportadas en `lib/satelital/copernicus.ts` y `lib/satelital/geo.ts`; (c) no quedó ningún icono lucide inexistente (`rg "from \"lucide-react\"" -A 2` en archivos nuevos y validar contra iconos conocidos); (d) `rg "estadoSuperficie" app/api/admin/deteccion/calles/route.ts` confirma que el endpoint NO escribe ese campo.
2. **Revisión de diff:** `git status --short`, `git diff --check`.
3. **Documentación:** actualizar `reports/ARQUITECTURA_DATOS.md` (nueva sección `### basurales` con la tabla de campos siguiendo el formato de las demás, APIs `/api/admin/basurales` y `/api/admin/deteccion/*`, páginas `/basurales` y `/admin/basurales`) y `reports/HANDOFF_ACTUAL.md` (entrada "Actualizacion 2026-07-13 — Detector satelital propio" con: qué se construyó, decisión de cero dependencias, pendientes y riesgos listados abajo).
4. **Pendientes a dejar registrados en el handoff:**
   - Crear OAuth client en dashboard CDSE y cargar `CDSE_CLIENT_ID`/`CDSE_CLIENT_SECRET` en `.env.local` y en Vercel (se puede reusar el client de SIG-Agro).
   - `firebase deploy --only firestore:rules` (regla nueva de `basurales`).
   - Calibrar umbrales del evalscript (NDVI 0.2 / BSI 0.05) y de calles (brillo 0.11/0.17) con la primera corrida real sobre Charata — son valores iniciales razonables, no calibrados localmente.
   - Falsos positivos esperables: canteras, campos arados, playones de tierra. El flujo candidato→descartado existe justamente para eso.
   - Escalón futuro: clasificador liviano (regresión logística sobre bandas) entrenado con los candidatos verificados/descartados como etiquetas, inferencia en TS.
5. **Commit y push:** `git add` selectivo de los archivos del feature, commit `feat(satelital): detector propio de basurales + clasificacion espectral de calles`, `git push origin main`. La validación pesada (type-check/build) queda para el deploy automático de Vercel — revisar el build en Vercel tras el push y corregir si falla.

Criterio de éxito: docs actualizadas, working tree limpio, push hecho.

---

## Verificación final

- [ ] `types/basurales.ts`, `lib/satelital/{copernicus,tiff,geo}.ts` y `lib/firebase/basurales.ts` existen y no importan dependencias externas nuevas (`rg "from \"@turf|from \"geotiff" lib/` sin resultados).
- [ ] `package.json` y `pnpm-lock.yaml` SIN cambios (regla cero dependencias).
- [ ] `POST /api/admin/basurales` y `POST /api/admin/deteccion/basurales` devuelven 401 sin token.
- [ ] El endpoint de detección crea docs con `estadoVerificacion: "candidato"` y `publico: false` — nunca publica solo.
- [ ] El endpoint de calles escribe SOLO campos `sugerencia*` y nunca `estadoSuperficie`.
- [ ] `/admin/basurales`: crear manual, ejecutar detección, verificar, descartar, publicar y generar reclamo (aparece en `/admin/reclamos`).
- [ ] `/basurales` pública muestra solo `publico === true` y renderiza vacía sin romper.
- [ ] `/admin/calles` muestra columna de sugerencia y "Aceptar sugerencia" actualiza `estadoSuperficie`.
- [ ] Capa "Basurales" visible en `/mapa-ciudadano`; navbar, footer, sidebar y dashboard cableados.
- [ ] `firestore.rules` con bloque `basurales` — deploy manual pendiente anotado en handoff.
- [ ] Env vars CDSE documentadas en `.env.example` y cargadas en Vercel antes de usar la detección.
- [ ] Build de Vercel verde tras el push.
