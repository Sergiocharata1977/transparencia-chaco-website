import { NextRequest, NextResponse } from "next/server"

import { getAdminAuth } from "@/lib/firebase/admin-sdk"

type AdminAuthResult =
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse }

function isAdminConfigurationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()

  return (
    message.includes("firebase admin:") ||
    message.includes("incorrect \"aud\"") ||
    message.includes("project id") ||
    message.includes("credential")
  )
}

export async function requireAdminAuth(req: NextRequest): Promise<AdminAuthResult> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    return { ok: true, uid: decoded.uid }
  } catch (error) {
    console.error("Error verificando autenticacion admin:", error)

    if (isAdminConfigurationError(error)) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Error de configuracion del servidor" }, { status: 500 }),
      }
    }

    return { ok: false, response: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }
}
