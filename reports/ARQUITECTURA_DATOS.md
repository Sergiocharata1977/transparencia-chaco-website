# Arquitectura de Datos — Observatorio Ciudadano de Transparencia

**Fecha:** 2026-05-25
**Proyecto:** `transparencia-chaco-website` (Next.js 16 + Firebase/Firestore)
**Base de datos:** Firestore (us-central1) — proyecto `transparencia-chaco-website`

---

## Principio de organización

Todas las colecciones están organizadas por **tipo de dato**, no por municipio.
Cada documento lleva el campo `municipioSlug` (o `ciudadSlug`) que indica a qué municipio pertenece.

```
obras_publicas/         ← una colección para TODAS las obras de TODOS los municipios
  doc_id_1: { municipioSlug: "charata", nombre: "Pavimento Av. San Martín", ... }
  doc_id_2: { municipioSlug: "las-brenas", nombre: "Edificio municipal", ... }
```

Para consultar datos de un municipio específico basta con filtrar:
```typescript
.where("municipioSlug", "==", "charata")
```

---

## Municipios cubiertos — slugs canónicos

| Municipio | Slug (ID canónico) | Nombre completo |
|---|---|---|
| Charata | `charata` | Charata |
| Las Breñas | `las-brenas` | Las Breñas |
| Corzuela | `corzuela` | Corzuela |
| Presidencia R. S. Peña | `presidencia-roque-saenz-pena` | Presidencia Roque Sáenz Peña |

Los slugs son valores de enum en todos los schemas de Zod. Nunca escribir variantes distintas.

---

## Campos comunes a todas las colecciones

| Campo | Tipo | Descripción |
|---|---|---|
| `municipioSlug` | string (enum) | Slug del municipio al que pertenece |
| `estadoEditorial` | `"draft" \| "review" \| "published" \| "archived"` | Ciclo de vida del contenido |
| `visibilidadPublica` | boolean | `true` = visible en el sitio público |
| `nivelVerificacion` | number (1–5) | 1 = sin verificar, 5 = con documento oficial |
| `createdAt` | Timestamp | `FieldValue.serverTimestamp()` en POST |
| `updatedAt` | Timestamp | `FieldValue.serverTimestamp()` en PATCH/PUT |

**Regla:** el sitio público SOLO muestra documentos con `visibilidadPublica === true`
y `estadoEditorial === "published"`.

---

## Colecciones

### 1. `obras_publicas`

Obras de infraestructura municipal y provincial.

**API admin:** `GET/POST /api/admin/obras` · `PATCH/DELETE /api/admin/obras/[id]`
**Página admin:** `/admin/obras`
**Página pública:** `/obras-publicas` · `/obras-publicas/[id]`

| Campo | Tipo | Descripción |
|---|---|---|
| `municipio` | string | Nombre del municipio (texto) |
| `municipioSlug` | enum | Slug canónico |
| `nombre` | string | Nombre de la obra |
| `descripcion` | string | Descripción detallada |
| `ubicacionTexto` | string? | Dirección o referencia |
| `tipo` | enum | `pavimento \| ripio \| iluminacion \| cloacas \| edificio-publico \| obra-hidraulica \| plaza \| parque \| otro` |
| `origenFondos` | enum | `municipal \| provincial \| nacional \| mixto \| desconocido` |
| `ejecucion` | enum | `administracion-propia \| empresa-contratista \| ejecucion-provincial \| ejecucion-nacional \| desconocido` |
| `estado` | enum | `anunciada \| iniciada \| en-ejecucion \| paralizada \| finalizada \| sin-informacion` |
| `avancePorcentaje` | number? | 0–100 |
| `responsableInformado` | string? | Nombre del funcionario |
| `contratista` | string? | Empresa ejecutora |
| `presupuestoInformado` | string? | Monto en texto libre |
| `fechaInicioISO` | string? | `YYYY-MM-DD` |
| `fechaFinISO` | string? | `YYYY-MM-DD` |
| `fuenteInformacion` | string? | URL o nombre del medio fuente |
| `nivelVerificacion` | 1–5 | |
| `visibilidadPublica` | boolean | |
| `estadoEditorial` | enum | |

---

### 2. `pedidos_informacion`

Solicitudes de acceso a la información pública enviadas a organismos municipales.

**API admin:** `GET/POST /api/admin/pedidos` · `PATCH/DELETE /api/admin/pedidos/[id]`
**Página admin:** `/admin/pedidos`
**Página pública:** `/pedidos-informacion`

| Campo | Tipo | Descripción |
|---|---|---|
| `municipio` | string | |
| `municipioSlug` | enum | |
| `organismo` | string | Ente receptor del pedido |
| `tema` | string | Resumen del pedido |
| `textoPedido` | string? | Texto completo |
| `fechaISO` | string | Fecha de presentación `YYYY-MM-DD` |
| `estado` | enum | `en-plazo \| respondido-completo \| respondido-parcial \| sin-respuesta \| vencido` |
| `fechaRespuestaISO` | string? | Fecha de respuesta |
| `respuestaResumen` | string? | Resumen de la respuesta recibida |
| `nivelVerificacion` | 1–5 | |
| `visibilidadPublica` | boolean | |
| `estadoEditorial` | enum | |

---

### 3. `reportes`

Denuncias y reportes enviados por ciudadanos a través del formulario público `/cargar-reporte`.

**API pública (intake):** `POST /api/reportes`
**Página admin:** `/admin/reportes`
**Página pública:** `/denuncias` (vista de tabla), `/cargar-reporte` (formulario de carga)

| Campo | Tipo | Descripción |
|---|---|---|
| `municipioSlug` | enum | |
| `tipo` | enum | `obra-publica \| accidente \| inseguridad \| hospital \| bache \| iluminacion \| calle \| otro` |
| `titulo` | string | |
| `descripcion` | string | |
| `fechaHechoISO` | string? | |
| `ubicacionTexto` | string? | |
| `anonimo` | boolean | Si `false`, puede tener datos de contacto |
| `subtipo` | string? | Subtipo específico según el tipo principal |
| `gravedad` | enum? | `baja \| media \| alta` |
| `huboDenunciaPolicial` | enum? | `si \| no \| no-sabe` |
| `contactoEmail` | string? | Solo si `anonimo === false` |
| `contactoNombre` | string? | Solo si `anonimo === false` |
| `contactoTelefono` | string? | Solo si `anonimo === false` |
| `visibilidadPublica` | boolean | El admin decide si se muestra |
| `estadoEditorial` | enum | El admin gestiona el ciclo |

> **Nota:** Este es el único formulario de carga pública — ciudadanos pueden enviar sin autenticarse.
> La API `/api/reportes` NO requiere Bearer token.

---

### 4. `medios`

Medios de comunicación que operan en los municipios cubiertos.

**API admin:** `GET/POST /api/admin/medios` · `PATCH/DELETE /api/admin/medios/[id]`
**Página admin:** `/admin/medios` (tab "Medios")
**Página pública:** `/medios` · `/medios/[id]`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nombre del medio |
| `ciudadPrincipal` | string | |
| `ciudadSlug` | enum | Slug canónico (misma tabla que municipioSlug) |
| `tipo` | enum | `radio \| portal-web \| canal-tv \| streaming \| grafica \| red-social \| otro` |
| `sitioWeb` | string? | URL |
| `descripcion` | string? | |
| `estado` | enum | `activo \| inactivo \| sin-verificar` |
| `recibePautaOficial` | boolean? | Indica si recibe pauta |
| `semaforo` | enum? | `verde \| amarillo \| rojo \| gris` |
| `visibilidadPublica` | boolean | |
| `estadoEditorial` | enum | |

---

### 5. `pauta_oficial`

Registros de pauta publicitaria oficial entregada por organismos municipales a medios.
Relacionada con `medios` mediante `medioId`.

**API admin:** `GET/POST /api/admin/pautas` · `PATCH/DELETE /api/admin/pautas/[id]`
**Página admin:** `/admin/medios` (tab "Pautas Oficiales")

| Campo | Tipo | Descripción |
|---|---|---|
| `medioId` | string | ID del documento en `medios` |
| `medioNombre` | string | Nombre denormalizado para lectura rápida |
| `organismo` | string | Municipalidad u organismo que pagó |
| `municipio` | string | |
| `municipioSlug` | enum | |
| `periodo` | string | Ej: `"2024-Q1"`, `"enero 2025"` |
| `monto` | string? | Monto en texto libre |
| `concepto` | string? | Descripción del servicio |
| `numeroDocumento` | string? | N° de expediente/factura |
| `fuenteDocumental` | string? | URL o nombre del documento fuente |
| `estadoVerificacion` | enum | `sin-verificar \| con-documento \| confirmado \| observado` |
| `visibilidadPublica` | boolean | |
| `estadoEditorial` | enum | |

---

### 6. `proveedores_estado`

Contrataciones municipales — empresas y personas que prestan servicios al estado local.

**API admin:** `GET/POST /api/admin/proveedores` · `PATCH/DELETE /api/admin/proveedores/[id]`
**Página admin:** `/admin/proveedores`
**Página pública:** `/proveedores-estado`

| Campo | Tipo | Descripción |
|---|---|---|
| `nombre` | string | Nombre del proveedor |
| `rubro` | string | Rubro de actividad |
| `ciudad` | string | |
| `ciudadSlug` | enum | |
| `organismoContratante` | string | Municipalidad/organismo que contrató |
| `tipoContratacion` | enum | `licitacion \| contratacion-directa \| concurso \| convenio \| desconocido` |
| `objeto` | string? | Descripción del servicio contratado |
| `monto` | string? | Monto en texto libre |
| `periodo` | string? | Período de vigencia |
| `fuenteDocumental` | string? | URL o fuente |
| `estadoCumplimiento` | enum | `sin-evaluar \| en-ejecucion \| cumplido \| observado` |
| `semaforo` | enum? | `verde \| amarillo \| rojo \| gris` |
| `visibilidadPublica` | boolean | |
| `estadoEditorial` | enum | |

---

### 7. `publicaciones`

Noticias y artículos producidos por el equipo del observatorio.

**API admin:** `GET/POST /api/admin/publicaciones` · `PATCH/DELETE /api/admin/publicaciones/[id]`
**Página admin:** `/admin/publicaciones`
**Página pública:** `/publicaciones` · `/publicaciones/[id]` *(pendiente Ola 1 del plan frontend)*

| Campo | Tipo | Descripción |
|---|---|---|
| `titulo` | string | |
| `extracto` | string | Resumen (máx 400 chars) |
| `contenido` | string | Cuerpo completo del artículo |
| `categoria` | enum | `obras \| transparencia \| reportes \| salud \| seguridad \| general` |
| `municipio` | string | |
| `municipioSlug` | enum | Puede ser `"todos"` si aplica a toda la región |
| `autor` | string? | |
| `imagen` | string? | URL de imagen destacada |
| `publishedAt` | Timestamp? | Se asigna automáticamente cuando `estadoEditorial → "published"` |
| `estadoEditorial` | enum | |
| `visibilidadPublica` | boolean | |

> **Especial:** Cuando `estadoEditorial` cambia a `"published"` el backend añade
> `publishedAt: FieldValue.serverTimestamp()` automáticamente.

---

### 8. `ranking_municipios`

Índice de transparencia calculado por el equipo del observatorio.
**Un documento por municipio** — el ID del documento ES el municipioSlug.

**API admin:** `GET /api/admin/ranking` · `PUT /api/admin/ranking/[municipioSlug]`
**Página admin:** `/admin/ranking`
**Página pública:** `/ranking-transparencia`

| Campo | Tipo | Descripción |
|---|---|---|
| `municipioSlug` | string | ID del doc y campo (redundante para queries) |
| `municipio` | string | Nombre legible |
| `criterios.publicaListadoObras` | boolean | Peso: 20 pts |
| `criterios.publicaPresupuesto` | boolean | Peso: 20 pts |
| `criterios.publicaContratistas` | boolean | Peso: 15 pts |
| `criterios.publicaAvanceFisico` | boolean | Peso: 15 pts |
| `criterios.publicaFechas` | boolean | Peso: 10 pts |
| `criterios.respondePedidos` | boolean | Peso: 10 pts |
| `criterios.publicaDocumentos` | boolean | Peso: 10 pts |
| `puntajeTotal` | number (0–100) | Calculado servidor al guardar |
| `obrasRegistradas` | number | Estadística auxiliar |
| `obrasParalizadas` | number | Estadística auxiliar |
| `accidentesReportados` | number | Estadística auxiliar |
| `reclamosSalud` | number | Estadística auxiliar |
| `pedidosSinRespuesta` | number | Estadística auxiliar |
| `updatedAt` | Timestamp | |

**Fórmula de puntaje:**
```
puntajeTotal = Σ (criterio === true ? peso : 0)
// máximo 100 = todos los criterios cumplidos
```

---

## Relaciones entre colecciones

```
ranking_municipios ←── resume ──── obras_publicas
                   ←── resume ──── pedidos_informacion
                   ←── resume ──── reportes

pauta_oficial ─── medioId ───► medios

obras_publicas ─────────────┐
pedidos_informacion ─────────┤  municipioSlug  ──► página /municipios/[slug]/observatorio
reportes ────────────────────┤
medios ──────────────────────┤  (ciudadSlug)
pauta_oficial ───────────────┤
proveedores_estado ──────────┤  (ciudadSlug)
publicaciones ───────────────┘
```

---

## Reglas de seguridad Firestore

```javascript
// Escritura: solo desde Firebase Admin SDK (rutas API protegidas con Bearer token)
// Lectura pública: solo documentos con visibilidadPublica == true
// Lectura admin: solo con token de Firebase Auth verificado server-side
```

Las reglas completas están en `firestore.rules`.
Para aplicarlas: `firebase deploy --only firestore:rules,firestore:indexes`

---

## Página por municipio (pendiente — Ola 2 del plan frontend)

`app/municipios/[slug]/observatorio/page.tsx` consolidará toda la información de un municipio
en una sola vista, cargando en paralelo:

```typescript
const [obras, pedidos, reportes, publicaciones, ranking] = await Promise.all([
  getObrasPublicas(slug),         // obras_publicas where municipioSlug == slug
  getPedidosInformacion(slug),    // pedidos_informacion where municipioSlug == slug
  getReportes(slug),              // reportes where municipioSlug == slug
  getPublicaciones(slug),         // publicaciones where municipioSlug == slug
  getRankingMunicipio(slug),      // ranking_municipios doc(slug)
])
```

---

## Índices Firestore necesarios

Para que las queries compuestas funcionen, el archivo `firestore.indexes.json` debe incluir:

| Colección | Campo 1 | Campo 2 | Orden |
|---|---|---|---|
| `obras_publicas` | `municipioSlug` (ASC) | `createdAt` (DESC) | — |
| `obras_publicas` | `visibilidadPublica` (ASC) | `createdAt` (DESC) | — |
| `pedidos_informacion` | `municipioSlug` (ASC) | `createdAt` (DESC) | — |
| `reportes` | `municipioSlug` (ASC) | `createdAt` (DESC) | — |
| `reportes` | `visibilidadPublica` (ASC) | `createdAt` (DESC) | — |
| `publicaciones` | `estadoEditorial` (ASC) | `publishedAt` (DESC) | — |
| `publicaciones` | `municipioSlug` (ASC) | `publishedAt` (DESC) | — |
| `medios` | `ciudadSlug` (ASC) | `createdAt` (DESC) | — |
| `proveedores_estado` | `ciudadSlug` (ASC) | `createdAt` (DESC) | — |
| `pauta_oficial` | `municipioSlug` (ASC) | `createdAt` (DESC) | — |

---

## Assets en `/public`

Imágenes disponibles en la carpeta `public/` del proyecto:

| Archivo | Uso |
|---|---|
| `logo-modelo1.png` | Logo del observatorio — usado como favicon |
| `foto-principal.png` | Imagen principal para hero/portada |
| `foto123.png` | Imagen auxiliar |
| `375310139_*.jpg` | Fotografía de evento |
| `375453475_*.jpg` | Fotografía de evento |
| `Iniciativa Transparencia Charata Lista 652 gr.jpg` | Material de comunicación |
| `Iniciativa Transparencia Charata Lista 653 ch.jpg` | Material de comunicación |
| `Iniciativa Transparencia Charata Lista 659 gr.jpg` | Material de comunicación |

Para usar en componentes: `<Image src="/logo-modelo1.png" alt="..." />`
