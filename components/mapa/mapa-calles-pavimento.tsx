"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, Polyline, Popup, TileLayer } from "react-leaflet"

import {
  CALLE_ESTADO_OBRA_LABELS,
  CALLE_ESTADO_SUPERFICIE_LABELS,
  type CalleEstadoSuperficie,
  type CalleMunicipio,
} from "@/types/calles"

interface MapaCallesPavimentoProps {
  calles: CalleMunicipio[]
}

function colorSuperficie(estado: CalleEstadoSuperficie): string {
  const colors: Record<CalleEstadoSuperficie, string> = {
    asfaltada: "#009f8b",
    adoquin: "#0f766e",
    no_asfaltada: "#64748b",
    ripio: "#94a3b8",
    tierra: "#a16207",
    en_obra: "#f59e0b",
    sin_dato: "#cbd5e1",
  }
  return colors[estado]
}

function linePositions(calle: CalleMunicipio): [number, number][] {
  return calle.geometry?.coordinates.map(([lng, lat]) => [lat, lng]) ?? []
}

function initialCenter(calles: CalleMunicipio[]): [number, number] {
  const first = calles.find((calle) => calle.geometry?.coordinates?.length)
  const coordinate = first?.geometry?.coordinates?.[0]
  return coordinate ? [coordinate[1], coordinate[0]] : [-27.433, -61.183]
}

const LEYENDA: { estado: CalleEstadoSuperficie; label: string }[] = [
  { estado: "asfaltada", label: "Asfaltada" },
  { estado: "no_asfaltada", label: "No asfaltada" },
  { estado: "ripio", label: "Ripio" },
  { estado: "tierra", label: "Tierra" },
  { estado: "en_obra", label: "En obra" },
  { estado: "sin_dato", label: "Sin dato" },
]

export default function MapaCallesPavimento({ calles }: MapaCallesPavimentoProps) {
  const callesConMapa = calles.filter((calle) => linePositions(calle).length >= 2)

  return (
    <div className="space-y-4">
      <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-cyan-950/10 bg-slate-100">
        <MapContainer
          center={initialCenter(callesConMapa)}
          zoom={14}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {callesConMapa.map((calle) => (
            <Polyline
              key={calle.id}
              positions={linePositions(calle)}
              pathOptions={{
                color: colorSuperficie(calle.estadoSuperficie),
                weight: 6,
                opacity: 0.85,
              }}
            >
              <Popup>
                <strong>{calle.nombreCalle}</strong><br />
                {calle.desde} - {calle.hasta}<br />
                {CALLE_ESTADO_SUPERFICIE_LABELS[calle.estadoSuperficie]} · {calle.longitudMetros} m<br />
                Obra: {CALLE_ESTADO_OBRA_LABELS[calle.estadoObra]}<br />
                Año: {calle.anioRelevamiento}
                {calle.obraNombre ? <><br />Obra relacionada: {calle.obraNombre}</> : null}
              </Popup>
            </Polyline>
          ))}
        </MapContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {LEYENDA.map((item) => (
          <div key={item.estado} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block h-3 w-5 rounded-sm"
              style={{ backgroundColor: colorSuperficie(item.estado) }}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {callesConMapa.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavia no hay tramos con coordenadas para mostrar en el mapa.</p>
      ) : null}
    </div>
  )
}
