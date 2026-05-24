export type MunicipioEstado = "cumple" | "parcial" | "no-cumple"

export interface MunicipioIndicador {
  titulo: string
  cumple: boolean
  descripcion: string
}

export interface OrdenanzaMunicipal {
  numero: string
  titulo: string
  fecha: string
  estado: string
}

export interface PublicacionResumen {
  titulo: string
  fecha: string
  categoria: string
  slug?: string
}

export interface Municipio {
  id: string
  slug: string
  nombre: string
  estado: MunicipioEstado
  region: string
  provincia: string
  intendente: string
  poblacion: string
  ultimaActualizacion: string
  descripcion: string
  indicadores?: MunicipioIndicador[]
  ordenanzas?: OrdenanzaMunicipal[]
  publicaciones?: PublicacionResumen[]
}

export interface PublicacionRelacionada {
  titulo: string
  slug: string
  categoria: string
}

export interface Publicacion {
  id: string
  slug: string
  titulo: string
  extracto: string
  fecha: string
  categoria: string
  municipio: string
  autor: string
  imagen: string
  contenido: string
  relacionadas?: PublicacionRelacionada[]
}

export interface DenunciaPayload {
  tipo: string
  municipio: string
  descripcion: string
  anonimo: boolean
  nombre?: string
  email?: string
  telefono?: string
}

export interface VoluntarioPayload {
  nombre: string
  email: string
  telefono?: string
  municipio?: string
  intereses: string[]
  mensaje?: string
}
