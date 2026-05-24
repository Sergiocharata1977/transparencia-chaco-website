import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminAuth } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<string | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return null
  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    return decoded.uid
  } catch {
    return null
  }
}

const actualizarSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  disabled: z.boolean().optional(),
  newPassword: z.string().min(8).optional(),
})

// PATCH /api/admin/usuarios/[uid] — actualizar usuario
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const callerUid = await verificarAutenticado(req)
  if (!callerUid) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { uid } = await params
  const body = await req.json()
  const result = actualizarSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: "Datos inválidos", details: result.error.flatten() }, { status: 400 })
  }

  // No permitir que un usuario se deshabilite a sí mismo
  if (result.data.disabled === true && uid === callerUid) {
    return NextResponse.json({ error: "No podés deshabilitarte a vos mismo" }, { status: 400 })
  }

  try {
    const updates: Record<string, unknown> = {}
    if (result.data.displayName !== undefined) updates.displayName = result.data.displayName
    if (result.data.disabled !== undefined) updates.disabled = result.data.disabled
    if (result.data.newPassword !== undefined) updates.password = result.data.newPassword

    const updated = await getAdminAuth().updateUser(uid, updates)
    return NextResponse.json({
      uid: updated.uid,
      email: updated.email,
      displayName: updated.displayName,
      disabled: updated.disabled,
    })
  } catch (error) {
    console.error("Error actualizando usuario:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// DELETE /api/admin/usuarios/[uid] — eliminar usuario
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  const callerUid = await verificarAutenticado(req)
  if (!callerUid) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { uid } = await params

  // No permitir que un usuario se elimine a sí mismo
  if (uid === callerUid) {
    return NextResponse.json({ error: "No podés eliminar tu propia cuenta" }, { status: 400 })
  }

  try {
    await getAdminAuth().deleteUser(uid)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error eliminando usuario:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
