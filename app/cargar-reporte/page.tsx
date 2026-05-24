"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle, AlertTriangle } from "lucide-react"

import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const schema = z.object({
  municipioSlug: z.enum(
    ["charata", "las-brenas", "corzuela", "presidencia-roque-saenz-pena"],
    { required_error: "Seleccioná una ciudad" }
  ),
  tipo: z.enum(
    ["obra-publica", "accidente", "inseguridad", "hospital", "bache", "iluminacion", "calle", "otro"],
    { required_error: "Seleccioná el tipo" }
  ),
  titulo: z.string().min(5, "Mínimo 5 caracteres").max(100),
  descripcion: z.string().min(20, "Mínimo 20 caracteres").max(500, "Máximo 500 caracteres"),
  fechaHechoISO: z.string().optional(),
  ubicacionTexto: z.string().max(200).optional(),
  anonimo: z.boolean().default(true),
  autorizaPublicacion: z
    .boolean()
    .refine((v) => v === true, "Debés autorizar la publicación para enviar"),
  subtipo: z.string().optional(),
  gravedad: z.enum(["baja", "media", "alta"]).optional(),
  tipoProblema: z.string().optional(),
  hospital: z.string().max(100).optional(),
  hizoReclamoFormal: z.boolean().optional(),
  contactoEmail: z.string().email("Email inválido").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>

const TIPO_LABELS: Record<string, string> = {
  "obra-publica": "Obra pública",
  accidente: "Accidente",
  inseguridad: "Inseguridad",
  hospital: "Hospital / Salud",
  bache: "Bache",
  iluminacion: "Iluminación",
  calle: "Calle / Veredas",
  otro: "Otro",
}

const MUNICIPIO_LABELS: Record<string, string> = {
  charata: "Charata",
  "las-brenas": "Las Breñas",
  corzuela: "Corzuela",
  "presidencia-roque-saenz-pena": "Presidencia Roque Sáenz Peña",
}

const SUBTIPO_LABELS: Record<string, string> = {
  transito: "Tránsito",
  "robo-domiciliario": "Robo domiciliario",
  "robo-comercio": "Robo a comercio",
  hurto: "Hurto",
  "moto-robada": "Moto robada",
  vandalismo: "Vandalismo",
  "zona-peligrosa": "Zona peligrosa",
  "falta-iluminacion": "Falta de iluminación",
  otro: "Otro",
}

const TIPO_PROBLEMA_LABELS: Record<string, string> = {
  "falta-medicos": "Falta de médicos",
  "falta-insumos": "Falta de insumos",
  demoras: "Demoras",
  derivaciones: "Derivaciones",
  ambulancia: "Ambulancia",
  "guardia-saturada": "Guardia saturada",
  infraestructura: "Infraestructura",
  turnos: "Turnos",
  atencion: "Atención",
  otro: "Otro",
}

export default function CargarReportePage() {
  const [enviado, setEnviado] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      anonimo: true,
      autorizaPublicacion: false,
    },
  })

  const tipoSeleccionado = watch("tipo")
  const descripcion = watch("descripcion") ?? ""
  const esAccidenteOInseguridad = tipoSeleccionado === "accidente" || tipoSeleccionado === "inseguridad"
  const esHospital = tipoSeleccionado === "hospital"

  async function onSubmit(data: FormValues) {
    setSubmitError(null)
    try {
      const res = await fetch("/api/reportes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setEnviado(true)
      } else {
        setSubmitError("No pudimos enviar el reporte. Intentá nuevamente.")
      }
    } catch {
      setSubmitError("No pudimos enviar el reporte. Intentá nuevamente.")
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Cargar Reporte Ciudadano</h1>
              <p className="text-lg text-primary-foreground/90">
                Cualquier vecino puede informar un problema público. Revisamos cada reporte antes de publicarlo.
              </p>
            </div>
          </div>
        </section>
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-900">Reporte recibido</CardTitle>
                  <CardDescription className="text-green-700 text-base">
                    Lo revisaremos antes de publicarlo.
                  </CardDescription>
                  <div className="pt-4">
                    <Button
                      onClick={() => {
                        reset()
                        setEnviado(false)
                      }}
                      variant="outline"
                    >
                      Enviar otro reporte
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Cargar Reporte Ciudadano</h1>
            <p className="text-lg text-primary-foreground/90">
              Cualquier vecino puede informar un problema público. Revisamos cada reporte antes de publicarlo.
            </p>
          </div>
        </div>
      </section>

      {/* Banner legal */}
      <div className="container mx-auto px-4 mt-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              No incluyas nombres de personas, datos personales ni acusaciones individuales.
            </p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Formulario de Reporte</CardTitle>
                <CardDescription>
                  Completá los datos del problema que querés informar. Los campos marcados con * son obligatorios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                  {/* Sección A — Tipo de reporte */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-base border-b pb-2">Tipo de reporte</h3>
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Categoría *</Label>
                      <Select
                        onValueChange={(val) =>
                          setValue("tipo", val as FormValues["tipo"], { shouldValidate: true })
                        }
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Seleccioná el tipo de problema" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIPO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tipo && (
                        <p className="text-sm text-destructive">{errors.tipo.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Sección B — Datos básicos */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-base border-b pb-2">Datos del reporte</h3>

                    <div className="space-y-2">
                      <Label htmlFor="municipioSlug">Ciudad / Municipio *</Label>
                      <Select
                        onValueChange={(val) =>
                          setValue("municipioSlug", val as FormValues["municipioSlug"], {
                            shouldValidate: true,
                          })
                        }
                      >
                        <SelectTrigger id="municipioSlug">
                          <SelectValue placeholder="Seleccioná la ciudad" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(MUNICIPIO_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.municipioSlug && (
                        <p className="text-sm text-destructive">{errors.municipioSlug.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        placeholder="Resumí el problema en pocas palabras"
                        {...register("titulo")}
                      />
                      {errors.titulo && (
                        <p className="text-sm text-destructive">{errors.titulo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fechaHechoISO">Fecha del hecho</Label>
                      <Input id="fechaHechoISO" type="date" {...register("fechaHechoISO")} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ubicacionTexto">Ubicación</Label>
                      <Input
                        id="ubicacionTexto"
                        placeholder="Calle, barrio o referencia del lugar"
                        {...register("ubicacionTexto")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descripcion">
                        Descripción * {" "}
                        <span className="text-muted-foreground font-normal text-xs">
                          ({descripcion.length}/500)
                        </span>
                      </Label>
                      <Textarea
                        id="descripcion"
                        placeholder="Describí el problema con el mayor detalle posible."
                        rows={5}
                        {...register("descripcion")}
                      />
                      {errors.descripcion && (
                        <p className="text-sm text-destructive">{errors.descripcion.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Sección C — Campos condicionales */}
                  {(esAccidenteOInseguridad || esHospital) && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-base border-b pb-2">Información adicional</h3>

                      {esAccidenteOInseguridad && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="subtipo">Subtipo</Label>
                            <Select
                              onValueChange={(val) =>
                                setValue("subtipo", val, { shouldValidate: true })
                              }
                            >
                              <SelectTrigger id="subtipo">
                                <SelectValue placeholder="Seleccioná el subtipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(SUBTIPO_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="gravedad">Gravedad</Label>
                            <Select
                              onValueChange={(val) =>
                                setValue("gravedad", val as FormValues["gravedad"], {
                                  shouldValidate: true,
                                })
                              }
                            >
                              <SelectTrigger id="gravedad">
                                <SelectValue placeholder="Seleccioná la gravedad" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="baja">Baja</SelectItem>
                                <SelectItem value="media">Media</SelectItem>
                                <SelectItem value="alta">Alta</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {esHospital && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="hospital">Hospital / Centro de salud</Label>
                            <Input
                              id="hospital"
                              placeholder="Nombre del establecimiento"
                              {...register("hospital")}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tipoProblema">Tipo de problema</Label>
                            <Select
                              onValueChange={(val) =>
                                setValue("tipoProblema", val, { shouldValidate: true })
                              }
                            >
                              <SelectTrigger id="tipoProblema">
                                <SelectValue placeholder="Seleccioná el tipo de problema" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(TIPO_PROBLEMA_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id="hizoReclamoFormal"
                              onCheckedChange={(checked) =>
                                setValue("hizoReclamoFormal", checked === true)
                              }
                            />
                            <label
                              htmlFor="hizoReclamoFormal"
                              className="text-sm leading-relaxed cursor-pointer"
                            >
                              Ya realicé un reclamo formal
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Sección D — Privacidad y contacto */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-base border-b pb-2">Privacidad y contacto</h3>

                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="anonimo"
                          defaultChecked
                          onCheckedChange={(checked) =>
                            setValue("anonimo", checked === true)
                          }
                        />
                        <label htmlFor="anonimo" className="text-sm leading-relaxed cursor-pointer">
                          Publicar como anónimo
                        </label>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="autorizaPublicacion"
                          onCheckedChange={(checked) =>
                            setValue("autorizaPublicacion", checked === true, {
                              shouldValidate: true,
                            })
                          }
                        />
                        <label
                          htmlFor="autorizaPublicacion"
                          className="text-sm leading-relaxed cursor-pointer"
                        >
                          Autorizo la publicación de este reporte{" "}
                          <span className="text-destructive">*</span>
                        </label>
                      </div>
                      {errors.autorizaPublicacion && (
                        <p className="text-sm text-destructive">
                          {errors.autorizaPublicacion.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactoEmail">Email de contacto (opcional)</Label>
                      <Input
                        id="contactoEmail"
                        type="email"
                        placeholder="tu@email.com"
                        {...register("contactoEmail")}
                      />
                      <p className="text-xs text-muted-foreground">
                        Tu email no se publica. Solo lo usamos para comunicarnos si necesitamos más info.
                      </p>
                      {errors.contactoEmail && (
                        <p className="text-sm text-destructive">{errors.contactoEmail.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Aviso legal */}
                  <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-3">
                    No incluyas datos personales ni acusaciones sin respaldo. Los reportes son revisados por
                    nuestro equipo antes de publicarse.
                  </p>

                  {submitError && (
                    <p className="text-sm text-destructive">{submitError}</p>
                  )}

                  <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
