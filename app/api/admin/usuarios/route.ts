import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminAuth } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try {
    await getAdminAuth().verifyIdToken(token)
    return true
  } catch {
    return false
  }
}

// GET /api/admin/usuarios — listar todos los usuarios
export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const result = await getAdminAuth().listUsers(100)
    const usuarios = result.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? "",
      displayName: u.displayName ?? "",
      disabled: u.disabled,
      createdAt: u.metadata.creationTime,
      lastLogin: u.metadata.lastSignInTime ?? null,
    }))
    return NextResponse.json({ usuarios })
  } catch (error) {
    console.error("Error listando usuarios:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

const crearSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  displayName: z.string().min(2, "Mínimo 2 caracteres").max(60),
})

// POST /api/admin/usuarios — crear nuevo usuario
export async function POST(req: NextRequest) {
  if (!(await verificarAutenticado(req))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }
  try {
    const body = await req.json()
    const result = crearSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
    }
    const { email, password, displayName } = result.data
    const user = await getAdminAuth().createUser({ email, password, displayName })
    return NextResponse.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      disabled: user.disabled,
      createdAt: user.metadata.creationTime,
    }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : ""
    if (msg.includes("email-already-exists")) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 })
    }
    console.error("Error creando usuario:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
