/**
 * Cliente del Copernicus Data Space Ecosystem (CDSE) — Sentinel-2 L2A.
 *
 * Cómo funciona:
 * - El cómputo píxel a píxel (NDVI, NDWI, BSI, máscaras) NO se ejecuta en Vercel:
 *   se envía un `evalscript` a la Process API y Copernicus lo corre en sus propios
 *   servidores sobre las escenas originales. Acá solo recibimos el raster resultante.
 * - Las bandas provienen de Sentinel-2 L2A (reflectancia de superficie, corregida
 *   atmosféricamente) con resolución nativa de 10 m/píxel en B02/B03/B04/B08
 *   (B11 es de 20 m y Copernicus la remuestrea al pedirla junto con las de 10 m).
 * - Módulo SOLO server-side: usa CDSE_CLIENT_ID / CDSE_CLIENT_SECRET, que son
 *   secrets de entorno y nunca deben llegar al bundle del cliente.
 *
 * Variables de entorno requeridas:
 *   CDSE_CLIENT_ID
 *   CDSE_CLIENT_SECRET
 *   CDSE_TOKEN_URL (opcional, tiene default)
 */

const TOKEN_URL = process.env.CDSE_TOKEN_URL
  ?? "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"

const STAC_API = "https://stac.dataspace.copernicus.eu/v1/search"
const PROCESS_API = "https://sh.dataspace.copernicus.eu/api/v1/process"

// ── Tipos públicos ───────────────────────────────────────────────────────────

export interface BboxGeo {
  lonMin: number
  latMin: number
  lonMax: number
  latMax: number
}

export interface EscenaDisponible {
  id: string
  fecha: string
  cloudCover: number
}

// ── Auth OAuth2 (client_credentials) con cache en memoria ────────────────────

let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getCopernicusToken(): Promise<string> {
  const ahora = Date.now()

  if (cachedToken && ahora < tokenExpiresAt - 30_000) {
    return cachedToken
  }

  const clientId = process.env.CDSE_CLIENT_ID ?? ""
  const clientSecret = process.env.CDSE_CLIENT_SECRET ?? ""

  if (!clientId || !clientSecret) {
    throw new Error("Faltan CDSE_CLIENT_ID o CDSE_CLIENT_SECRET")
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  })

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  })

  if (!res.ok) {
    throw new Error(`CDSE auth error ${res.status}: ${await res.text()}`)
  }

  const data = (await res.json()) as { access_token: string; expires_in: number }

  cachedToken = data.access_token
  tokenExpiresAt = ahora + data.expires_in * 1000

  return cachedToken
}

async function getCopernicusHeaders(): Promise<Record<string, string>> {
  const token = await getCopernicusToken()
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// ── Evalscripts (se ejecutan en los servidores de Copernicus) ────────────────

/**
 * Máscara binaria de suelo degradado / candidato a basural.
 * 1 banda UINT8: 1 = candidato, 0 = descartado.
 * Criterio: NDVI bajo (sin vegetación) + BSI alto (suelo desnudo) + no agua (NDWI).
 */
const EVALSCRIPT_MASCARA_BASURAL = `
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
`

/**
 * Reflectancia cruda para análisis de calles (asfalto vs. tierra).
 * 4 bandas FLOAT32: B02 (azul), B03 (verde), B04 (rojo), B08 (NIR).
 */
const EVALSCRIPT_BANDAS_CALLES = `
//VERSION=3
function setup() {
  return { input: [{ bands: ["B02","B03","B04","B08"] }], output: { bands: 4, sampleType: "FLOAT32" } }
}
function evaluatePixel(s) { return [s.B02, s.B03, s.B04, s.B08]; }
`

// ── Búsqueda de escenas (STAC) ───────────────────────────────────────────────

export async function buscarEscenas(
  bbox: BboxGeo,
  fechaDesde: string,
  fechaHasta: string,
  maxNubes = 20,
  limite = 5,
): Promise<EscenaDisponible[]> {
  const headers = await getCopernicusHeaders()

  const body = {
    collections: ["sentinel-2-l2a"],
    bbox: [bbox.lonMin, bbox.latMin, bbox.lonMax, bbox.latMax],
    datetime: `${fechaDesde}T00:00:00Z/${fechaHasta}T23:59:59Z`,
    query: { "eo:cloud_cover": { lte: maxNubes } },
    sortby: [{ field: "properties.datetime", direction: "desc" }],
    limit: limite,
  }

  const res = await fetch(STAC_API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`CDSE STAC API error ${res.status}: ${await res.text()}`)
  }

  const data = (await res.json()) as {
    features?: Array<{
      id: string
      properties: { datetime: string; "eo:cloud_cover": number }
    }>
  }

  return (data.features ?? []).map((feature) => ({
    id: feature.id,
    fecha: feature.properties.datetime.split("T")[0],
    cloudCover: feature.properties["eo:cloud_cover"],
  }))
}

// ── Process API (raster GeoTIFF) ─────────────────────────────────────────────

async function procesarImagen(
  bbox: BboxGeo,
  fechaDesde: string,
  fechaHasta: string,
  width: number,
  height: number,
  evalscript: string,
): Promise<ArrayBuffer> {
  const headers = await getCopernicusHeaders()

  const body = {
    input: {
      bounds: {
        bbox: [bbox.lonMin, bbox.latMin, bbox.lonMax, bbox.latMax],
        properties: { crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84" },
      },
      data: [{
        type: "sentinel-2-l2a",
        dataFilter: {
          timeRange: {
            from: `${fechaDesde}T00:00:00Z`,
            to: `${fechaHasta}T23:59:59Z`,
          },
          maxCloudCoverage: 30,
        },
      }],
    },
    output: {
      width,
      height,
      responses: [{ identifier: "default", format: { type: "image/tiff" } }],
    },
    evalscript,
  }

  const res = await fetch(PROCESS_API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    throw new Error(`CDSE Process API error ${res.status}: ${await res.text()}`)
  }

  return res.arrayBuffer()
}

/**
 * GeoTIFF de 1 banda UINT8: máscara binaria de candidatos a basural.
 */
export async function obtenerMascaraBasural(
  bbox: BboxGeo,
  fechaDesde: string,
  fechaHasta: string,
  width: number,
  height: number,
): Promise<ArrayBuffer> {
  return procesarImagen(bbox, fechaDesde, fechaHasta, width, height, EVALSCRIPT_MASCARA_BASURAL)
}

/**
 * GeoTIFF de 4 bandas FLOAT32 (B02, B03, B04, B08) con reflectancia cruda.
 */
export async function obtenerBandasCalles(
  bbox: BboxGeo,
  fechaDesde: string,
  fechaHasta: string,
  width: number,
  height: number,
): Promise<ArrayBuffer> {
  return procesarImagen(bbox, fechaDesde, fechaHasta, width, height, EVALSCRIPT_BANDAS_CALLES)
}
