"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, Polygon, Popup, TileLayer } from "react-leaflet"

import {
  BASURAL_ESTADO_VERIFICACION_LABELS,
  BASURAL_FUENTE_LABELS,
  type Basural,
  type BasuralEstadoVerificacion,
} from "@/types/basurales"

interface MapaBasuralesProps {
  basurales: Basural[]
}

function colorEstado(estado: BasuralEstadoVerificacion): string {
  const colors: Record<BasuralEstadoVerificacion, string> = {
    candidato: "#f59e0b",
    verificado_foto: "#dc2626",
    verificado_campo: "#b91c1c",
    descartado: "#94a3b8",
    erradicado: "#16a34a",
  }
  return colors[estado]
}

function polygonPositions(basural: Basural): [number, number][] {
  return basural.geometry?.coordinates?.[0]?.map(([lng, lat]) => [lat, lng]) ?? []
}

function initialCenter(basurales: Basural[]): [number, number] {
  const first = basurales.find((basural) => polygonPositions(basural).length >= 4)
  const coordinate = first?.geometry?.coordinates?.[0]?.[0]
  return coordinate ? [coordinate[1], coordinate[0]] : [-27.216, -61.187]
}

export default function MapaBasurales({ basurales }: MapaBasuralesProps) {
  const conMapa = basurales.filter((basural) => basural.estadoVerificacion !== "descartado" && polygonPositions(basural).length >= 4)

  return (
    <div className="space-y-4">
      <div className="relative h-[520px] w-full overflow-hidden rounded-lg border border-cyan-950/10 bg-slate-100">
        <MapContainer center={initialCenter(conMapa)} zoom={13} style={{ height: "100%", width: "100%" }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {conMapa.map((basural) => (
            <Polygon
              key={basural.id}
              positions={polygonPositions(basural)}
              pathOptions={{
                color: colorEstado(basural.estadoVerificacion),
                fillColor: colorEstado(basural.estadoVerificacion),
                fillOpacity: 0.32,
                weight: 2,
              }}
            >
              <Popup>
                <strong>{basural.nombre || basural.ubicacionTexto || "Basural relevado"}</strong><br />
                Area: {Math.round(basural.areaM2).toLocaleString("es-AR")} m2<br />
                Fecha: {basural.fechaDeteccionISO}<br />
                Fuente: {BASURAL_FUENTE_LABELS[basural.fuente]}<br />
                Estado: {BASURAL_ESTADO_VERIFICACION_LABELS[basural.estadoVerificacion]}
                {basural.fotoUrl ? <><br /><a href={basural.fotoUrl} target="_blank" rel="noreferrer">Ver foto</a></> : null}
              </Popup>
            </Polygon>
          ))}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-sm bg-red-600" /> Verificado</span>
        <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-sm bg-green-600" /> Erradicado</span>
        <span className="flex items-center gap-2"><span className="h-3 w-5 rounded-sm bg-amber-500" /> Candidato publicado</span>
      </div>

      {conMapa.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavia no hay poligonos publicos para mostrar en el mapa.</p>
      ) : null}
    </div>
  )
}
