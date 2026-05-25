import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase/admin-sdk"

const reporteSchema = z.object({
  municipioSlug: z.string().min(2).max(60),
  tipo: z.enum(["obra-publica", "accidente", "inseguridad", "hospital", "bache", "iluminacion", "calle", "otro"]),
  titulo: z.string().min(5).max(100).transform((s) => s.trim()),
  descripcion: z.string().min(20).max(500).transform((s) => s.trim()),
  fechaHechoISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  ubicacionTexto: z.string().max(200).transform((s) => s.trim()).optional(),
  anonimo: z.boolean().default(true),
  autorizaPublicacion: z.literal(true, {
    errorMap: () => ({ message: "Debés autorizar la publicación" }),
  }),
  subtipo: z.string().max(50).optional(),
  gravedad: z.enum(["baja", "media", "alta"]).optional(),
  huboDenunciaPolicial: z.enum(["si", "no", "no-sabe"]).optional(),
  tipoProblema: z.string().max(50).optional(),
  hospital: z.string().max(100).transform((s) => s.trim()).optional(),
  hizoReclamoFormal: z.boolean().optional(),
  contactoEmail: z.string().email().max(200).optional().or(z.literal("")),
})

const municipioMap: Record<string, string> = {
  charata: "Charata",
  "las-brenas": "Las Breñas",
  corzuela: "Corzuela",
  "presidencia-roque-saenz-pena": "Presidencia Roque Sáenz Peña",
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = reporteSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: result.error.flatten() },
        { status: 400 }
      )
    }

    const db = getAdminDb()
    const { contactoEmail, ...publicData } = result.data

    // Documento público (sin contacto)
    const docRef = await db.collection("reportes_ciudadanos").add({
      ...publicData,
      municipio: municipioMap[publicData.municipioSlug] ?? publicData.municipioSlug,
      estadoInterno: "recibido",
      nivelVerificacion: 1,
      visibilidadPublica: false,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Contacto en colección privada (si lo proporcionó)
    if (contactoEmail) {
      await db.collection("reportes_contactos").add({
        reporteId: docRef.id,
        contactoEmail,
        createdAt: FieldValue.serverTimestamp(),
      })
    }

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 })
  } catch (error) {
    console.error("Error procesando reporte:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
