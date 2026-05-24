"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Loader2 } from "lucide-react"
import { loginAdmin, subscribeAuthState } from "@/lib/firebase/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    const unsub = subscribeAuthState(user => {
      if (user) router.replace("/admin/dashboard")
      else setChecking(false)
    })
    return unsub
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await loginAdmin(email, password)
      router.replace("/admin/dashboard")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido"
      if (
        msg.includes("invalid-credential") ||
        msg.includes("wrong-password") ||
        msg.includes("user-not-found")
      ) {
        setError("Email o contraseña incorrectos.")
      } else if (msg.includes("too-many-requests")) {
        setError("Demasiados intentos. Esperá unos minutos.")
      } else if (msg.includes("no está configurado")) {
        setError("Firebase no está configurado en este entorno.")
      } else {
        setError("No se pudo iniciar sesión. Verificá tu conexión.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-md px-4">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Panel de Administración</CardTitle>
            <CardDescription>Solo acceso autorizado</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando…
                  </>
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Sitio público{" "}
          <Link href="/" className="text-primary hover:underline">
            →&nbsp;/
          </Link>
        </p>
      </div>
    </div>
  )
}
