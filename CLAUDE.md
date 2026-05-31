# Transparencia Chaco — Contexto del Proyecto

Sitio público municipal de transparencia del Chaco. Next.js App Router + Firebase + TypeScript.

## Comandos esenciales

```bash
pnpm dev             # desarrollo local
pnpm build           # build de producción
pnpm type-check      # npx tsc --noEmit — correr antes de cada commit
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Stack técnico

- Next.js App Router + TypeScript + React 19
- Firebase (Firestore/Auth/Storage) + Admin SDK
- Zod + React Hook Form
- Radix UI / shadcn-style + Tailwind + Lucide icons
- Vercel (deploy automático desde `main`)

## Protocolo de cierre — OBLIGATORIO al terminar cada sesión

1. Ejecutar `pnpm type-check`.
2. Ejecutar `git status --short` y `git diff --stat`.
3. Actualizar `reports/HANDOFF_ACTUAL.md` con lo hecho, archivos modificados, pendientes y riesgos.
4. Hacer `git add` selectivo y `git commit -m "descripcion"`.
5. Ejecutar `git push origin main` — **SIEMPRE pushear al terminar**. El deploy en Vercel es automático.
