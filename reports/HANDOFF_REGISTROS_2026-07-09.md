# Handoff - Modelo de Registros y Jerarquia Territorial

Fecha: 2026-07-09
Proyecto: transparencia-chaco-website
Rama: main
Modo de trabajo local: sin instalar dependencias en `D:\Proyectos\transparencia-chaco-website`

## Objetivo

Unificar la organizacion de registros del observatorio para evitar duplicar conceptos entre denuncias, reportes, reclamos, pedidos de informacion y notas al municipio.

La decision funcional es que **Ciudad / Municipio** sea el ABM madre y que todos los registros publicos o administrativos cuelguen de esa ciudad. Ademas, cada ciudad debe incluir **Departamento**.

Ejemplo:

```text
Provincia: Chaco
Departamento: Chacabuco
Ciudad: Charata
Slug: charata
```

## Jerarquia canonica

```text
Provincia
  Departamento
    Ciudad / Municipio
      Noticias
      Obras Publicas
      Notas enviadas al municipio
      Reclamos por ente
```

## Modulos canonicos

### 1. Ciudades

ABM madre del sistema.

Coleccion actual esperada: `ciudades`

Campos minimos recomendados:

```text
nombre
slug
provincia
departamento
activa
region
orden
createdAt
updatedAt
```

Notas:
- `departamento` es obligatorio para ordenar territorialmente.
- Charata debe quedar como `departamento: Chacabuco`.
- Todos los registros hijos deben guardar al menos `ciudadSlug`.
- Para busquedas y reportes conviene persistir tambien `ciudadNombre`, `departamento` y `provincia`.

### 2. Noticias

Contenido editorial del observatorio.

Coleccion actual: `publicaciones`

Uso:
- Noticias publicas.
- Comunicados.
- Articulos del observatorio.

Campos clave:

```text
ciudadSlug
ciudadNombre
departamento
provincia
titulo
categoria
contenido
estado: borrador | publicado | archivado
fechaPublicacion
```

Admin:
- `/admin/publicaciones`

Frontend:
- `/publicaciones`
- `/publicaciones/[id]`

### 3. Obras Publicas

Registro de obras por ciudad.

Coleccion actual: `obras_publicas`

Campos clave:

```text
ciudadSlug
ciudadNombre
departamento
provincia
titulo
descripcion
estadoObra
avance
presupuesto
ubicacion
enteEjecutor
estado: borrador | publicado | archivado
```

Admin:
- `/admin/obras`

Frontend:
- `/obras-publicas`
- `/obras-publicas/[id]`
- Puede alimentar `/mapa-ciudadano`.

### 4. Notas Enviadas al Municipio

Modulo formal/documental. Debe agrupar lo que hoy puede aparecer como pedidos de informacion u otras notas enviadas a la municipalidad.

Coleccion recomendada: `notas_municipio`

Relacion con coleccion actual:
- `pedidos_informacion` debe migrar o mapearse como `notas_municipio` con `tipo: pedido_informacion`.

Tipos recomendados:

```text
pedido_informacion
nota_administrativa
solicitud_vecinal
reclamo_formal
```

Campos clave:

```text
ciudadSlug
ciudadNombre
departamento
provincia
tipo
titulo
descripcion
destinatario
fechaEnvio
estado: borrador | enviada | respondida | vencida | archivada
respuesta
archivoUrl
publico
```

Admin:
- Crear `/admin/notas-municipio` o evolucionar `/admin/pedidos`.

Frontend:
- Pagina publica de notas/pedidos cuando `publico: true`.
- La vista actual `/pedidos-informacion` puede quedar como filtro de este modulo.

### 5. Reclamos por Ente

Modulo ciudadano/operativo. Debe unificar denuncias, reportes y reclamos.

Coleccion recomendada: `reclamos`

Relacion con coleccion actual:
- `reportes` debe migrar o mapearse como `reclamos`.
- La ruta publica `/denuncias` no deberia implicar una coleccion separada; deberia filtrar reclamos de tipo denuncia o reclamo ciudadano.

Entes responsables recomendados:

```text
municipio
hospital
seguridad
escuela
servicios_publicos
concejo
otro
```

Tipos recomendados:

```text
denuncia
reclamo
sugerencia
alerta
```

Campos clave:

```text
ciudadSlug
ciudadNombre
departamento
provincia
enteResponsable
tipo
titulo
descripcion
estado: pendiente | en_revision | publicado | derivado | respondido | rechazado
prioridad: baja | media | alta | urgente
publico
respuestaOficial
createdAt
updatedAt
```

Admin:
- Crear `/admin/reclamos` o evolucionar `/admin/reportes`.

Frontend:
- `/denuncias`
- `/cargar-reporte`
- Puede alimentar `/mapa-ciudadano`.

## Que queda en frontend

Frontend debe mostrar solo informacion publica:

- Ciudades activas.
- Noticias publicadas.
- Obras publicadas.
- Notas al municipio marcadas como publicas.
- Reclamos aprobados/publicados.
- Formularios ciudadanos para crear reclamos o enviar notas.
- Filtros por provincia, departamento, ciudad, tipo, ente y estado publico.

No debe mostrar:

- Borradores.
- Reclamos rechazados.
- Datos personales sensibles.
- Estados internos no destinados al ciudadano.
- Usuarios admin.

## Que queda en admin

Admin debe concentrar toda la gestion:

- ABM de ciudades.
- ABM de noticias.
- ABM de obras publicas.
- ABM de notas enviadas al municipio.
- ABM/moderacion de reclamos por ente.
- Usuarios.
- Estados, respuestas oficiales, adjuntos y trazabilidad.

## Mapeo desde estado actual

```text
ciudades -> ciudades
publicaciones -> publicaciones
obras_publicas -> obras_publicas
pedidos_informacion -> notas_municipio con tipo pedido_informacion
reportes -> reclamos
```

Colecciones que pueden seguir activas por compatibilidad mientras se migra:

```text
pedidos_informacion
reportes
```

Pero el modelo nuevo deberia tratarlas como legacy o vistas especializadas, no como conceptos separados.

## Plan por olas

### Ola 1 - Auditoria de registros

- Revisar colecciones usadas en codigo, reglas e indices.
- Confirmar campos actuales de `ciudades`, `reportes`, `pedidos_informacion`, `publicaciones` y `obras_publicas`.
- Documentar faltantes en `reports/ARQUITECTURA_DATOS.md`.

### Ola 2 - Ciudad como ABM madre

- Agregar `departamento` al modelo de ciudad.
- Ajustar formularios de `/admin/ciudades`.
- Asegurar fallback con departamento para las ciudades existentes.
- Ejemplo inicial: Charata -> Chacabuco.

### Ola 3 - Notas al municipio

- Definir si se crea coleccion nueva `notas_municipio` o si se evoluciona `pedidos_informacion`.
- Recomendacion: crear `notas_municipio` y dejar `pedidos_informacion` como vista/filtro temporal.
- Crear o adaptar admin.
- Adaptar frontend de pedidos de informacion como filtro.

### Ola 4 - Reclamos por ente

- Definir si se crea coleccion nueva `reclamos` o si se evoluciona `reportes`.
- Recomendacion: crear `reclamos` y migrar `reportes` progresivamente.
- Agregar clasificacion por `enteResponsable`.
- Mantener `/denuncias` como pagina publica, pero alimentada desde reclamos publicados.

### Ola 5 - Frontend y navegacion

- Revisar menu publico para que refleje el modelo:
  - Municipios
  - Noticias
  - Obras Publicas
  - Notas al Municipio
  - Reclamos
  - Observatorio
- Cada pagina debe filtrar por ciudad y permitir navegar desde el observatorio municipal.

### Ola 6 - Migracion y carga inicial

- Poblar ciudades con provincia y departamento.
- Migrar datos actuales si existen.
- Cargar contenido minimo por ciudad para evitar pantallas vacias.
- Validar que no aparezcan datos privados en frontend.

## Riesgos

- Cambiar nombres de colecciones puede romper pantallas actuales si se hace sin compatibilidad.
- `pedidos_informacion` y `reportes` ya existen; no borrarlos sin migracion.
- Las pantallas publicas pueden seguir vacias si no hay documentos publicados/aprobados en Firestore.
- No se puede confirmar desde este entorno si hay documentos reales cargados en Firestore sin usar credenciales/API.
- Este repo en `D:` se trabaja sin instalar dependencias; validacion pesada queda para Vercel/CI.

## Criterios de cierre

- `ciudades` tiene campo `departamento`.
- Charata queda cargada o preparada como departamento Chacabuco.
- Hay decision documentada sobre `notas_municipio` vs `pedidos_informacion`.
- Hay decision documentada sobre `reclamos` vs `reportes`.
- Admin permite gestionar los registros canonicos.
- Frontend solo muestra registros publicos.
- Las rutas existentes siguen funcionando durante la transicion.

