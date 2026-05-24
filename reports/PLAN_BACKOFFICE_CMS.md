# Plan Backoffice CMS — Panel Admin Transparencia

**Fecha:** 2026-05-24
**Feature:** ABM completo de los 6 módulos de contenido del panel admin
**Proyecto:** `Web Site transparencia` (Next.js 16 + Firebase Admin SDK + shadcn/ui)

---

## Contexto del proyecto

- **Stack:** Next.js 16 App Router, TypeScript 5, Tailwind CSS 4, shadcn/ui (Radix UI), pnpm
- **Auth:** Firebase Auth (cliente) + Firebase Admin SDK (server) ya configurados
- **Modelo de auth en páginas:** `subscribeAuthState` + redirect a `/admin` si no autenticado
- **Modelo de auth en API Routes:** Bearer token verificado con `getAdminAuth().verifyIdToken()`
- **Patrón de página admin:** ver `app/admin/usuarios/page.tsx` — modelo exacto a replicar
- **Patrón de API Route:** ver `app/api/admin/usuarios/route.ts` — modelo exacto a replicar
- **Tipos ya existentes:** `types/obras.ts`, `types/transparencia.ts`, `types/reportes.ts`
- **Admin SDK:** `lib/firebase/admin-sdk.ts` exporta `getAdminDb()` y `getAdminAuth()`
- **Auth cliente:** `lib/firebase/auth-client.ts` exporta `subscribeAuthState`, `getIdToken`, `logoutAdmin`

## Slugs canónicos de municipios

| Label | Slug |
|-------|------|
| Charata | `charata` |
| Las Breñas | `las-brenas` |
| Corzuela | `corzuela` |
| Presidencia Roque Sáenz Peña | `presidencia-roque-saenz-pena` |

---

## Resumen de olas

| Ola | Agentes | Paralelos entre sí | Dependen de |
|-----|---------|---------------------|-------------|
| 1 | A, B, C, D, E, F | Sí | Nada |
| 2 | A, B, C, D, E, F | Sí | Ola 1 completa |
| 3 | A | No aplica (único) | Ola 2 completa |

---

## Ola 1 — API Routes (backend de los 6 módulos)
> Ejecutar Agente A + B + C + D + E + F en PARALELO

### Agente A — API Route Obras Públicas

**Puede ejecutarse en paralelo con:** Agentes B, C, D, E, F
**Depende de:** nada — es la primera ola

#### Objetivo
Crear los endpoints REST para gestión CRUD de obras públicas.

#### Archivos a crear
- `app/api/admin/obras/route.ts` — GET (listar) + POST (crear)
- `app/api/admin/obras/[id]/route.ts` — PATCH (editar) + DELETE (eliminar)

#### Prompt completo para el agente

Estás trabajando en Next.js 16 App Router con TypeScript 5 y Firebase Admin SDK.

**Leer como modelo exacto:** `app/api/admin/usuarios/route.ts` y `app/api/admin/usuarios/[uid]/route.ts`

**Patrón obligatorio de autenticación:**
```typescript
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin-sdk"
import { FieldValue } from "firebase-admin/firestore"

async function verificarAutenticado(req: NextRequest): Promise<boolean> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return false
  try { await getAdminAuth().verifyIdToken(token); return true } catch { return false }
}
```

**Tipos disponibles** en `types/obras.ts`:
```typescript
type ObraEstado = "anunciada" | "iniciada" | "en-ejecucion" | "paralizada" | "finalizada" | "sin-informacion"
type ObraEjecucion = "administracion-propia" | "empresa-contratista" | "ejecucion-provincial" | "ejecucion-nacional" | "desconocido"
type ObraOrigenFondos = "municipal" | "provincial" | "nacional" | "mixto" | "desconocido"
type ObraTipo = "pavimento" | "ripio" | "iluminacion" | "cloacas" | "edificio-publico" | "obra-hidraulica" | "plaza" | "parque" | "otro"
type EstadoEditorial = "draft" | "review" | "published" | "archived"
// NivelVerificacion: 1 | 2 | 3 | 4 | 5
```

**`app/api/admin/obras/route.ts`:**

GET — listar obras:
- `getAdminDb().collection("obras_publicas").orderBy("createdAt", "desc").limit(100)`
- Devolver array con todos los campos del doc + `id`

POST — crear obra, Zod schema:
```typescript
const crearObraSchema = z.object({
  municipio: z.string().min(2).max(60),
  municipioSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]),
  nombre: z.string().min(3).max(150),
  descripcion: z.string().min(10).max(1000),
  ubicacionTexto: z.string().max(200).optional(),
  tipo: z.enum(["pavimento","ripio","iluminacion","cloacas","edificio-publico","obra-hidraulica","plaza","parque","otro"]),
  origenFondos: z.enum(["municipal","provincial","nacional","mixto","desconocido"]),
  ejecucion: z.enum(["administracion-propia","empresa-contratista","ejecucion-provincial","ejecucion-nacional","desconocido"]),
  estado: z.enum(["anunciada","iniciada","en-ejecucion","paralizada","finalizada","sin-informacion"]),
  avancePorcentaje: z.number().min(0).max(100).optional(),
  responsableInformado: z.string().max(100).optional(),
  contratista: z.string().max(100).optional(),
  presupuestoInformado: z.string().max(50).optional(),
  fechaInicioISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fechaFinISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  fuenteInformacion: z.string().max(200).optional(),
  nivelVerificacion: z.number().int().min(1).max(5).default(1),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})
```
- Al crear agregar `createdAt: FieldValue.serverTimestamp()`
- Devolver `{ id, ...data }` con status 201

**`app/api/admin/obras/[id]/route.ts`:**

PATCH — editar, mismo schema pero todos .optional() + agregar `updatedAt: FieldValue.serverTimestamp()`
DELETE — `getAdminDb().collection("obras_publicas").doc(id).delete()`

Ambos requieren verificarAutenticado. Devolver 401 si no autenticado.

**Criterio de éxito:** `pnpm tsc --noEmit` sin errores.

---

### Agente B — API Route Pedidos de Información

**Puede ejecutarse en paralelo con:** Agentes A, C, D, E, F
**Depende de:** nada

#### Archivos a crear
- `app/api/admin/pedidos/route.ts`
- `app/api/admin/pedidos/[id]/route.ts`

#### Prompt completo para el agente

Mismo patrón que Agente A. Leer `app/api/admin/usuarios/route.ts` como modelo.

**Tipos** en `types/transparencia.ts`:
```typescript
type PedidoEstado = "en-plazo" | "respondido-completo" | "respondido-parcial" | "sin-respuesta" | "vencido"
type EstadoEditorial = "draft" | "review" | "published" | "archived"
```

**`app/api/admin/pedidos/route.ts`:**

GET — `getAdminDb().collection("pedidos_informacion").orderBy("createdAt","desc").limit(100)`

POST — Zod schema:
```typescript
const crearPedidoSchema = z.object({
  municipio: z.string().min(2).max(60),
  municipioSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]),
  organismo: z.string().min(3).max(150),
  tema: z.string().min(5).max(200),
  textoPedido: z.string().max(2000).optional(),
  fechaISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estado: z.enum(["en-plazo","respondido-completo","respondido-parcial","sin-respuesta","vencido"]),
  fechaRespuestaISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  respuestaResumen: z.string().max(1000).optional(),
  nivelVerificacion: z.number().int().min(1).max(5).default(1),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})
```

**`app/api/admin/pedidos/[id]/route.ts`:** PATCH + DELETE igual que patrón.

---

### Agente C — API Route Medios y Pautas

**Puede ejecutarse en paralelo con:** Agentes A, B, D, E, F
**Depende de:** nada

#### Archivos a crear
- `app/api/admin/medios/route.ts`
- `app/api/admin/medios/[id]/route.ts`
- `app/api/admin/pautas/route.ts`
- `app/api/admin/pautas/[id]/route.ts`

#### Prompt completo para el agente

Mismo patrón. Leer `app/api/admin/usuarios/route.ts` como modelo.

**Tipos** en `types/transparencia.ts`:
```typescript
type MedioTipo = "radio" | "portal-web" | "canal-tv" | "streaming" | "grafica" | "red-social" | "otro"
type SemaforoColor = "verde" | "amarillo" | "rojo" | "gris"
```

**`app/api/admin/medios/route.ts`:**
GET: `collection("medios").orderBy("createdAt","desc").limit(100)`
POST Zod schema:
```typescript
z.object({
  nombre: z.string().min(2).max(100),
  ciudadPrincipal: z.string().min(2).max(60),
  ciudadSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]),
  tipo: z.enum(["radio","portal-web","canal-tv","streaming","grafica","red-social","otro"]),
  sitioWeb: z.string().url().optional().or(z.literal("")),
  descripcion: z.string().max(500).optional(),
  estado: z.enum(["activo","inactivo","sin-verificar"]).default("sin-verificar"),
  recibePautaOficial: z.boolean().optional(),
  semaforo: z.enum(["verde","amarillo","rojo","gris"]).optional(),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})
```

**`app/api/admin/pautas/route.ts`:**
GET: `collection("pauta_oficial").orderBy("createdAt","desc").limit(100)`
POST Zod schema:
```typescript
z.object({
  medioId: z.string().min(1),
  medioNombre: z.string().min(2).max(100),
  organismo: z.string().min(2).max(150),
  municipio: z.string().min(2).max(60),
  municipioSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]),
  periodo: z.string().min(3).max(50),
  monto: z.string().max(50).optional(),
  concepto: z.string().max(300).optional(),
  numeroDocumento: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  estadoVerificacion: z.enum(["sin-verificar","con-documento","confirmado","observado"]).default("sin-verificar"),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})
```

---

### Agente D — API Route Proveedores del Estado

**Puede ejecutarse en paralelo con:** Agentes A, B, C, E, F
**Depende de:** nada

#### Archivos a crear
- `app/api/admin/proveedores/route.ts`
- `app/api/admin/proveedores/[id]/route.ts`

#### Prompt completo para el agente

Mismo patrón. Leer `app/api/admin/usuarios/route.ts` como modelo.

**Tipos** en `types/transparencia.ts`:
```typescript
type ContratacionTipo = "licitacion" | "contratacion-directa" | "concurso" | "convenio" | "desconocido"
type CumplimientoEstado = "sin-evaluar" | "en-ejecucion" | "cumplido" | "observado"
type SemaforoColor = "verde" | "amarillo" | "rojo" | "gris"
```

GET: `collection("proveedores_estado").orderBy("createdAt","desc").limit(100)`
POST Zod schema:
```typescript
z.object({
  nombre: z.string().min(2).max(150),
  rubro: z.string().min(2).max(100),
  ciudad: z.string().min(2).max(60),
  ciudadSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena"]),
  organismoContratante: z.string().min(2).max(150),
  tipoContratacion: z.enum(["licitacion","contratacion-directa","concurso","convenio","desconocido"]),
  objeto: z.string().max(500).optional(),
  monto: z.string().max(50).optional(),
  periodo: z.string().max(50).optional(),
  fuenteDocumental: z.string().max(200).optional(),
  estadoCumplimiento: z.enum(["sin-evaluar","en-ejecucion","cumplido","observado"]).default("sin-evaluar"),
  semaforo: z.enum(["verde","amarillo","rojo","gris"]).optional(),
  visibilidadPublica: z.boolean().default(false),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
})
```

---

### Agente E — API Route Publicaciones / Noticias

**Puede ejecutarse en paralelo con:** Agentes A, B, C, D, F
**Depende de:** nada

#### Archivos a crear
- `app/api/admin/publicaciones/route.ts`
- `app/api/admin/publicaciones/[id]/route.ts`

#### Prompt completo para el agente

Mismo patrón. Leer `app/api/admin/usuarios/route.ts` como modelo.

Colección: `publicaciones`

POST Zod schema:
```typescript
z.object({
  titulo: z.string().min(5).max(200),
  extracto: z.string().min(10).max(400),
  contenido: z.string().min(20).max(10000),
  categoria: z.enum(["obras","transparencia","reportes","salud","seguridad","general"]).default("general"),
  municipio: z.string().min(2).max(60),
  municipioSlug: z.enum(["charata","las-brenas","corzuela","presidencia-roque-saenz-pena","todos"]),
  autor: z.string().max(100).optional(),
  imagen: z.string().url().optional().or(z.literal("")),
  estadoEditorial: z.enum(["draft","review","published","archived"]).default("draft"),
  visibilidadPublica: z.boolean().default(false),
})
```

Al crear, agregar: `createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()`
Al publicar (estadoEditorial === "published"), agregar: `publishedAt: FieldValue.serverTimestamp()`

---

### Agente F — API Route Ranking de Transparencia

**Puede ejecutarse en paralelo con:** Agentes A, B, C, D, E
**Depende de:** nada

#### Archivos a crear
- `app/api/admin/ranking/route.ts`
- `app/api/admin/ranking/[municipioSlug]/route.ts`

#### Prompt completo para el agente

Mismo patrón. Leer `app/api/admin/usuarios/route.ts` como modelo.

Colección: `ranking_municipios` — un documento por municipio (ID = municipioSlug)

**Tipos** en `types/transparencia.ts`:
```typescript
interface CriteriosRanking {
  publicaListadoObras: boolean
  publicaPresupuesto: boolean
  publicaContratistas: boolean
  publicaAvanceFisico: boolean
  publicaFechas: boolean
  respondePedidos: boolean
  publicaDocumentos: boolean
}
```

GET: listar los 4 documentos del ranking (uno por municipio)

**`app/api/admin/ranking/[municipioSlug]/route.ts`:**

PUT (upsert) — crear o actualizar un municipio:
```typescript
z.object({
  municipio: z.string().min(2).max(60),
  criterios: z.object({
    publicaListadoObras: z.boolean(),
    publicaPresupuesto: z.boolean(),
    publicaContratistas: z.boolean(),
    publicaAvanceFisico: z.boolean(),
    publicaFechas: z.boolean(),
    respondePedidos: z.boolean(),
    publicaDocumentos: z.boolean(),
  }),
  obrasRegistradas: z.number().int().min(0).default(0),
  obrasParalizadas: z.number().int().min(0).default(0),
  accidentesReportados: z.number().int().min(0).default(0),
  reclamosSalud: z.number().int().min(0).default(0),
  pedidosSinRespuesta: z.number().int().min(0).default(0),
})
```

Calcular `puntajeTotal` server-side usando la misma lógica que `calcularPuntajeRanking()` de `types/transparencia.ts`.
Usar `set(..., { merge: true })` para upsert. El doc ID es el `municipioSlug`.

---

## Ola 2 — Páginas admin (frontend de los 6 módulos)
> Ejecutar SOLO después de que Ola 1 esté completa
> Ejecutar Agente A + B + C + D + E + F en PARALELO

### Agente A — Página admin/obras

**Puede ejecutarse en paralelo con:** Agentes B, C, D, E, F
**Depende de:** Ola 1 completa

#### Archivos a crear
- `app/admin/obras/page.tsx`

#### Prompt completo para el agente

**Leer como modelo exacto:** `app/admin/usuarios/page.tsx` — replicar la estructura completa.

Stack: Next.js 16, TypeScript 5, Tailwind CSS 4, shadcn/ui. Leer `types/obras.ts` para los tipos.

La página usa:
- `subscribeAuthState` + redirect a `/admin` si no autenticado
- `getIdToken()` para `Authorization: Bearer <token>` en todas las llamadas fetch
- Header sticky con `ArrowLeft` (link a `/admin/dashboard`) y `LogOut`

**API endpoints disponibles** (creados en Ola 1):
- `GET /api/admin/obras` → `{ obras: ObraPublica[] }`
- `POST /api/admin/obras` → crea obra
- `PATCH /api/admin/obras/[id]` → edita obra
- `DELETE /api/admin/obras/[id]` → elimina obra

**UI de la página:**
1. Botón "Nueva obra" → abre `Dialog` con formulario (React Hook Form + Zod client-side)
2. Tabla (shadcn `Table`) con columnas: Nombre | Municipio | Tipo | Estado | Editorial | Visible | Acciones
3. Acciones por fila:
   - Botón editar (Pencil icon) → abre Dialog con form pre-poblado
   - Toggle `visibilidadPublica` (Eye/EyeOff)
   - Botón eliminar (Trash2) → AlertDialog de confirmación

**Formulario (Dialog) — campos mínimos obligatorios:**
- municipioSlug: Select con las 4 opciones + auto-fill municipio
- nombre: Input
- descripcion: Textarea
- tipo: Select
- estado: Select
- estadoEditorial: Select (draft/review/published/archived)
- visibilidadPublica: Checkbox

**Campos opcionales en el mismo form:**
- ubicacionTexto, origenFondos, ejecucion, responsableInformado, contratista, presupuestoInformado, fechaInicioISO (input type date), fechaFinISO (input type date), nivelVerificacion (Select 1-5), fuenteInformacion

**No debes:** crear API routes, mapas, ni modificar archivos fuera de `app/admin/obras/`.

---

### Agente B — Página admin/pedidos

**Puede ejecutarse en paralelo con:** Agentes A, C, D, E, F
**Depende de:** Ola 1 completa

#### Archivos a crear
- `app/admin/pedidos/page.tsx`

#### Prompt completo para el agente

**Leer como modelo exacto:** `app/admin/usuarios/page.tsx`

Leer `types/transparencia.ts` para los tipos de `PedidoInformacion`.

API:
- `GET /api/admin/pedidos` → `{ pedidos: PedidoInformacion[] }`
- `POST /api/admin/pedidos`
- `PATCH /api/admin/pedidos/[id]`
- `DELETE /api/admin/pedidos/[id]`

Tabla: Fecha | Organismo | Municipio | Tema | Estado | Editorial | Acciones

Formulario campos obligatorios:
- municipioSlug: Select (4 opciones)
- organismo: Input
- tema: Input
- fechaISO: Input type date
- estado: Select (PedidoEstado)
- estadoEditorial: Select
- visibilidadPublica: Checkbox

Opcionales: textoPedido (Textarea), fechaRespuestaISO, respuestaResumen (Textarea)

---

### Agente C — Página admin/medios

**Puede ejecutarse en paralelo con:** Agentes A, B, D, E, F
**Depende de:** Ola 1 completa

#### Archivos a crear
- `app/admin/medios/page.tsx`

#### Prompt completo para el agente

**Leer como modelo exacto:** `app/admin/usuarios/page.tsx`

Esta página gestiona dos colecciones: `medios` y `pauta_oficial`.

Usar `Tabs` de shadcn para separar las dos secciones: **tab "Medios"** y **tab "Pautas Oficiales"**.

API medios:
- `GET /api/admin/medios`, `POST`, `PATCH /api/admin/medios/[id]`, `DELETE`

API pautas:
- `GET /api/admin/pautas`, `POST`, `PATCH /api/admin/pautas/[id]`, `DELETE`

**Tab Medios** — tabla: Nombre | Ciudad | Tipo | Semáforo | Editorial | Acciones
Form campos: nombre, ciudadSlug (Select), tipo (Select MedioTipo), estado (activo/inactivo/sin-verificar), semaforo (Select), recibePautaOficial (Checkbox), sitioWeb, descripcion, visibilidadPublica, estadoEditorial

**Tab Pautas** — tabla: Medio | Organismo | Municipio | Período | Monto | Verificación | Acciones
Form campos: medioId (Input — pegar el ID del medio), medioNombre, organismo, municipioSlug, periodo, monto, concepto, numeroDocumento, fuenteDocumental, estadoVerificacion (Select), visibilidadPublica, estadoEditorial

---

### Agente D — Página admin/proveedores

**Puede ejecutarse en paralelo con:** Agentes A, B, C, E, F
**Depende de:** Ola 1 completa

#### Archivos a crear
- `app/admin/proveedores/page.tsx`

#### Prompt completo para el agente

**Leer como modelo exacto:** `app/admin/usuarios/page.tsx`

API: `GET/POST /api/admin/proveedores`, `PATCH/DELETE /api/admin/proveedores/[id]`

Tabla: Nombre | Ciudad | Organismo | Tipo | Monto | Cumplimiento | Semáforo | Acciones

Form campos obligatorios: nombre, rubro, ciudadSlug (Select), organismoContratante, tipoContratacion (Select)
Opcionales: objeto (Textarea), monto, periodo, fuenteDocumental, estadoCumplimiento (Select), semaforo (Select), visibilidadPublica, estadoEditorial

---

### Agente E — Página admin/publicaciones

**Puede ejecutarse en paralelo con:** Agentes A, B, C, D, F
**Depende de:** Ola 1 completa

#### Archivos a crear
- `app/admin/publicaciones/page.tsx`

#### Prompt completo para el agente

**Leer como modelo exacto:** `app/admin/usuarios/page.tsx`

Esta es la página más completa del CMS. Las publicaciones son noticias/artículos con ciclo editorial.

API: `GET/POST /api/admin/publicaciones`, `PATCH/DELETE /api/admin/publicaciones/[id]`

Tabla: Título | Municipio | Categoría | Estado Editorial | Visible | Fecha | Acciones

**Importante — Badge de estado editorial con colores:**
- `draft` → gris
- `review` → amarillo
- `published` → verde
- `archived` → rojo

Form campos:
- titulo: Input
- extracto: Textarea (max 400 chars con contador)
- contenido: Textarea (max 10000 chars — sin rich text, solo texto plano)
- categoria: Select (obras/transparencia/reportes/salud/seguridad/general)
- municipioSlug: Select (+ "todos" para publicaciones generales)
- autor: Input (opcional)
- imagen: Input URL (opcional)
- estadoEditorial: Select
- visibilidadPublica: Checkbox

En la tabla, mostrar también un botón rápido de "Publicar" (→ `published` + `visibilidadPublica: true`) para los que están en `review`.

---

### Agente F — Página admin/ranking

**Puede ejecutarse en paralelo con:** Agentes A, B, C, D, E
**Depende de:** Ola 1 completa

#### Archivos a crear
- `app/admin/ranking/page.tsx`

#### Prompt completo para el agente

**Leer como modelo exacto:** `app/admin/usuarios/page.tsx`

Esta página es diferente: no es una lista de registros sino un editor de 4 fichas (una por municipio).

API: `GET /api/admin/ranking`, `PUT /api/admin/ranking/[municipioSlug]`

**UI:**

Grid 2x2 de Cards, una por municipio (Charata / Las Breñas / Corzuela / Sáenz Peña).

Cada Card muestra:
- Nombre del municipio
- Puntaje total calculado (0–100) en número grande con color (rojo/amarillo/verde)
- 7 checkboxes con los criterios (editables inline):
  - Publica listado de obras (20 pts)
  - Publica presupuesto (20 pts)
  - Publica contratistas (15 pts)
  - Publica avance físico (15 pts)
  - Publica fechas (10 pts)
  - Publica documentos (10 pts)
  - Responde pedidos (10 pts)
- Campos numéricos: obras registradas, obras paralizadas, accidentes, reclamos salud, pedidos sin respuesta
- Botón "Guardar cambios" por Card (PATCH a `/api/admin/ranking/[municipioSlug]`)

Si el ranking de un municipio no existe todavía, mostrar la card con todos los criterios en `false` y 0 en los contadores. Al guardar, se crea (upsert).

Puntaje se recalcula en el cliente para mostrar preview inmediato mientras el usuario edita los checkboxes. La fórmula: publicaListadoObras×20 + publicaPresupuesto×20 + publicaContratistas×15 + publicaAvanceFisico×15 + publicaFechas×10 + publicaDocumentos×10 + respondePedidos×10.

---

## Ola 3 — Actualizar Dashboard
> Ejecutar SOLO después de que Ola 2 esté completa

### Agente A — Actualizar Dashboard con todos los módulos

**Puede ejecutarse en paralelo con:** nadie (único agente)
**Depende de:** Ola 2 completa

#### Archivos a modificar
- `app/admin/dashboard/page.tsx`

#### Prompt completo para el agente

Leer `app/admin/dashboard/page.tsx`. El dashboard ya tiene cards para: Reportes, Usuarios. Las cards de "Obras Públicas" y "Pedidos de Información" están como placeholders con `Badge variant="secondary">Próximamente`.

Actualizar el archivo para:
1. Reemplazar las 2 cards "Próximamente" con links funcionales a `/admin/obras` y `/admin/pedidos`
2. Agregar 4 cards nuevas: `/admin/medios`, `/admin/proveedores`, `/admin/publicaciones`, `/admin/ranking`
3. Cambiar el grid de `md:grid-cols-4` a `md:grid-cols-3 lg:grid-cols-4` para acomodar 8 cards
4. Íconos sugeridos: Building2 (obras), FileText (pedidos), Newspaper (medios), Store (proveedores), BookOpen (publicaciones), BarChart2 (ranking)

Mantener el mismo estilo de las cards activas (con Link, `group-hover:shadow-md`, texto "Ir a X →").

---

## Verificación final

- [ ] `pnpm tsc --noEmit` sin errores
- [ ] GET `/api/admin/obras` devuelve 401 sin token
- [ ] Dashboard muestra las 8 cards con links funcionales
- [ ] Cada página ABM protege correctamente con auth redirect
- [ ] Formulario de obras crea documento en Firestore `obras_publicas`
- [ ] Toggle visibilidadPublica actualiza el campo en Firestore
- [ ] Publicación con `estadoEditorial: published` aparece en el sitio público
- [ ] Ranking editor actualiza puntaje en tiempo real al marcar checkboxes
