# HANDOFF ACTUAL

## Actualizacion rapida - 2026-05-25
- Home: se corrigio la imagen principal del hero para usar `/foto-principal.png` en lugar de `/hero-transparency-glass.png`.
- Validacion: `npx tsc --noEmit` paso sin errores.
- Verificacion visual local: bloqueada por conflicto preexistente de rutas dinamicas `app/publicaciones/[id]` y `app/publicaciones/[slug]`.

## Actualizacion 2026-07-10 - Rediseño visual Stitch aplicado

- Se aplico la direccion visual del mockup Stitch a la web publica: paleta teal/cristal, contenido mas centrado, bloques blancos y celestes claros, metricas compactas y radios discretos.
- Home (`app/page.tsx`): hero simplificado, secciones centradas, tarjetas de metricas/herramientas alineadas al nuevo lenguaje y estados vacios para municipios/publicaciones cuando Firestore no tenga datos.
- Monitoreo (`app/municipios/page.tsx`): pagina reescrita manteniendo la logica de Firestore, filtros y cards; ahora usa cabecera centrada, metricas grises con numeros turquesa, filtros en banda celeste y estado vacio.
- Control de compromisos (`app/acuerdos/page.tsx`): header y cards ajustados a la identidad visual sin fondos radiales.
- Navegacion/footer: `components/navbar.tsx` y `components/footer.tsx` ahora usan el asset existente `/logo-modelo1.png` en lugar de `/logo-cristal.png`.
- Validacion: `git diff --check` OK. No se corrio `pnpm type-check` por regla operativa local del clon en D: sin dependencias.

## Actualizacion 2026-07-10 (2) - Registros y auth admin estabilizados

- Se reviso el fix de la otra IA (`84057d2`): el `trim()` en `lib/firebase/admin-sdk.ts` es correcto y evita el 401 global causado por salto de linea en `FIREBASE_PROJECT_ID`.
- Se corrigio el problema pendiente de registros publicos: `lib/firebase/public-site.ts` ya no consulta la coleccion legacy `municipios`; ahora deriva `getMunicipios()` y `getMunicipioBySlug()` desde `ciudades`, que es el ABM canonico.
- Se ajusto `lib/firebase/ciudades.ts` para que `getCiudadBySlug()` use `CIUDADES_FALLBACK` cuando la coleccion esta vacia o falta un documento fallback, evitando listado con ciudades pero detalle "no encontrado".
- Se agrego `lib/api/admin-auth.ts` y todas las rutas `app/api/admin/**` usan `requireAdminAuth`; token ausente/invalido sigue siendo 401, pero errores de configuracion del Admin SDK quedan logueados y responden 500.
- Validacion liviana: `git diff --check` OK; `rg` confirmo que no quedan lecturas `collection(db, "municipios")` ni `verifyIdToken` duplicado en rutas admin.
- No se corrio `pnpm type-check` por regla operativa local del clon en D: sin dependencias.

## Actualizacion 2026-07-10 (3) - Menu publico simplificado + Nosotros consolidado

- `components/navbar.tsx`: menu superior reorganizado en Inicio, Municipios, Observatorio, Compromisos, Participar y Nosotros. Noticias, Denuncias, Rendicion y Acuerdos quedan agrupados en dropdowns.
- `components/footer.tsx`: footer alineado con la nueva arquitectura de navegacion.
- `app/quienes-somos/page.tsx`: pagina consolidada para contar historia, origen, principios, independencia politica, base legal, compromisos y CTA de participacion.
- No se borraron rutas publicas existentes; se unifico la experiencia desde el menu para evitar duplicacion visible.
- Validacion liviana: `git diff --check` OK. No se corrio `pnpm type-check` por regla operativa local del clon en D: sin dependencias.

## Actualizacion 2026-07-10 (4) - Registro Calles y Pavimento

- Se implemento el modulo `calles_municipio` para relevar calle por calle el estado de superficie: asfaltada, no asfaltada, ripio, tierra, adoquin, en obra o sin dato.
- Admin: nueva pagina `/admin/calles` y APIs `/api/admin/calles` + `/api/admin/calles/[id]` para crear, editar, publicar/ocultar y eliminar tramos. Cada tramo guarda ciudad, departamento, calle, desde/hasta, barrio, metros, estado de obra, fuente, evidencia, foto, obra relacionada y geometria LineString.
- Historial: al crear y al actualizar campos de relevamiento se agrega un item en `historial`, para comparar el avance año a año sin perder el dato anterior.
- Publico: nueva pagina `/calles-pavimento` con filtros por municipio/año, metricas de tramos/metros, tabla detalle y mapa Leaflet de lineas por estado.
- Integracion: el modulo aparece en menu Observatorio, footer, home, dashboard admin, sidebar admin, observatorio municipal y como capa opcional dentro de `/mapa-ciudadano`.
- Firestore: se agregaron y desplegaron reglas para `calles_municipio` (`read` publico, `write` autenticado) con `firebase deploy --only firestore:rules`.
- Validacion liviana: `git diff --check` OK. No se corrio `pnpm type-check` ni build porque este clon en D: no tiene `node_modules` y la regla operativa local indica no instalar dependencias.

## Actualizacion 2026-07-10 (5) - Fix deploy Calles y Pavimento

- Se corrigieron dos deploys fallidos de Vercel: `lucide-react@0.454.0` no exporta `Road`.
- Archivo: `app/calles-pavimento/page.tsx`; se reemplazo `Road` por `Route`.
- Validacion liviana: `git diff --check` OK y `rg "\bRoad\b"` sin resultados. No se corrio build local por regla operativa del clon en D: sin `node_modules`.

## Actualizacion 2026-07-10 (6) - Header publico en dos niveles

- Se reorganizo `components/navbar.tsx` en header de dos filas: marca + buscador/Sumate arriba, navegacion principal abajo.
- Orden desktop y mobile: Inicio, Nosotros, Municipios, Observatorio, Compromisos, Participar; `Nosotros` ya no queda al final.
- `components/busqueda/buscador-global.tsx` ahora acepta placeholder/ancho desde props y usa formulario `role="search"`.
- Mobile: menu en panel con secciones desplegables nativas (`details`) y `Sumate` separado sin duplicarse dentro de Participar.
- Validacion liviana: `git diff --check` OK. No se corrio build local por regla operativa del clon en D: sin `node_modules`.

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
1. **Mejoras de Calles y Pavimento**:
   - Cargar datos reales desde `/admin/calles`
   - Incorporar importacion masiva CSV/GeoJSON
   - Agregar grafico de evolucion anual cuando haya suficientes registros historicos
   - Vincular por selector directo con obras publicas existentes

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

---

## Actualizacion 2026-07-09 - Clon local en disco D sin dependencias

- Repo clonado en `D:\Proyectos\transparencia-chaco-website` desde `https://github.com/Sergiocharata1977/transparencia-chaco-website.git`.
- Rama: `main`.
- Ultimo commit observado al clonar: `cd448ac feat(admin): sidebar izquierdo + limpiar headers de todas las paginas admin`.
- `node_modules`: no instalado.
- Lockfile presente: `pnpm-lock.yaml`.
- Git marco el repo como `dubious ownership` por estar en `D:`; se agrego `D:/Proyectos/transparencia-chaco-website` como `safe.directory`.

### Regla operativa local

Trabajar **sin instalar dependencias localmente**:

- No correr `pnpm install`, `npm install` ni crear `node_modules`.
- No depender de `pnpm dev`, `pnpm build` ni `pnpm type-check` en esta maquina.
- Validar con controles livianos: `git status`, `git diff`, `git diff --check`, `rg`, lectura de archivos y revision puntual.
- Hacer `git add` selectivo, commit corto y `git push origin main` cuando el cambio este revisado.

La validacion pesada debe quedar para Vercel/CI o una maquina con dependencias instaladas.

---

## Actualizacion 2026-07-09 - Modelo canonico de registros

- Se definio un handoff funcional para ordenar los registros del observatorio sin duplicar conceptos.
- Documento rector: `reports/HANDOFF_REGISTROS_2026-07-09.md`.
- Decision principal: `ciudades` queda como ABM madre y debe incluir `departamento`.
- Ejemplo definido: Charata pertenece al departamento Chacabuco.
- Jerarquia propuesta: Provincia -> Departamento -> Ciudad/Municipio -> Noticias, Obras Publicas, Notas enviadas al municipio y Reclamos por ente.
- Unificacion propuesta:
  - `pedidos_informacion` debe evolucionar/mapearse a `notas_municipio` con `tipo: pedido_informacion`.
  - `reportes` debe evolucionar/mapearse a `reclamos`, clasificado por `enteResponsable`.
- No se tocaron rutas ni codigo funcional en esta actualizacion; es documentacion de arquitectura/producto para la proxima ola.

---

## Actualizacion 2026-07-09 (2) - Implementacion admin del modelo canonico

Plan ejecutado: `reports/PLAN_ADMIN_REGISTROS_2026-07-09.md` (4 olas, generado con /plan-olas).

### Hecho

- **Ola 1 — Ciudades con departamento (ABM madre):**
  - `lib/firebase/ciudades.ts`: campo `departamento` en interfaz, normalizador y fallback (Charata -> Chacabuco, Las Brenas -> Nueve de Julio, Corzuela -> General Belgrano, Saenz Pena -> Comandante Fernandez).
  - API ciudades: `departamento` requerido al crear, opcional al editar.
  - `/admin/ciudades`: campo Departamento en formulario + columna en tabla.
- **Ola 2 — Backend nuevos modulos:**
  - `types/notas.ts` y `types/reclamos.ts` con enums y labels.
  - API `/api/admin/notas-municipio` (+ `[id]`) sobre coleccion `notas_municipio`.
  - API `/api/admin/reclamos` (+ `[id]`) sobre coleccion `reclamos`.
  - `firestore.rules`: reglas para `notas_municipio` (read publico / write auth) y `reclamos` (create publico para futuro form ciudadano, read publico, update/delete auth).
- **Ola 3 — Paginas admin:** `/admin/notas-municipio` y `/admin/reclamos` (ABM completo con Dialog + RHF + Zod, toggle publico, AlertDialog de borrado). Al guardar denormalizan `ciudadNombre`, `departamento` y `provincia` desde la ciudad seleccionada.
- **Ola 4 — Navegacion:** sidebar con grupo "Legacy" (Reportes y Pedidos viejos), modulos nuevos en Gestion de Contenido; dashboard con 11 cards.

### Pendientes

- `firebase deploy --only firestore:rules` (correr en maquina con firebase-tools).
- Frontend publico (Ola 5 del handoff de registros): paginas publicas de notas y reclamos, menu publico.
- Migracion de datos legacy (`pedidos_informacion` -> `notas_municipio`, `reportes_ciudadanos` -> `reclamos`) — Ola 6.
- Validacion pesada (type-check/build) queda para el deploy automatico de Vercel; este clon en D: no instala dependencias.

### Riesgos

- Colecciones `notas_municipio` y `reclamos` vacias hasta que se cargue contenido desde el admin.
- Reglas Firestore nuevas no aplican hasta hacer el deploy de rules.
- El campo `departamento` es requerido al crear ciudades nuevas; las existentes en Firestore no lo tienen hasta editarlas (la UI muestra "—").

---

## Actualizacion 2026-07-09 (3) - Limpieza de frontend + deploy Firestore

### Datos hardcodeados eliminados

Se vaciaron los arrays de fallback para que el sitio publico muestre solo datos reales de Firestore (estado vacio honesto en vez de contenido inventado). ~1000 lineas borradas.

- `lib/fallback/obras-fallback.ts` -> `fallbackObras = []`
- `lib/fallback/transparencia-fallback.ts` -> pedidos, medios, pautas, proveedores, ranking = []
- `lib/fallback/reportes-fallback.ts` -> reportes, accidentes, salud = []
- `lib/site-content.ts` -> municipios y publicaciones = [] (helpers by-slug intactos)
- `CIUDADES_FALLBACK` se conserva (semilla real de las 4 ciudades cubiertas, no es contenido inventado).

### Menu publico reordenado

`components/navbar.tsx` -> dropdown Observatorio deja solo registros con ABM que funciona, en orden: Obras Publicas, Pedidos de Informacion, Medios y Pauta, Proveedores del Estado, Ranking de Transparencia, Mapa Ciudadano. Se quitaron del menu (no se borraron las paginas) "Seguridad y Accidentes" y "Salud / Hospital" porque no tienen ABM en el admin que los alimente.

### Firestore desplegado (CLI, firebase-tools 15.3.1)

- `firebase deploy --only firestore:rules` OK -> reglas de `notas_municipio` y `reclamos` ya activas en produccion.
- `firebase deploy --only firestore:indexes` OK, tras quitar de `firestore.indexes.json` un indice invalido de campo unico en `ranking_municipios` (Firestore crea los single-field solos y rechazaba declararlo).

### Pendientes / notas

- `/municipios` (listado) queda vacio hasta poblar la coleccion `municipios` (no tiene admin; solo existe `/admin/ciudades` sobre `ciudades`). A futuro: unificar `/municipios` para leer de `ciudades` o sembrar `municipios`.
- Los observatorios municipales `/municipios/[slug]/observatorio` siguen renderizando (nombre desde mapa hardcodeado NOMBRES_MUNICIPIO); muestran secciones vacias hasta cargar datos.
- Falta cargar datos reales desde el admin para que el sitio publico deje de verse vacio.

### SEGURIDAD - accion pendiente del usuario

El usuario pego en el chat la clave privada del service account de Firebase Admin (private_key_id bf9e6d14...). Esa credencial quedo expuesta. Debe revocarse/rotarse en Firebase Console -> Cuentas de servicio (o Google Cloud IAM). No se guardo en ningun archivo del repo.
