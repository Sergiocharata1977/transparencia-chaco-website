# Plan Admin Registros Canónicos — Ejecución multi-agente

**Fecha:** 2026-07-09
**Feature:** Administración interna con modelo canónico de registros: Ciudades (ABM madre con departamento), Notas al Municipio (unifica pedidos de información) y Reclamos por ente (unifica reportes/denuncias).
**Proyectos afectados:** `transparencia-chaco-website`
**Documento rector:** `reports/HANDOFF_REGISTROS_2026-07-09.md`

---

## Decisiones tomadas

1. `ciudades` es el ABM madre. Se agrega el campo `departamento` (jerarquía Provincia → Departamento → Ciudad). Charata → Chacabuco.
2. Se crean colecciones nuevas `notas_municipio` y `reclamos`. Las colecciones `pedidos_informacion` y `reportes_ciudadanos` quedan como **legacy** activas por compatibilidad (no se migran ni se borran en esta ola).
3. Los registros hijos nuevos persisten `ciudadSlug`, `ciudadNombre`, `departamento` y `provincia` (denormalizados desde la ciudad seleccionada) para filtros territoriales.
4. Alcance: **solo admin + backend**. El frontend público (Ola 5 del handoff) queda para la próxima sesión.

---

## Resumen de olas

| Ola | Agentes | Paralelos entre sí | Dependen de |
|-----|---------|---------------------|-------------|
| 1 | A, B, C | Sí | Nada |
| 2 | A, B, C | Sí | Ola 1 completa |
| 3 | A, B | Sí | Ola 2 completa |
| 4 | A | No aplica (único) | Ola 3 completa |

---

## Ola 1 — Ciudades como ABM madre con departamento
> Ejecutar Agente A + Agente B + Agente C en PARALELO

### Agente A — Modelo cliente de Ciudad
**Puede ejecutarse en paralelo con:** Agentes B y C
**Depende de:** nada — es la primera ola

#### Objetivo
Agregar `departamento` a la interfaz `Ciudad`, al normalizador y al fallback.

#### Archivos a modificar
- `lib/firebase/ciudades.ts` — campo `departamento?: string` en `Ciudad`, `normalizeCity` y `CIUDADES_FALLBACK`.

#### Prompt completo para el agente
Proyecto Next.js App Router + TypeScript + Firebase cliente. Leer `lib/firebase/ciudades.ts`.
Agregar `departamento?: string` a la interfaz `Ciudad`. En `normalizeCity`, mapear `data.departamento` como string opcional. En `CIUDADES_FALLBACK` cargar los departamentos reales del Chaco: Charata → "Chacabuco", Las Breñas → "Nueve de Julio", Corzuela → "General Belgrano", Presidencia Roque Sáenz Peña → "Comandante Fernández".
No tocar las funciones de consulta. Criterio de éxito: el tipo compila y el fallback tiene los 4 departamentos.

### Agente B — API de ciudades con departamento
**Puede ejecutarse en paralelo con:** Agentes A y C
**Depende de:** nada

#### Archivos a modificar
- `app/api/admin/ciudades/route.ts` — `departamento: z.string().min(2).max(60)` requerido en el schema de creación.
- `app/api/admin/ciudades/[slug]/route.ts` — `departamento` opcional en el schema de actualización.

#### Prompt completo para el agente
Leer ambos routes como están. Solo agregar el campo `departamento` a los Zod schemas (requerido al crear, opcional al editar). No cambiar auth ni estructura de respuesta.

### Agente C — Página admin de ciudades
**Puede ejecutarse en paralelo con:** Agentes A y B
**Depende de:** nada

#### Archivos a modificar
- `app/admin/ciudades/page.tsx` — campo Departamento en el formulario (requerido, placeholder "Ej: Chacabuco"), columna Departamento en la tabla, interfaz local y defaults.

---

## Ola 2 — Backend de Notas al Municipio y Reclamos
> Ejecutar SOLO después de que Ola 1 esté completa
> Ejecutar Agente A + Agente B + Agente C en PARALELO

### Agente A — Types + API `notas_municipio`
**Puede ejecutarse en paralelo con:** Agentes B y C
**Depende de:** Ola 1 completa

#### Archivos a crear
- `types/notas.ts` — `NotaTipo`, `NotaEstado`, `NotaMunicipio`, labels.
- `app/api/admin/notas-municipio/route.ts` — GET (listar) + POST (crear) sobre colección `notas_municipio`.
- `app/api/admin/notas-municipio/[id]/route.ts` — PATCH + DELETE.

#### Prompt completo para el agente
Modelo exacto: `app/api/admin/pedidos/route.ts` (mismo `verificarAutenticado` con Bearer token + `getAdminAuth().verifyIdToken`).
Tipos: `NotaTipo = "pedido_informacion" | "nota_administrativa" | "solicitud_vecinal" | "reclamo_formal"`; `NotaEstado = "borrador" | "enviada" | "respondida" | "vencida" | "archivada"`.
Schema Zod de creación: `ciudadSlug` (min 2), `ciudadNombre`, `departamento` opcional, `provincia` opcional, `tipo` enum, `titulo` (5–200), `descripcion` (10–2000), `destinatario` (2–150), `fechaEnvioISO` (regex fecha, opcional), `estado` enum default "borrador", `respuesta` opcional (max 2000), `fechaRespuestaISO` opcional, `archivoUrl` url-o-vacío opcional, `publico` boolean default false.
Al crear agregar `createdAt`/`updatedAt` con `FieldValue.serverTimestamp()`. PATCH: schema con todo opcional + `updatedAt`.

### Agente B — Types + API `reclamos`
**Puede ejecutarse en paralelo con:** Agentes A y C
**Depende de:** Ola 1 completa

#### Archivos a crear
- `types/reclamos.ts` — `ReclamoEnte`, `ReclamoTipo`, `ReclamoEstado`, `ReclamoPrioridad`, `Reclamo`, labels.
- `app/api/admin/reclamos/route.ts` — GET + POST sobre colección `reclamos`.
- `app/api/admin/reclamos/[id]/route.ts` — PATCH + DELETE.

#### Prompt completo para el agente
Mismo patrón que Agente A. Enums: `enteResponsable = municipio | hospital | seguridad | escuela | servicios_publicos | concejo | otro`; `tipo = denuncia | reclamo | sugerencia | alerta`; `estado = pendiente | en_revision | publicado | derivado | respondido | rechazado` (default "pendiente"); `prioridad = baja | media | alta | urgente` (default "media").
Campos: `ciudadSlug`, `ciudadNombre`, `departamento?`, `provincia?`, `titulo` (5–200), `descripcion` (10–2000), `ubicacionTexto?` (max 200), `publico` default false, `respuestaOficial?` (max 2000).

### Agente C — Reglas Firestore
**Puede ejecutarse en paralelo con:** Agentes A y B
**Depende de:** Ola 1 completa

#### Archivos a modificar
- `firestore.rules` — agregar `notas_municipio` (read público, write autenticado) y `reclamos` (create público para futuro formulario ciudadano, read público, update/delete autenticado). El filtrado por `publico` lo hace el cliente, igual que el resto de las colecciones del observatorio.

---

## Ola 3 — Páginas admin de los módulos nuevos
> Ejecutar SOLO después de que Ola 2 esté completa
> Ejecutar Agente A + Agente B en PARALELO

### Agente A — Página `/admin/notas-municipio`
**Puede ejecutarse en paralelo con:** Agente B
**Depende de:** Ola 2 completa

#### Archivos a crear
- `app/admin/notas-municipio/page.tsx`

#### Prompt completo para el agente
Modelo exacto: `app/admin/pedidos/page.tsx` (auth guard con `subscribeAuthState`, `getIdToken` en headers, Dialog + React Hook Form + Zod, tabla shadcn, AlertDialog para eliminar, toggle de visibilidad).
Ciudades: cargar con `getCiudadesActivas()`; al guardar, denormalizar `ciudadNombre`, `departamento` y `provincia` desde la ciudad seleccionada.
Tabla: Fecha envío | Tipo | Título | Ciudad | Destinatario | Estado | Público | Acciones.
Form: ciudadSlug (Select), tipo (Select), titulo, destinatario, fechaEnvioISO (date), estado (Select), descripcion (Textarea), respuesta (Textarea opcional), fechaRespuestaISO (date opcional), archivoUrl (opcional), publico (Checkbox).

### Agente B — Página `/admin/reclamos`
**Puede ejecutarse en paralelo con:** Agente A
**Depende de:** Ola 2 completa

#### Archivos a crear
- `app/admin/reclamos/page.tsx`

#### Prompt completo para el agente
Mismo modelo que Agente A.
Tabla: Fecha | Título | Ciudad | Ente | Tipo | Prioridad | Estado | Público | Acciones.
Form: ciudadSlug (Select), enteResponsable (Select), tipo (Select), prioridad (Select), estado (Select), titulo, descripcion (Textarea), ubicacionTexto (opcional), respuestaOficial (Textarea opcional), publico (Checkbox).
Badges de color por estado (publicado verde, rechazado rojo, pendiente azul, etc.) y por prioridad (urgente rojo).

---

## Ola 4 — Navegación admin
> Ejecutar SOLO después de que Ola 3 esté completa

### Agente A — Sidebar y dashboard
**Puede ejecutarse en paralelo con:** nadie (único)
**Depende de:** Ola 3 completa

#### Archivos a modificar
- `components/admin/admin-shell.tsx` — agregar "Notas al Municipio" (icono Send) y "Reclamos" (icono Megaphone) al grupo Gestión de Contenido. Renombrar los legacy: "Pedidos de Info (legacy)" y "Reportes (legacy)".
- `app/admin/dashboard/page.tsx` — agregar las 2 cards nuevas con la misma estética.

---

## Verificación final

- [ ] `ciudades` acepta y muestra `departamento`; fallback con los 4 departamentos reales.
- [ ] `POST /api/admin/notas-municipio` y `POST /api/admin/reclamos` devuelven 401 sin token.
- [ ] `/admin/notas-municipio` y `/admin/reclamos` crean/editan/eliminan y togglean `publico`.
- [ ] Los registros nuevos guardan `ciudadSlug`, `ciudadNombre`, `departamento` y `provincia`.
- [ ] Sidebar y dashboard muestran los módulos nuevos; rutas legacy siguen funcionando.
- [ ] `firebase deploy --only firestore:rules` pendiente de ejecutar en máquina con firebase-tools.
- [ ] Validación pesada (`pnpm type-check`, build) queda para Vercel — este clon en D: no instala dependencias.
