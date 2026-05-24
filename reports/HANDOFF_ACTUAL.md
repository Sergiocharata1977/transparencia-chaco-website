# HANDOFF ACTUAL

## Proyecto
- Repo: `transparencia-chaco-website` (GitHub)
- Rama: `main`
- Deploy: Vercel (configurado)
- Firebase: `transparencia-chaco-website` (us-central1)

## Estado actual — 2026-05-24

**El proyecto está completo en código.** Sitio público + panel admin backoffice CMS 100% implementados.

### Último commit
`fd5bf2a` — feat: complete admin backoffice CMS — 6 content modules

### Commits recientes
- `fd5bf2a` — backoffice CMS completo (6 módulos + API routes)
- `3544280` — rediseño homepage (Codex)
- `33c48d1` — Observatorio Ciudadano 6 olas completas

---

## Lo que está hecho

### Sitio público (100%)
- `/` — homepage rediseñada con hero oscuro, métricas, módulos del observatorio
- `/obras-publicas` + `/obras-publicas/[id]`
- `/accidentes-seguridad`
- `/salud-hospital`
- `/pedidos-informacion`
- `/ranking-transparencia`
- `/medios` + `/medios/[id]`
- `/proveedores-estado`
- `/cargar-reporte` — formulario ciudadano (POST a API Route)
- `/mapa-ciudadano` — mapa Leaflet
- Navbar + Footer actualizados

### Panel Admin (100%)
- `/admin` — login Firebase Auth
- `/admin/dashboard` — 8 cards con todos los módulos
- `/admin/reportes` — gestión de reportes ciudadanos
- `/admin/usuarios` — ABM usuarios Firebase Auth
- `/admin/obras` — ABM obras públicas
- `/admin/pedidos` — ABM pedidos de información
- `/admin/medios` — ABM medios + pautas (2 tabs)
- `/admin/proveedores` — ABM proveedores del estado
- `/admin/publicaciones` — ABM noticias con ciclo editorial
- `/admin/ranking` — editor de ranking por municipio (4 cards)

### API Routes (todas protegidas con Bearer token)
- `/api/reportes` — intake público de reportes ciudadanos
- `/api/admin/usuarios` + `[uid]`
- `/api/admin/obras` + `[id]`
- `/api/admin/pedidos` + `[id]`
- `/api/admin/medios` + `[id]`
- `/api/admin/pautas` + `[id]`
- `/api/admin/proveedores` + `[id]`
- `/api/admin/publicaciones` + `[id]`
- `/api/admin/ranking` + `[municipioSlug]`

### Infraestructura
- Firebase Admin SDK configurado (`lib/firebase/admin-sdk.ts`)
- Firebase Auth cliente (`lib/firebase/auth-client.ts`)
- Firestore rules + indexes actualizados
- `.env.local` completo con credenciales de producción

---

## Pendientes para que funcione en producción

1. **Deploy de reglas Firestore** (una sola vez):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

2. **Crear primer usuario admin** desde Firebase Console → Authentication → Users → Add user

3. **Poblar colecciones** con contenido real usando el panel admin (`/admin/dashboard`)

4. **Verificar Vercel env vars**: asegurarse de que las variables FIREBASE_* estén configuradas en Vercel

---

## Próximos pasos opcionales

Ver `reports/PLAN_FRONTEND_MEJORAS.md` — plan para mejoras visuales y funcionales del sitio público.

---

## Riesgos activos
- Las páginas públicas muestran datos de fallback (hardcodeados) hasta que se cargue contenido real en Firestore
- Leaflet en el mapa requiere browser (SSR deshabilitado) — verificar que el build de Vercel no falle
- Las API routes de admin no tienen rate limiting (aceptable para uso interno)
