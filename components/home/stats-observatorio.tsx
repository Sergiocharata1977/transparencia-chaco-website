"use client"

import { useEffect, useState } from "react"

import { getObrasPublicas } from "@/lib/firebase/obras"
import { getReportes } from "@/lib/firebase/reportes"
import { getPedidosInformacion } from "@/lib/firebase/transparencia"
import { getCiudadesActivas } from "@/lib/firebase/ciudades"

interface StatItem {
  label: string
  value: number
}

function useAnimatedCount(target: number, duration = 1500): number {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (target === 0) {
      setCurrent(0)
      return
    }

    const steps = 60
    const stepDuration = duration / steps
    const increment = target / steps
    let step = 0

    const timer = setInterval(() => {
      step += 1
      if (step >= steps) {
        setCurrent(target)
        clearInterval(timer)
      } else {
        setCurrent(Math.round(increment * step))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [target, duration])

  return current
}

function StatCard({ label, value }: StatItem) {
  const animated = useAnimatedCount(value)

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-800/50 px-6 py-8 text-center">
      <p className="text-4xl font-bold tabular-nums text-emerald-400">{animated}</p>
      <p className="mt-3 text-sm text-white/70">{label}</p>
    </div>
  )
}

export function StatsObservatorio() {
  const [stats, setStats] = useState<StatItem[]>([
    { label: "obras registradas", value: 0 },
    { label: "reportes ciudadanos", value: 0 },
    { label: "pedidos de información", value: 0 },
    { label: "municipios cubiertos", value: 0 },
  ])

  useEffect(() => {
    void (async () => {
      const [obras, reportes, pedidos, ciudades] = await Promise.allSettled([
        getObrasPublicas(),
        getReportes(),
        getPedidosInformacion(),
        getCiudadesActivas(),
      ])

      setStats([
        {
          label: "obras registradas",
          value: obras.status === "fulfilled" ? obras.value.length : 0,
        },
        {
          label: "reportes ciudadanos",
          value: reportes.status === "fulfilled" ? reportes.value.length : 0,
        },
        {
          label: "pedidos de información",
          value: pedidos.status === "fulfilled" ? pedidos.value.length : 0,
        },
        {
          label: "municipios cubiertos",
          value: ciudades.status === "fulfilled" ? ciudades.value.length : 0,
        },
      ])
    })()
  }, [])

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} label={stat.label} value={stat.value} />
      ))}
    </div>
  )
}
