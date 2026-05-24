"use client"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { MapContainer, TileLayer, CircleMarker, Marker, Popup } from "react-leaflet"
import { useEffect, useState } from "react"
import { getObrasPublicas } from "@/lib/firebase/obras"
import { getReportes, getAccidentes } from "@/lib/firebase/reportes"
import type { ObraPublica, ObraEstado } from "@/types/obras"
import type { ReporteCiudadano, ReporteAccidente } from "@/types/reportes"

// Fix Leaflet default icon in Next.js
const iconDefault = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = iconDefault

interface MapaCiudadanoProps {
  municipioSlug?: string
}

function colorObra(estado: ObraEstado): string {
  const map: Record<ObraEstado, string> = {
    "finalizada": "#16a34a",
    "en-ejecucion": "#ca8a04",
    "iniciada": "#2563eb",
    "paralizada": "#dc2626",
    "anunciada": "#6b7280",
    "sin-informacion": "#9ca3af",
  }
  return map[estado] ?? "#6b7280"
}

const CIUDADES = [
  { name: "Charata", pos: [-27.433, -61.183] as [number, number] },
  { name: "Las Breñas", pos: [-27.083, -61.083] as [number, number] },
  { name: "Corzuela", pos: [-27.0, -60.95] as [number, number] },
  { name: "Sáenz Peña", pos: [-26.789, -60.438] as [number, number] },
]

const LEYENDA = [
  { color: "#16a34a", label: "Obra finalizada" },
  { color: "#ca8a04", label: "En ejecución" },
  { color: "#2563eb", label: "Iniciada" },
  { color: "#dc2626", label: "Paralizada" },
  { color: "#6b7280", label: "Anunciada" },
  { color: "#7c3aed", label: "Reporte ciudadano" },
  { color: "#f97316", label: "Accidente" },
]

export default function MapaCiudadano({ municipioSlug }: MapaCiudadanoProps) {
  const [obras, setObras] = useState<ObraPublica[]>([])
  const [reportes, setReportes] = useState<ReporteCiudadano[]>([])
  const [accidentes, setAccidentes] = useState<ReporteAccidente[]>([])
  const [mostrarObras, setMostrarObras] = useState(true)
  const [mostrarReportes, setMostrarReportes] = useState(true)
  const [mostrarAccidentes, setMostrarAccidentes] = useState(false)

  useEffect(() => {
    Promise.all([
      getObrasPublicas(municipioSlug ? { municipioSlug } : undefined),
      getReportes(municipioSlug),
      getAccidentes(municipioSlug),
    ]).then(([o, r, a]) => {
      setObras(o.filter(x => x.coordenadas))
      setReportes(r.filter(x => x.coordenadas))
      setAccidentes(a.filter(x => x.coordenadas))
    })
  }, [municipioSlug])

  return (
    <div className="space-y-4">
      {/* Toggles de capas */}
      <div className="flex flex-wrap gap-4 items-center">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary accent-primary"
            checked={mostrarObras}
            onChange={e => setMostrarObras(e.target.checked)}
          />
          <span>Obras públicas</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-violet-600"
            checked={mostrarReportes}
            onChange={e => setMostrarReportes(e.target.checked)}
          />
          <span>Reportes ciudadanos</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-orange-500"
            checked={mostrarAccidentes}
            onChange={e => setMostrarAccidentes(e.target.checked)}
          />
          <span>Accidentes</span>
        </label>
      </div>

      {/* Mapa */}
      <div className="relative w-full" style={{ height: "500px" }}>
        <MapContainer
          center={[-27.1, -60.9]}
          zoom={8}
          style={{ height: "100%", width: "100%" }}
          className="rounded-xl z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Markers de ciudades */}
          {CIUDADES.map(city => (
            <Marker key={city.name} position={city.pos}>
              <Popup>{city.name}</Popup>
            </Marker>
          ))}

          {/* Obras públicas */}
          {mostrarObras && obras.map(obra => obra.coordenadas && (
            <CircleMarker
              key={obra.id}
              center={[obra.coordenadas.lat, obra.coordenadas.lng]}
              radius={8}
              pathOptions={{
                color: colorObra(obra.estado),
                fillColor: colorObra(obra.estado),
                fillOpacity: 0.7,
              }}
            >
              <Popup>
                <strong>{obra.nombre}</strong><br />
                {obra.municipio} · {obra.estado}<br />
                {obra.tipo}
                {obra.avancePorcentaje !== undefined && <><br />Avance: {obra.avancePorcentaje}%</>}
              </Popup>
            </CircleMarker>
          ))}

          {/* Reportes ciudadanos */}
          {mostrarReportes && reportes.map(r => r.coordenadas && (
            <CircleMarker
              key={r.id}
              center={[r.coordenadas.lat, r.coordenadas.lng]}
              radius={6}
              pathOptions={{ color: "#7c3aed", fillColor: "#7c3aed", fillOpacity: 0.6 }}
            >
              <Popup>
                <strong>{r.titulo}</strong><br />
                {r.municipio} · {r.tipo}
              </Popup>
            </CircleMarker>
          ))}

          {/* Accidentes */}
          {mostrarAccidentes && accidentes.map(a => a.coordenadas && (
            <CircleMarker
              key={a.id}
              center={[a.coordenadas.lat, a.coordenadas.lng]}
              radius={6}
              pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.6 }}
            >
              <Popup>
                <strong>{a.titulo}</strong><br />
                {a.municipio} · {a.subtipo ?? a.tipo}
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {LEYENDA.map(item => (
          <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block rounded-full flex-shrink-0"
              style={{ width: 12, height: 12, backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
