# Plan Frontend Mejoras — Sitio Público Transparencia

**Fecha:** 2026-05-24
**Feature:** Mejoras visuales, UX y funcionales del sitio público del Observatorio Ciudadano
**Proyecto:** `transparencia-chaco-website` (Next.js 16 + Firebase + shadcn/ui)
**Prerrequisito:** backoffice CMS completo ✅, contenido cargado en Firestore

---

## Contexto

El sitio público está 100% funcional pero muestra datos de fallback (hardcodeados). Una vez que el equipo cargue contenido real en Firestore, el sitio estará listo para el público. Este plan cubre las mejoras de UX y visuales que aumentarán el impacto del observatorio.

---

## Resumen de olas

| Ola | Agentes | Paralelos entre sí | Dependen de |
|-----|---------|---------------------|-------------|
| 1 | A, B, C | Sí | Nada (mejoras independientes) |
| 2 | A, B | Sí | Ola 1 |
| 3 | A | Único | Ola 2 |

---

## Ola 1 — Mejoras de páginas existentes

### Agente A — Página de obras con detalle y filtros avanzados

**Puede ejecutarse en paralelo con:** B, C
**Depende de:** nada

#### Objetivo
Mejorar `/obras-publicas` con filtros persistentes en URL (searchParams), paginación y vista de mapa embebido.

#### Archivos a modificar
- `app/obras-publicas/page.tsx` — filtros en URL, paginación client-side
- `app/obras-publicas/[id]/page.tsx` — agregar mini-mapa si hay coordenadas, sección de comentarios/historial

#### Archivos a crear
- `components/obras/obra-card.tsx` — card reutilizable de obra
- `components/obras/filtros-obras.tsx` — panel de filtros extraído como componente

#### Prompt completo para el agente

Estás trabajando en Next.js 16, TypeScript 5, Tailwind CSS 4, shadcn/ui. El proyecto está en `c:\Users\Usuario\Documents\Proyectos\ISO -conjunto\Web Site transparencia`.

Lee `app/obras-publicas/page.tsx` y `app/obras-publicas/[id]/page.tsx` antes de modificar.

**Mejoras a `app/obras-publicas/page.tsx`:**
1. Persistir filtros en la URL con `useSearchParams` y `useRouter` (push al cambiar filtro)
2. Paginación client-side: mostrar 12 obras por página, con botones Anterior/Siguiente
3. Vista alternativa: toggle entre vista grid (cards) y vista lista (tabla compacta)
4. Ordenamiento: por fecha (más reciente), por estado, por municipio
5. Contador de resultados: "X obras encontradas"

**Mejoras a `app/obras-publicas/[id]/page.tsx`:**
1. Si `coordenadas` existe, mostrar mini-mapa estático (imagen de OpenStreetMap o placeholder con la dirección)
2. Sección "Estado del avance": barra de progreso visual si `avancePorcentaje` existe
3. Metadata de SEO: `generateMetadata` con título y descripción de la obra

**Criterio de éxito:** Los filtros se preservan al recargar la página. La paginación funciona. TypeScript sin errores.

---

### Agente B — Página de publicaciones/noticias pública

**Puede ejecutarse en paralelo con:** A, C
**Depende de:** nada

#### Objetivo
Crear la página pública de noticias y artículos del observatorio, que muestra publicaciones con `estadoEditorial: "published"`.

#### Archivos a crear
- `app/publicaciones/page.tsx` — listado de noticias
- `app/publicaciones/[id]/page.tsx` — artículo completo
- `app/publicaciones/loading.tsx` — skeleton
- `lib/firebase/publicaciones.ts` — servicio de lectura con patrón fallback

#### Prompt completo para el agente

Estás trabajando en Next.js 16, TypeScript 5, Tailwind CSS 4, shadcn/ui. Lee `lib/firebase/obras.ts` como modelo exacto del patrón de servicio Firebase.

**`lib/firebase/publicaciones.ts`** — siguiendo exactamente el patrón de `lib/firebase/obras.ts`:
```typescript
// getPublicaciones(municipioSlug?: string): Promise<Publicacion[]>
// — colección "publicaciones", where estadoEditorial == "published" AND visibilidadPublica == true
// — orderBy publishedAt desc, limit 20

// getPublicacionById(id: string): Promise<Publicacion | null>

interface Publicacion {
  id: string
  titulo: string
  extracto: string
  contenido: string
  categoria: string
  municipio: string
  municipioSlug: string
  autor?: string
  imagen?: string
  publishedAt?: string
  createdAt?: string
}
```

**`app/publicaciones/page.tsx`** — "use client":
- Header: "Noticias del Observatorio"
- Filtro por municipio y categoría
- Cards de noticias: imagen (si existe), título, extracto, categoría (Badge), municipio, fecha
- Link a `/publicaciones/[id]`

**`app/publicaciones/[id]/page.tsx`** — server component con `generateMetadata`:
- Imagen destacada (si existe)
- Título, autor, fecha publicación, categoría
- Contenido completo (texto plano con whitespace-pre-wrap)
- Breadcrumb: Inicio > Noticias > [título]
- Botón "Volver a Noticias"

Agregar link "Noticias" en el navbar (modificar `components/navbar.tsx`).

**Criterio de éxito:** Las publicaciones published aparecen. Las drafts/archived NO aparecen. TypeScript sin errores.

---

### Agente C — Mejoras visuales de la homepage y SEO base

**Puede ejecutarse en paralelo con:** A, B
**Depende de:** nada

#### Objetivo
Agregar métricas dinámicas desde Firestore a la homepage, mejorar el SEO con metadata y Open Graph, y agregar un componente de estadísticas en tiempo real.

#### Archivos a modificar
- `app/page.tsx` — conectar métricas a Firestore, mejorar estructura
- `app/layout.tsx` — metadata global, Open Graph, favicon

#### Archivos a crear
- `components/home/stats-observatorio.tsx` — contador de obras/reportes/pedidos en tiempo real
- `components/home/municipios-grid.tsx` — grid de municipios con acceso rápido a sus módulos

#### Prompt completo para el agente

Estás trabajando en Next.js 16, TypeScript 5. Lee `app/page.tsx` y `app/layout.tsx` antes de modificar.

**`app/layout.tsx`** — agregar metadata completa:
```typescript
export const metadata: Metadata = {
  title: { default: "Observatorio Ciudadano de Transparencia | Chaco", template: "%s | Observatorio Transparencia Chaco" },
  description: "Monitoreamos obras públicas, reportes ciudadanos, pedidos de información y transparencia institucional en Charata, Las Breñas, Corzuela y Presidencia Roque Sáenz Peña.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Observatorio Transparencia Chaco",
  },
}
```

**`components/home/stats-observatorio.tsx`** — "use client":
Mostrar 4 contadores animados (usando useState + useEffect para animar desde 0):
- Total de obras registradas
- Total de reportes ciudadanos
- Total de pedidos de información
- Municipios cubiertos (siempre 4)
Leer los totales desde Firestore (getObrasPublicas, getReportes, getPedidosInformacion) al montar.
Si Firebase no está disponible, mostrar valores de fallback (0).

**`app/page.tsx`** — reemplazar la sección de métricas estáticas con `<StatsObservatorio />`.
Agregar `generateMetadata` con descripción específica del homepage.

**Criterio de éxito:** Las métricas se cargan desde Firestore. El SEO tiene titulo y descripción correctos. TypeScript sin errores.

---

## Ola 2 — Features nuevos del sitio público

### Agente A — Buscador global del observatorio

**Puede ejecutarse en paralelo con:** B
**Depende de:** Ola 1 completa

#### Objetivo
Agregar un buscador global que permita buscar entre obras, pedidos, noticias y reportes.

#### Archivos a crear
- `app/buscar/page.tsx` — página de resultados de búsqueda
- `components/busqueda/buscador-global.tsx` — input de búsqueda para el navbar

#### Prompt completo para el agente

Implementar búsqueda client-side básica (sin Algolia ni índices externos). La búsqueda carga todos los registros publicados al montar y filtra localmente con `.toLowerCase().includes(query)`.

**`components/busqueda/buscador-global.tsx`** — "use client":
- Input con ícono Search de Lucide
- Al hacer Enter o click en buscar: `router.push(\`/buscar?q=\${encodeURIComponent(query)}\`)`
- Agregarlo al navbar (leer `components/navbar.tsx`)

**`app/buscar/page.tsx`** — "use client":
- Lee `?q=` de los searchParams
- Carga en paralelo: obras, pedidos, noticias (solo published/visibles)
- Filtra por query en título, descripción, municipio
- Muestra resultados agrupados por tipo: "Obras (N)", "Pedidos (N)", "Noticias (N)"
- Si no hay resultados: mensaje "No se encontraron resultados para '[query]'"
- Skeleton mientras carga

**Criterio de éxito:** La búsqueda retorna resultados relevantes. TypeScript sin errores.

---

### Agente B — Página de municipio individual

**Puede ejecutarse en paralelo con:** A
**Depende de:** Ola 1 completa

#### Objetivo
Crear una página por municipio que consolide toda la información del observatorio para esa ciudad.

#### Archivos a crear
- `app/municipios/[slug]/observatorio/page.tsx` — dashboard del observatorio por municipio

#### Prompt completo para el agente

Estás trabajando en Next.js 16. El proyecto ya tiene `/municipios/[slug]/page.tsx` — leerlo como base.

Los slugs válidos son: `charata`, `las-brenas`, `corzuela`, `presidencia-roque-saenz-pena`.

**`app/municipios/[slug]/observatorio/page.tsx`** — "use client":

1. Header con nombre del municipio y subtítulo "Observatorio de Transparencia"
2. Grid de estadísticas: obras registradas, reportes ciudadanos, pedidos de información, puntaje de transparencia
3. Sección "Obras recientes": últimas 3 obras de ese municipio
4. Sección "Últimos reportes": últimos 3 reportes
5. Sección "Pedidos de información": últimos 3 pedidos
6. Link "Ver todas las obras de [Municipio]" → `/obras-publicas?municipio=[slug]`
7. Link "Ver ranking completo" → `/ranking-transparencia`

Cargar todos los datos en paralelo con `Promise.all`.

**Criterio de éxito:** La página carga datos específicos del municipio. TypeScript sin errores.

---

## Ola 3 — Integración y pulido final

### Agente A — Navbar, footer y navegación final

**Puede ejecutarse en paralelo con:** nadie (único)
**Depende de:** Ola 2 completa

#### Objetivo
Integrar todas las nuevas páginas en la navegación, agregar breadcrumbs consistentes y pulir la experiencia mobile.

#### Archivos a modificar
- `components/navbar.tsx` — agregar buscador, link Noticias, link por municipio
- `components/footer.tsx` — agregar link Noticias, link Buscar
- Revisar todos los `loading.tsx` para consistencia visual

#### Prompt completo para el agente

Lee `components/navbar.tsx` y `components/footer.tsx` antes de modificar.

**navbar.tsx:**
1. Agregar `<BuscadorGlobal />` (de `components/busqueda/buscador-global.tsx`) en el header
2. Agregar "Noticias" → `/publicaciones` en el menú
3. El menú "Municipios" puede tener un dropdown con los 4 municipios y link a su observatorio

**footer.tsx:**
1. Agregar columna "Información" con: Noticias, Buscar, Quiénes somos
2. Agregar sección de municipios con links a `/municipios/[slug]/observatorio`

**Pulido mobile:**
- Verificar que el navbar colapse correctamente en mobile
- Verificar que el buscador sea accesible en mobile

**Criterio de éxito:** Todos los links nuevos funcionan. La navegación mobile es correcta. TypeScript sin errores.

---

## Verificación final

### Funcional
- [ ] `/publicaciones` muestra solo artículos en estado `published`
- [ ] `/buscar?q=charata` retorna resultados de obras, pedidos y noticias
- [ ] `/municipios/charata/observatorio` muestra datos reales de Charata
- [ ] Filtros en `/obras-publicas` se preservan en la URL
- [ ] Métricas del home se cargan desde Firestore
- [ ] Metadata SEO correcta en todas las páginas

### TypeScript
- [ ] `pnpm tsc --noEmit` sin errores

### SEO y performance
- [ ] Open Graph configurado
- [ ] Títulos de página únicos por ruta
- [ ] Loading skeletons en todas las páginas de datos

### Mobile
- [ ] Navbar funciona en 375px
- [ ] Cards son legibles en mobile
- [ ] Formulario de reporte es usable en mobile

---

## Notas técnicas

- La búsqueda es client-side (sin backend) — funciona con los datos ya cargados en Firestore
- Las páginas por municipio requieren que haya contenido real cargado en las colecciones
- El buscador global en el navbar agrega peso a todas las páginas — considerar lazy loading
- Para el mapa en la ficha de obra: usar un enlace a OpenStreetMap con las coordenadas en vez de incrustar Leaflet (más liviano)
