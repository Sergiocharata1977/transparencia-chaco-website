# Web Site transparencia

Sitio publico institucional de "Transparencia Chaco" construido con Next.js.

## Stack

- Node.js 20 LTS
- pnpm
- Next.js 16
- React 19
- Tailwind CSS 4

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm type-check
```

## Estado actual

- La web funciona como sitio publico.
- El contenido de municipios, publicaciones y denuncias sigue mayormente hardcodeado.
- Firestore todavia no esta conectado a la UI.

## Deploy

Se recomienda deploy en Vercel conectado al repositorio Git.

## Firebase

Se dejo scaffolding basico para Firestore y Storage:

- `firebase.json`
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `.firebaserc.example`
- `.env.example`

Antes de usar Firebase en produccion, crear el proyecto real en Firebase Console y completar variables de entorno.
