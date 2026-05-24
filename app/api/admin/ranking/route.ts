import { NextRequest, NextResponse } from "next/server"
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}

// GET /api/admin/ranking — listar los 4 municipios del ranking
export async function GET(req: NextRequest) {
  if (!(await verificarAutenticado(req))) return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  try {
    const snap = await getAdminDb().collection("ranking_municipios").get()
    const ranking = snap.docs.map(d => ({ municipioSlug: d.id, ...d.data() }))
    return NextResponse.json({ ranking })
  } catch (error) {
    console.error("Error listando ranking:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
