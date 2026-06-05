"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2, UserCheck, UserX } from "lucide-react"
import { subscribeAuthState, getIdToken, type User } from "@/lib/firebase/auth-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface UsuarioAdmin {
  uid: string
  email: string
  displayName: string
  disabled: boolean
  createdAt: string | null
  lastLogin: string | null
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getIdToken()
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" }
}

export default function AdminUsuariosPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [cargando, setCargando] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [creando, setCreando] = useState(false)
  const [errorCrear, setErrorCrear] = useState<string | null>(null)
  const [nuevoEmail, setNuevoEmail] = useState("")
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevaPassword, setNuevaPassword] = useState("")

  const router = useRouter()

  const cargarUsuarios = useCallback(async () => {
    setCargando(true)
    setErrorGlobal(null)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/usuarios", { headers })
      if (!res.ok) { setErrorGlobal("Error cargando usuarios"); return }
      const data = await res.json()
      setUsuarios(data.usuarios ?? [])
    } catch {
      setErrorGlobal("Error de red")
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    const unsub = subscribeAuthState(u => {
      setUser(u)
      setAuthChecking(false)
      if (!u) router.replace("/admin")
    })
    return unsub
  }, [router])

  useEffect(() => {
    if (user) cargarUsuarios()
  }, [user, cargarUsuarios])

  async function handleCrear() {
    setErrorCrear(null)
    setCreando(true)
    try {
      const headers = await authHeaders()
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: nuevoEmail, password: nuevaPassword, displayName: nuevoNombre }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorCrear(data.error ?? "Error creando usuario"); return }
      setDialogOpen(false)
      setNuevoEmail(""); setNuevoNombre(""); setNuevaPassword("")
      await cargarUsuarios()
    } catch {
      setErrorCrear("Error de red")
    } finally {
      setCreando(false)
    }
  }

  async function handleToggleDisabled(uid: string, disabled: boolean) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/usuarios/${uid}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ disabled: !disabled }),
      })
      setUsuarios(prev => prev.map(u => u.uid === uid ? { ...u, disabled: !disabled } : u))
    } catch {
      setErrorGlobal("Error actualizando usuario")
    }
  }

  async function handleEliminar(uid: string) {
    try {
      const headers = await authHeaders()
      await fetch(`/api/admin/usuarios/${uid}`, { method: "DELETE", headers })
      setUsuarios(prev => prev.filter(u => u.uid !== uid))
    } catch {
      setErrorGlobal("Error eliminando usuario")
    }
  }

  function formatFecha(iso: string | null) {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  if (authChecking) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return (
    <main className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Usuarios administradores</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crear usuario administrador</DialogTitle>
              <DialogDescription>
                El usuario podrá acceder al panel admin con email y contraseña.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="nombre">Nombre completo</Label>
                <Input
                  id="nombre"
                  placeholder="Ej: María García"
                  value={nuevoNombre}
                  onChange={e => setNuevoNombre(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@organizacion.org"
                  value={nuevoEmail}
                  onChange={e => setNuevoEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña inicial</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={nuevaPassword}
                  onChange={e => setNuevaPassword(e.target.value)}
                />
              </div>
              {errorCrear && <p className="text-sm text-destructive">{errorCrear}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={creando}>
                Cancelar
              </Button>
              <Button onClick={handleCrear} disabled={creando || !nuevoEmail || !nuevaPassword || !nuevoNombre}>
                {creando && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {errorGlobal && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{errorGlobal}</div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-muted-foreground font-normal">
            {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""} registrado{usuarios.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : usuarios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No hay usuarios registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Último login</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map(u => (
                    <TableRow key={u.uid} className={u.disabled ? "opacity-50" : undefined}>
                      <TableCell className="font-medium">{u.displayName || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.disabled ? "secondary" : "default"}>
                          {u.disabled ? "Deshabilitado" : "Activo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatFecha(u.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatFecha(u.lastLogin)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={u.disabled ? "Habilitar usuario" : "Deshabilitar usuario"}
                            onClick={() => handleToggleDisabled(u.uid, u.disabled)}
                            disabled={u.uid === user.uid}
                          >
                            {u.disabled
                              ? <UserCheck className="h-4 w-4 text-green-600" />
                              : <UserX className="h-4 w-4 text-amber-600" />
                            }
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" title="Eliminar usuario" disabled={u.uid === user.uid}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción es irreversible. Se eliminará el acceso de{" "}
                                  <strong>{u.email}</strong> al panel administrador.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleEliminar(u.uid)}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
