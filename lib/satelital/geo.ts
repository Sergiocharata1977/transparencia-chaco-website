// Utilidades geométricas sin dependencias: conversión píxel/lon-lat, clustering de máscaras,
// hull convexo, área aproximada y muestreo de polilíneas. Reemplaza el uso de turf/GDAL.

export interface BboxGeo {
  lonMin: number
  latMin: number
  lonMax: number
  latMax: number
}

export interface ClusterPixeles {
  pixeles: Array<{ x: number; y: number }>
  count: number
}

const METROS_POR_GRADO_LON = 111320
const METROS_POR_GRADO_LAT = 110540

function gradosARadianes(grados: number): number {
  return (grados * Math.PI) / 180
}

function metrosPorGradoLon(lat: number): number {
  return METROS_POR_GRADO_LON * Math.cos(gradosARadianes(lat))
}

function distanciaMetros(a: [number, number], b: [number, number]): number {
  const latMedia = (a[1] + b[1]) / 2
  const dx = (b[0] - a[0]) * metrosPorGradoLon(latMedia)
  const dy = (b[1] - a[1]) * METROS_POR_GRADO_LAT
  return Math.sqrt(dx * dx + dy * dy)
}

// El centro del píxel (x, y). Fila 0 es el NORTE del raster (latitud máxima).
export function pixelALonLat(x: number, y: number, width: number, height: number, bbox: BboxGeo): [number, number] {
  if (width <= 0 || height <= 0) return [bbox.lonMin, bbox.latMax]

  const lon = bbox.lonMin + ((x + 0.5) / width) * (bbox.lonMax - bbox.lonMin)
  const lat = bbox.latMax - ((y + 0.5) / height) * (bbox.latMax - bbox.latMin)
  return [lon, lat]
}

export function lonLatAPixel(
  lon: number,
  lat: number,
  width: number,
  height: number,
  bbox: BboxGeo,
): { x: number; y: number } {
  if (width <= 0 || height <= 0) return { x: 0, y: 0 }

  const spanLon = bbox.lonMax - bbox.lonMin
  const spanLat = bbox.latMax - bbox.latMin
  if (spanLon === 0 || spanLat === 0) return { x: 0, y: 0 }

  const xCrudo = Math.floor(((lon - bbox.lonMin) / spanLon) * width)
  const yCrudo = Math.floor(((bbox.latMax - lat) / spanLat) * height)

  return {
    x: Math.min(width - 1, Math.max(0, xCrudo)),
    y: Math.min(height - 1, Math.max(0, yCrudo)),
  }
}

// Componentes conexas 4-conectividad con flood-fill iterativo (pila explícita, sin recursión).
export function agruparPixeles(
  width: number,
  height: number,
  esMascara: (x: number, y: number) => boolean,
  minPixeles: number,
): ClusterPixeles[] {
  if (width <= 0 || height <= 0) return []

  const visitados = new Uint8Array(width * height)
  const clusters: ClusterPixeles[] = []

  for (let y0 = 0; y0 < height; y0 += 1) {
    for (let x0 = 0; x0 < width; x0 += 1) {
      const inicio = y0 * width + x0
      if (visitados[inicio] === 1) continue
      visitados[inicio] = 1
      if (!esMascara(x0, y0)) continue

      const pixeles: Array<{ x: number; y: number }> = []
      const pila: number[] = [inicio]

      while (pila.length > 0) {
        const indice = pila.pop() as number
        const x = indice % width
        const y = (indice - x) / width
        pixeles.push({ x, y })

        if (x > 0) {
          const vecino = indice - 1
          if (visitados[vecino] === 0) {
            visitados[vecino] = 1
            if (esMascara(x - 1, y)) pila.push(vecino)
          }
        }
        if (x < width - 1) {
          const vecino = indice + 1
          if (visitados[vecino] === 0) {
            visitados[vecino] = 1
            if (esMascara(x + 1, y)) pila.push(vecino)
          }
        }
        if (y > 0) {
          const vecino = indice - width
          if (visitados[vecino] === 0) {
            visitados[vecino] = 1
            if (esMascara(x, y - 1)) pila.push(vecino)
          }
        }
        if (y < height - 1) {
          const vecino = indice + width
          if (visitados[vecino] === 0) {
            visitados[vecino] = 1
            if (esMascara(x, y + 1)) pila.push(vecino)
          }
        }
      }

      if (pixeles.length >= minPixeles) clusters.push({ pixeles, count: pixeles.length })
    }
  }

  return clusters
}

function rectanguloDeCluster(
  cluster: ClusterPixeles,
  width: number,
  height: number,
  bbox: BboxGeo,
): [number, number][] {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  for (const pixel of cluster.pixeles) {
    if (pixel.x < minX) minX = pixel.x
    if (pixel.x > maxX) maxX = pixel.x
    if (pixel.y < minY) minY = pixel.y
    if (pixel.y > maxY) maxY = pixel.y
  }

  if (!Number.isFinite(minX) || width <= 0 || height <= 0) {
    return [
      [bbox.lonMin, bbox.latMin],
      [bbox.lonMax, bbox.latMin],
      [bbox.lonMax, bbox.latMax],
      [bbox.lonMin, bbox.latMax],
      [bbox.lonMin, bbox.latMin],
    ]
  }

  const spanLon = bbox.lonMax - bbox.lonMin
  const spanLat = bbox.latMax - bbox.latMin

  // Bordes exteriores de los píxeles extremos, para que un cluster de 1 píxel tenga área.
  const lonIzq = bbox.lonMin + (minX / width) * spanLon
  const lonDer = bbox.lonMin + ((maxX + 1) / width) * spanLon
  const latNorte = bbox.latMax - (minY / height) * spanLat
  const latSur = bbox.latMax - ((maxY + 1) / height) * spanLat

  return [
    [lonIzq, latSur],
    [lonDer, latSur],
    [lonDer, latNorte],
    [lonIzq, latNorte],
    [lonIzq, latSur],
  ]
}

function cruz(o: [number, number], a: [number, number], b: [number, number]): number {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
}

// Hull convexo por monotone chain (Andrew).
function hullConvexo(puntos: [number, number][]): [number, number][] {
  const ordenados = puntos
    .slice()
    .sort((a, b) => (a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]))
    .filter((punto, indice, lista) => indice === 0 || punto[0] !== lista[indice - 1][0] || punto[1] !== lista[indice - 1][1])

  if (ordenados.length < 3) return ordenados

  const inferior: [number, number][] = []
  for (const punto of ordenados) {
    while (inferior.length >= 2 && cruz(inferior[inferior.length - 2], inferior[inferior.length - 1], punto) <= 0) {
      inferior.pop()
    }
    inferior.push(punto)
  }

  const superior: [number, number][] = []
  for (let i = ordenados.length - 1; i >= 0; i -= 1) {
    const punto = ordenados[i]
    while (superior.length >= 2 && cruz(superior[superior.length - 2], superior[superior.length - 1], punto) <= 0) {
      superior.pop()
    }
    superior.push(punto)
  }

  inferior.pop()
  superior.pop()
  return inferior.concat(superior)
}

// Anillo GeoJSON cerrado (primer punto repetido al final).
export function clusterAPoligono(
  cluster: ClusterPixeles,
  width: number,
  height: number,
  bbox: BboxGeo,
): [number, number][] {
  if (cluster.pixeles.length < 3) return rectanguloDeCluster(cluster, width, height, bbox)

  const puntos = cluster.pixeles.map((pixel) => pixelALonLat(pixel.x, pixel.y, width, height, bbox))
  const hull = hullConvexo(puntos)
  if (hull.length < 3) return rectanguloDeCluster(cluster, width, height, bbox)

  const anillo = hull.slice()
  anillo.push([hull[0][0], hull[0][1]])
  return anillo
}

// Shoelace sobre coordenadas proyectadas a metros planos con corrección por latitud.
export function areaAnilloM2(anillo: [number, number][]): number {
  if (anillo.length < 3) return 0

  const cerrado =
    anillo[0][0] === anillo[anillo.length - 1][0] && anillo[0][1] === anillo[anillo.length - 1][1]
  const puntos = cerrado ? anillo.slice(0, -1) : anillo
  if (puntos.length < 3) return 0

  let sumaLat = 0
  for (const punto of puntos) sumaLat += punto[1]
  const latPromedio = sumaLat / puntos.length
  const escalaLon = metrosPorGradoLon(latPromedio)

  let suma = 0
  for (let i = 0; i < puntos.length; i += 1) {
    const actual = puntos[i]
    const siguiente = puntos[(i + 1) % puntos.length]
    const x1 = actual[0] * escalaLon
    const y1 = actual[1] * METROS_POR_GRADO_LAT
    const x2 = siguiente[0] * escalaLon
    const y2 = siguiente[1] * METROS_POR_GRADO_LAT
    suma += x1 * y2 - x2 * y1
  }

  return Math.abs(suma) / 2
}

// Puntos cada pasoMetros a lo largo de la polilínea, incluyendo siempre el primero y el último.
export function muestrearLineString(coordinates: [number, number][], pasoMetros: number): [number, number][] {
  if (coordinates.length === 0) return []
  if (coordinates.length === 1 || !(pasoMetros > 0)) return coordinates.map((punto) => [punto[0], punto[1]])

  const muestras: [number, number][] = [[coordinates[0][0], coordinates[0][1]]]
  let restante = pasoMetros

  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const a = coordinates[i]
    const b = coordinates[i + 1]
    const largo = distanciaMetros(a, b)
    if (largo === 0) continue

    let recorrido = 0
    while (recorrido + restante <= largo) {
      recorrido += restante
      const t = recorrido / largo
      muestras.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t])
      restante = pasoMetros
    }
    restante -= largo - recorrido
  }

  const ultimo = coordinates[coordinates.length - 1]
  const emitido = muestras[muestras.length - 1]
  if (emitido[0] !== ultimo[0] || emitido[1] !== ultimo[1]) muestras.push([ultimo[0], ultimo[1]])

  return muestras
}

export function bboxDeCoordenadas(coords: [number, number][], margenGrados: number): BboxGeo {
  if (coords.length === 0) {
    return {
      lonMin: -margenGrados,
      latMin: -margenGrados,
      lonMax: margenGrados,
      latMax: margenGrados,
    }
  }

  let lonMin = Number.POSITIVE_INFINITY
  let latMin = Number.POSITIVE_INFINITY
  let lonMax = Number.NEGATIVE_INFINITY
  let latMax = Number.NEGATIVE_INFINITY

  for (const coord of coords) {
    if (coord[0] < lonMin) lonMin = coord[0]
    if (coord[0] > lonMax) lonMax = coord[0]
    if (coord[1] < latMin) latMin = coord[1]
    if (coord[1] > latMax) latMax = coord[1]
  }

  return {
    lonMin: lonMin - margenGrados,
    latMin: latMin - margenGrados,
    lonMax: lonMax + margenGrados,
    latMax: latMax + margenGrados,
  }
}
