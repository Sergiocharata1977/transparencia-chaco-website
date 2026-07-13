// Parser TIFF de perfil restringido: cubre exactamente lo que devuelve la Process API de Sentinel Hub
// (sin compresión, strips, chunky). No es un parser TIFF general.

export interface RasterTiff {
  width: number
  height: number
  bands: number
  sampleFormat: "uint" | "float"
  bitsPerSample: number
  get(x: number, y: number, b: number): number
}

const TAG_IMAGE_WIDTH = 256
const TAG_IMAGE_LENGTH = 257
const TAG_BITS_PER_SAMPLE = 258
const TAG_COMPRESSION = 259
const TAG_STRIP_OFFSETS = 273
const TAG_SAMPLES_PER_PIXEL = 277
const TAG_ROWS_PER_STRIP = 278
const TAG_STRIP_BYTE_COUNTS = 279
const TAG_SAMPLE_FORMAT = 339

// Tamaño en bytes de cada tipo de dato TIFF, indexado por el código de tipo.
const TAMANIO_TIPO: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  6: 1, // SBYTE
  7: 1, // UNDEFINED
  8: 2, // SSHORT
  9: 4, // SLONG
  10: 8, // SRATIONAL
  11: 4, // FLOAT
  12: 8, // DOUBLE
}

function leerEscalar(view: DataView, offset: number, tipo: number, little: boolean): number {
  switch (tipo) {
    case 1:
    case 2:
    case 7:
      return view.getUint8(offset)
    case 3:
      return view.getUint16(offset, little)
    case 4:
      return view.getUint32(offset, little)
    case 5:
      return view.getUint32(offset, little) / (view.getUint32(offset + 4, little) || 1)
    case 6:
      return view.getInt8(offset)
    case 8:
      return view.getInt16(offset, little)
    case 9:
      return view.getInt32(offset, little)
    case 10:
      return view.getInt32(offset, little) / (view.getInt32(offset + 4, little) || 1)
    case 11:
      return view.getFloat32(offset, little)
    case 12:
      return view.getFloat64(offset, little)
    default:
      return 0
  }
}

function leerValores(view: DataView, entrada: number, tipo: number, count: number, little: boolean): number[] {
  const tamanio = TAMANIO_TIPO[tipo] ?? 0
  if (tamanio === 0 || count === 0) return []

  const total = tamanio * count
  // Si entra en 4 bytes el valor está inline (justificado a izquierda), si no el campo es un offset.
  const base = total <= 4 ? entrada + 8 : view.getUint32(entrada + 8, little)

  const valores: number[] = []
  for (let i = 0; i < count; i += 1) {
    const offset = base + i * tamanio
    if (offset + tamanio > view.byteLength) break
    valores.push(leerEscalar(view, offset, tipo, little))
  }
  return valores
}

export function parseTiff(buffer: ArrayBuffer): RasterTiff {
  if (buffer.byteLength < 8) throw new Error("TIFF inválido: buffer demasiado corto")

  const view = new DataView(buffer)
  const orden = view.getUint16(0, false)
  if (orden !== 0x4949 && orden !== 0x4d4d) throw new Error("TIFF inválido: byte order desconocido")

  const little = orden === 0x4949
  if (view.getUint16(2, little) !== 42) throw new Error("TIFF inválido: magic number distinto de 42")

  const ifdOffset = view.getUint32(4, little)
  if (ifdOffset <= 0 || ifdOffset + 2 > view.byteLength) throw new Error("TIFF inválido: offset de IFD fuera de rango")

  const entradas = view.getUint16(ifdOffset, little)
  const tags = new Map<number, number[]>()

  for (let i = 0; i < entradas; i += 1) {
    const entrada = ifdOffset + 2 + i * 12
    if (entrada + 12 > view.byteLength) break

    const tag = view.getUint16(entrada, little)
    const tipo = view.getUint16(entrada + 2, little)
    const count = view.getUint32(entrada + 4, little)
    tags.set(tag, leerValores(view, entrada, tipo, count, little))
  }

  const compression = tags.get(TAG_COMPRESSION)?.[0]
  if (compression != null && compression !== 1) throw new Error("TIFF comprimido no soportado")

  const width = tags.get(TAG_IMAGE_WIDTH)?.[0] ?? 0
  const height = tags.get(TAG_IMAGE_LENGTH)?.[0] ?? 0
  if (width <= 0 || height <= 0) throw new Error("TIFF inválido: dimensiones ausentes")

  const bands = tags.get(TAG_SAMPLES_PER_PIXEL)?.[0] ?? 1
  const bitsPerSample = tags.get(TAG_BITS_PER_SAMPLE)?.[0] ?? 8
  const formato = tags.get(TAG_SAMPLE_FORMAT)?.[0] ?? 1
  const sampleFormat: "uint" | "float" = formato === 3 ? "float" : "uint"

  const stripOffsets = tags.get(TAG_STRIP_OFFSETS) ?? []
  if (stripOffsets.length === 0) throw new Error("TIFF inválido: sin StripOffsets")

  const stripByteCounts = tags.get(TAG_STRIP_BYTE_COUNTS) ?? []

  const rowsPerStripRaw = tags.get(TAG_ROWS_PER_STRIP)?.[0] ?? height
  const rowsPerStrip = rowsPerStripRaw > 0 && rowsPerStripRaw < height ? rowsPerStripRaw : height

  const bytesPerSample = Math.floor(bitsPerSample / 8)
  if (bytesPerSample <= 0) throw new Error("TIFF no soportado: bitsPerSample menor a 8")

  if (sampleFormat === "float" && bitsPerSample !== 32 && bitsPerSample !== 64) {
    throw new Error("TIFF no soportado: float de " + bitsPerSample + " bits")
  }
  if (sampleFormat === "uint" && bitsPerSample !== 8 && bitsPerSample !== 16 && bitsPerSample !== 32) {
    throw new Error("TIFF no soportado: uint de " + bitsPerSample + " bits")
  }

  const bytesPorFila = width * bands * bytesPerSample

  function get(x: number, y: number, b: number): number {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(b)) return 0

    const px = Math.trunc(x)
    const py = Math.trunc(y)
    const pb = Math.trunc(b)
    if (px < 0 || px >= width || py < 0 || py >= height || pb < 0 || pb >= bands) return 0

    const strip = Math.floor(py / rowsPerStrip)
    const inicio = stripOffsets[strip]
    if (inicio == null) return 0

    const filaEnStrip = py - strip * rowsPerStrip
    const offset = inicio + filaEnStrip * bytesPorFila + (px * bands + pb) * bytesPerSample

    const cuenta = stripByteCounts[strip]
    const limite = cuenta != null ? Math.min(inicio + cuenta, view.byteLength) : view.byteLength
    if (offset < 0 || offset + bytesPerSample > limite) return 0

    if (sampleFormat === "float") {
      return bitsPerSample === 64 ? view.getFloat64(offset, little) : view.getFloat32(offset, little)
    }
    if (bitsPerSample === 8) return view.getUint8(offset)
    if (bitsPerSample === 16) return view.getUint16(offset, little)
    return view.getUint32(offset, little)
  }

  return { width, height, bands, sampleFormat, bitsPerSample, get }
}
