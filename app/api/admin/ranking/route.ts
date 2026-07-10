import { NextRequest, NextResponse } from "next/server"
import { requireAdminAuth } from "@/lib/api/admin-auth"
import { getAdminDb } from "@/lib/firebase/admin-sdk"


// GET /api/admin/ranking — listar los 4 municipios del ranking
export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth(req)
  if (!auth.ok) return auth.response
  try {
    const snap = await getAdminDb().collection("ranking_municipios").get()
    const ranking = snap.docs.map(d => ({ municipioSlug: d.id, ...d.data() }))
    return NextResponse.json({ ranking })
  } catch (error) {
    console.error("Error listando ranking:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
