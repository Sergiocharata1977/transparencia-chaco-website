# HANDOFF ACTUAL

## Actualizacion rapida - 2026-05-25
- Home: se corrigio la imagen principal del hero para usar `/foto-principal.png` en lugar de `/hero-transparency-glass.png`.
- Validacion: `npx tsc --noEmit` paso sin errores.
- Verificacion visual local: bloqueada por conflicto preexistente de rutas dinamicas `app/publicaciones/[id]` y `app/publicaciones/[slug]`.

## Proyecto
- Repo: `transparencia-chaco-website` (GitHub)
- Rama: `main`
- Deploy: Vercel (configurado)
- Firebase: `transparencia-chaco-website` (us-central1)

## Estado actual — 2026-05-25

**El proyecto está 100% implementado en código.** Sitio público completo + panel admin backoffice CMS + todas las mejoras frontend del plan.

### Últimos commits
- `1ebf6e0` — Ola 2+3 frontend: buscador global, observatorio por municipio, nav final
- `d9cbd27` — Ola 1 frontend: obras UX, publicaciones pública, SEO + stats dinámicos
- `04cdbfe` — ciudades collection: ABM dinámico de municipios
- `2dad3bd` — docs: ARQUITECTURA_DATOS.md
- `f2e2ea7` — favicon logo-modelo1.png

---

## Lo que está hecho

### Sitio público (100%)
- `/` — homepage con StatsObservatorio dinámico (cuenta desde Firestore), SEO Open Graph
- `/obras-publicas` — filtros en URL, paginación 12/pág, toggle grilla/lista, ordenamiento
- `/obras-publicas/[id]` — detalle con barra de progreso, link OpenStreetMap, generateMetadata
- `/accidentes-seguridad`, `/salud-hospital`
- `/pedidos-informacion`
- `/ranking-transparencia`
- `/medios` + `/medios/[id]`
- `/proveedores-estado`
- `/publicaciones` — listado noticias filtrado por ciudad y categoría
- `/publicaciones/[id]` — artículo completo con breadcrumb y metadata
- `/denuncias` — ABM con modal popup para cargar nueva denuncia
- `/cargar-reporte` — formulario ciudadano
- `/mapa-ciudadano` — mapa Leaflet
- `/buscar?q=` — buscador global (obras, noticias, pedidos)
- `/municipios/[slug]/observatorio` — dashboard por municipio (stats, obras, noticias, links)
- Navbar: BuscadorGlobal + link Noticias + dropdown Municipios (4 observatorios) + mobile
- Footer: columnas Explorar, Municipios, Participá con todos los links

### Panel Admin (100%)
- `/admin` — login Firebase Auth
- `/admin/dashboard` — 9 cards (incluyendo Ciudades Cubiertas)
- `/admin/ciudades` — ABM ciudades cubiertas (activa/inactiva, slug auto-generado)
- `/admin/reportes` — gestión de reportes ciudadanos
- `/admin/usuarios` — ABM usuarios Firebase Auth
- `/admin/obras` — ABM obras públicas (carga ciudades dinámicamente)
- `/admin/pedidos` — ABM pedidos de información (carga ciudades dinámicamente)
- `/admin/medios` — ABM medios + pautas (2 tabs, carga ciudades dinámicamente)
- `/admin/proveedores` — ABM proveedores del estado (carga ciudades dinámicamente)
- `/admin/publicaciones` — ABM noticias con ciclo editorial (carga ciudades dinámicamente)
- `/admin/ranking` — editor de ranking por municipio (4 cards, 7 criterios, puntaje automático)

### Colecciones Firestore
- `obras_publicas`, `pedidos_informacion`, `reportes`, `medios`, `pauta_oficial`
- `proveedores_estado`, `publicaciones`, `ranking_municipios`
- `ciudades` — nueva, es la fuente de verdad de municipios cubiertos

### Infraestructura
- Firebase Admin SDK (`lib/firebase/admin-sdk.ts`)
- Firebase Auth cliente (`lib/firebase/auth-client.ts`)
- Servicios públicos: obras, reportes, transparencia, publicaciones, ciudades
- `lib/firebase/ciudades.ts` — `getCiudades`, `getCiudadesActivas`, `CIUDADES_FALLBACK`
- Todos los Zod enums de municipioSlug cambiados a `z.string()` (dinámico)
- Firestore rules + indexes actualizados
- `.env.local` con credenciales de producción
- Logo `logo-modelo1.png` como favicon
- Imágenes reales del proyecto en `/public`

### Documentación
- `reports/ARQUITECTURA_DATOS.md` — colecciones, campos, slugs canónicos, índices
- `reports/PLAN_FRONTEND_MEJORAS.md` — plan completado (3 olas, 6 agentes)

---

## Pendientes para que funcione en producción

1. **Crear primer usuario admin** desde Firebase Console → Authentication → Users → Add user
   - Login en: `[dominio].vercel.app/admin` (NO `/login`)

2. **Deploy de reglas Firestore** (una sola vez):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

3. **Poblar colecciones:**
   - Ir a `/admin/ciudades` → dar de alta Charata (slug: `charata`, activa: sí)
   - Luego cargar obras, noticias, pedidos, etc. desde los módulos del admin

4. **Verificar Vercel env vars**: FIREBASE_* deben estar configuradas en Vercel

---

## Pendientes de desarrollo (próximas features)

### Prioridad alta
1. **Métricas de calles** — Colección `calles_municipio`:
   - Metros de calles asfaltadas vs ripio/tierra por municipio
   - Evolución histórica (registros por año)
   - Vista pública con gráfico de evolución
   - ABM en admin para cargar datos por municipio y período

2. **Sistema documental** — Colección `documentos`:
   - Carga de leyes, ordenanzas, reglamentos, resoluciones
   - Campos: título, tipo (ley/ordenanza/resolución/decreto), municipio, fecha, número, URL archivo PDF
   - Página pública `/documentos` con filtros por tipo y municipio
   - ABM en admin `/admin/documentos`

### Prioridad media (del plan original)
- Índice de transparencia más granular por área (salud, obras, contrataciones)
- Alertas ciudadanas por email cuando se actualiza un pedido
- Export a CSV desde el admin

---

## Riesgos activos
- Las páginas públicas muestran datos de fallback (hardcodeados) hasta que se cargue contenido en Firestore
- Leaflet en el mapa requiere browser (SSR deshabilitado) — verificar build de Vercel
- `ciudades` collection vacía en producción hasta que el admin cargue la primera ciudad
- Sin rate limiting en API routes de admin (aceptable para uso interno)
- Buscador global es client-side (carga todos los registros) — puede ser lento con >500 docs por colección
