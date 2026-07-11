"use client"

import "leaflet/dist/leaflet.css"
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMapEvents } from "react-leaflet"

interface EditorTramoCalleProps {
  latInicio: string
  lngInicio: string
  latFin: string
  lngFin: string
  onChange: (coords: { latInicio: string; lngInicio: string; latFin: string; lngFin: string }) => void
}

function parseCoord(value: string): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getPositions(props: EditorTramoCalleProps): [number, number][] {
  const latInicio = parseCoord(props.latInicio)
  const lngInicio = parseCoord(props.lngInicio)
  const latFin = parseCoord(props.latFin)
  const lngFin = parseCoord(props.lngFin)
  const positions: [number, number][] = []

  if (latInicio != null && lngInicio != null) positions.push([latInicio, lngInicio])
  if (latFin != null && lngFin != null) positions.push([latFin, lngFin])
  return positions
}

function ClickHandler(props: EditorTramoCalleProps) {
  useMapEvents({
    click(event) {
      const next = {
        lat: event.latlng.lat.toFixed(6),
        lng: event.latlng.lng.toFixed(6),
      }

      if (!props.latInicio || !props.lngInicio || (props.latInicio && props.lngInicio && props.latFin && props.lngFin)) {
        props.onChange({
          latInicio: next.lat,
          lngInicio: next.lng,
          latFin: "",
          lngFin: "",
        })
        return
      }

      props.onChange({
        latInicio: props.latInicio,
        lngInicio: props.lngInicio,
        latFin: next.lat,
        lngFin: next.lng,
      })
    },
  })

  return null
}

export default function EditorTramoCalle(props: EditorTramoCalleProps) {
  const positions = getPositions(props)
  const center: [number, number] = positions[0] ?? [-27.433, -61.183]

  return (
    <div className="space-y-2">
      <div className="h-[320px] overflow-hidden rounded-lg border bg-slate-100">
        <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }} className="z-0">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler {...props} />

          {positions.map((position, index) => (
            <CircleMarker
              key={`${position[0]}-${position[1]}-${index}`}
              center={position}
              radius={8}
              pathOptions={{
                color: index === 0 ? "#005763" : "#f59e0b",
                fillColor: index === 0 ? "#005763" : "#f59e0b",
                fillOpacity: 0.85,
              }}
            >
              <Popup>{index === 0 ? "Inicio del tramo" : "Fin del tramo"}</Popup>
            </CircleMarker>
          ))}

          {positions.length === 2 ? (
            <Polyline positions={positions} pathOptions={{ color: "#009f8b", weight: 6, opacity: 0.85 }} />
          ) : null}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        Click 1 marca el inicio. Click 2 marca el fin. Un tercer click reinicia el tramo.
      </p>
    </div>
  )
}
