# Informe de auditoría técnica y funcional — Entrega final Best Cars

---

## A. Resumen ejecutivo

**Estado general:** El proyecto está **entregable con cambios mínimos**. El backend, la web y el panel están alineados en contratos (payloads, rutas, errores). Los fallos detectados son acotados: prioridad de vehículos no persistida, formulario de vista previa sin envío real, respuesta de cambio de contraseña inconsistente, y test-drive en modo mock sin almacén en memoria. No hay código muerto relevante ni TODOs; los `console.log`/`console.error` están en arranque, errores y desarrollo.

**Riesgos principales:**
1. **Orden de vehículos:** El panel envía `priority` al reordenar pero el backend no lo persiste (no existe en Prisma). Tras recargar, el orden se pierde.
2. **Cambio de contraseña en producción:** El backend puede escribir en `.admin-password` en el filesystem; en entornos efímeros (Railway, contenedores) el archivo no persiste entre despliegues y se vuelve a usar `ADMIN_PASSWORD` de env.
3. **Vista previa del panel:** El formulario de contacto en el modal de vista previa no llama a la API; solo hace `preventDefault`. Es solo UI, no envía leads.

**Veredicto:** **Entregable con cambios mínimos** — aplicar los parches de prioridad (o documentar limitación), unificar formato de error de cambio de contraseña y, si se desea, conectar el formulario de vista previa a la API o dejarlo documentado como “solo visual”.

---

## B. Hallazgos críticos

### B1. Orden de vehículos no persistido (priority)
- **Severidad:** Alta (impacto funcional en panel).
- **Área:** Backend / integración.
- **Problema:** El panel llama a `updateVehicle(id, { priority: i + 1 })` al reordenar ([BestCars_Panel/src/hooks/usePanelData.ts](BestCars_Panel/src/hooks/usePanelData.ts) líneas 103–104). El backend en [Bestcars_Back_DEF/src/controllers/vehicleController.ts](Bestcars_Back_DEF/src/controllers/vehicleController.ts) no lee `body.priority` y el modelo Prisma `Vehicle` no tiene campo `priority` ([Bestcars_Back_DEF/prisma/schema.prisma](Bestcars_Back_DEF/prisma/schema.prisma)). El orden solo existe en memoria hasta recargar.
- **Por qué importa:** El cliente espera que el orden del catálogo se mantenga tras recargar.
- **Archivos afectados:** `Bestcars_Back_DEF/prisma/schema.prisma`, `Bestcars_Back_DEF/src/controllers/vehicleController.ts` (getAllVehicles, updateVehicle).
- **Cambio mínimo recomendado:** Añadir campo opcional `priority Int @default(0)` al modelo `Vehicle`, migración o `db push`, y en `updateVehicle` incluir `priority` en el payload a Prisma; en `getAllVehicles` ordenar por `priority` asc.

### B2. Formulario de contacto en vista previa del panel no envía a la API
- **Severidad:** Media-alta (expectativa de producto).
- **Área:** Panel.
- **Problema:** En [BestCars_Panel/src/app/components/web-preview-modal.tsx](BestCars_Panel/src/app/components/web-preview-modal.tsx) línea 622 el formulario hace `onSubmit={(e) => e.preventDefault()}` y no hay llamada a `submitContact` ni a la API.
- **Por qué importa:** En la vista previa, “Enviar Consulta” no genera lead; puede confundir en demos.
- **Archivos afectados:** `BestCars_Panel/src/app/components/web-preview-modal.tsx`.
- **Cambio mínimo recomendado:** Opción A: Conectar el formulario a la API (importar cliente API, enviar a POST /api/contact con vehicleId/vehicleTitle del vehículo en preview, mostrar éxito/error). Opción B: Dejar como está y documentar en README que la vista previa es solo visual.

### B3. Cambio de contraseña: formato de error inconsistente
- **Severidad:** Media.
- **Área:** Backend.
- **Problema:** En [Bestcars_Back_DEF/src/controllers/authController.ts](Bestcars_Back_DEF/src/controllers/authController.ts) `changePassword` devuelve `res.status(400).json({ error: 'string' })` (líneas 74, 79, 80, 86) y `res.status(500).json({ error: '...' })` (93). El resto de la API usa `{ error: { message, code } }`. El panel ya maneja ambos ([BestCars_Panel/src/services/api.ts](BestCars_Panel/src/services/api.ts) 84–91), pero la API queda inconsistente.
- **Por qué importa:** Consistencia y posible parsing en otros clientes.
- **Archivos afectados:** `Bestcars_Back_DEF/src/controllers/authController.ts`.
- **Cambio mínimo recomendado:** Devolver siempre `{ error: { message: string, code?: string } }` en los 400/500 de changePassword.

### B4. Test-drive en modo mock sin persistencia en memoria
- **Severidad:** Media.
- **Área:** Backend.
- **Problema:** Sin `DATABASE_URL`, `submitTestDrive` no guarda en ningún array ([Bestcars_Back_DEF/src/controllers/testDriveController.ts](Bestcars_Back_DEF/src/controllers/testDriveController.ts)); solo genera un id y envía email si hay SendGrid. GET /api/test-drive devuelve `[]`. En cambio, contact sí tiene `inMemoryContacts` y GET /api/contact devuelve los enviados.
- **Por qué importa:** En demo sin DB, los leads de prueba de manejo no aparecen en el panel.
- **Archivos afectados:** `Bestcars_Back_DEF/src/controllers/testDriveController.ts`.
- **Cambio mínimo recomendado:** Añadir almacén en memoria análogo a `inMemoryContacts` para test-drive y rellenar GET/PATCH/DELETE cuando `!useDatabase`.

---

## C. Hallazgos medios

### C1. Contraseña persistida en archivo en producción
- **Severidad:** Media.
- **Área:** Backend / despliegue.
- **Problema:** `changePassword` escribe en `.admin-password` ([Bestcars_Back_DEF/src/controllers/authController.ts](Bestcars_Back_DEF/src/controllers/authController.ts) 90). En Railway/containers el filesystem suele ser efímero; tras redeploy se pierde y se usa de nuevo `ADMIN_PASSWORD` de env.
- **Por qué importa:** El cliente puede creer que la contraseña cambió de forma permanente.
- **Archivos afectados:** `Bestcars_Back_DEF/src/controllers/authController.ts`, documentación de despliegue.
- **Cambio mínimo recomendado:** Documentar que en entornos efímeros el cambio de contraseña no persiste y que la fuente de verdad es `ADMIN_PASSWORD` (y opcionalmente `.admin-password` si existe). Opcional: en producción no escribir archivo y devolver 501 con mensaje claro.

### C2. Respuestas 404 de vehículos con error en formato string
- **Severidad:** Baja (no bloqueante).
- **Área:** Backend.
- **Problema:** `getVehicleById` y `trackVehicle` devuelven `res.status(404).json({ error: 'Vehicle not found' })` o similar ([Bestcars_Back_DEF/src/controllers/vehicleController.ts](Bestcars_Back_DEF/src/controllers/vehicleController.ts) 228, 252, 189). El estándar del resto es `{ error: { message, code } }`. La web y el panel ya tratan `error` como string en el parser de errores.
- **Archivos afectados:** `Bestcars_Back_DEF/src/controllers/vehicleController.ts`.
- **Cambio mínimo recomendado:** Unificar a `res.status(404).json({ error: { message: 'Vehicle not found', code: 'NOT_FOUND' } })` para coherencia.

### C3. Logs de éxito con datos sensibles
- **Severidad:** Baja.
- **Área:** Backend.
- **Problema:** `console.log('📧 Contact submission sent:', { vehicleId, vehicleTitle, name, email });` y análogo en test-drive ([Bestcars_Back_DEF/src/controllers/contactController.ts](Bestcars_Back_DEF/src/controllers/contactController.ts) 130, testDriveController 90). En producción pueden acabar en logs externos.
- **Archivos afectados:** `Bestcars_Back_DEF/src/controllers/contactController.ts`, `Bestcars_Back_DEF/src/controllers/testDriveController.ts`.
- **Cambio mínimo recomendado:** En producción no loguear PII o loguear solo `{ vehicleId, vehicleTitle }` (sin name/email).

### C4. priceUtils.ts con console.log de tests
- **Severidad:** Muy baja.
- **Área:** Backend.
- **Problema:** [Bestcars_Back_DEF/src/utils/priceUtils.ts](Bestcars_Back_DEF/src/utils/priceUtils.ts) contiene un bloque que ejecuta tests y hace `console.log` (líneas 30–40). Si ese archivo se importa en el arranque, podría verse en logs.
- **Archivos afectados:** `Bestcars_Back_DEF/src/utils/priceUtils.ts`.
- **Cambio mínimo recomendado:** Mover los tests a un script o test runner, o envolver en `if (process.env.NODE_ENV === 'development' && process.env.RUN_PRICE_TESTS)`.

---

## D. Incompatibilidades entre backend, web y panel

| Origen | Esperado / uso | Real | Impacto | Solución mínima |
|--------|-----------------|------|---------|------------------|
| Panel | Envía `priority` en PATCH /api/vehicles/:id al reordenar | Backend no lee `priority`; modelo Vehicle sin campo | Orden no persiste tras recarga | Añadir `priority` al schema y al update (ver B1). |
| Backend | changePassword 400/500 | `{ error: 'string' }` | Inconsistencia con resto API | Devolver `{ error: { message, code } }` (ver B3). |
| Backend | getVehicleById 404 | `{ error: 'Vehicle not found' }` | Mismo parsing en clientes; solo estilo | Opcional: unificar a objeto (ver C2). |
| Backend | POST /api/test-drive sin DB | Panel espera GET con datos | GET devuelve [] en mock | Añadir almacén en memoria (ver B4). |
| Panel | Vista previa “Enviar Consulta” | Formulario no envía a API | No se crean leads desde preview | Conectar a API o documentar (ver B2). |
| API | Escenas: positions vs hotspots | Backend normaliza a hotspots[]; front usa sceneHotspots() | Compatible: front acepta ambos | Ninguno. |
| API | Imágenes vehículos | Backend sirve /api/vehicles/images/:filename desde public/vehicle-images | Web y panel usan getVehicleImageUrl(API + path) | Correcto. |

No hay incompatibilidad en nombres de campos de vehículos, contactos, test-drive o escenas entre lo que devuelve el backend y lo que consumen web y panel (adapters y api.ts alineados).

---

## E. Checklist de entrega final

**Backend**
- [ ] Con DATABASE_URL: `npm run db:push` o migraciones aplicadas.
- [ ] GET /api/health y GET /api/health/ready responden 200 (o 503 ready si DB caída).
- [ ] POST /api/auth/login con ADMIN_USERNAME/ADMIN_PASSWORD devuelve `{ token, role }`.
- [ ] PATCH /api/auth/password con Bearer devuelve 200 o 400/500 con mensaje claro.
- [ ] GET /api/vehicles devuelve array; GET /api/vehicles/:id devuelve uno o 404.
- [ ] POST /api/contact y POST /api/test-drive con body válido devuelven 201; sin SENDGRID_API_KEY el lead se guarda y puede devolver 201 con warning.
- [ ] GET /api/contact y GET /api/test-drive con Bearer devuelven arrays.
- [ ] GET /api/scenes y GET /api/scenes/active devuelven datos; PATCH /api/scenes/:id/activate con auth.
- [ ] GET /sitemap.xml devuelve XML con URLs estáticas y vehículos.
- [ ] CORS_ORIGINS incluye las URLs de la web y del panel en producción.

**Web pública**
- [ ] Home carga y muestra hotspots de la primera escena (no garaje) si hay escenas.
- [ ] /garage carga; /vehicle/:id muestra ficha, galería, formulario de contacto y modal de prueba de manejo.
- [ ] Enviar contacto y prueba de manejo muestran mensaje de éxito o error legible (no [object Object]).
- [ ] /experiencia?index=0,1,... muestra escenas con fondo y hotspots; navegación anterior/siguiente e inicio.
- [ ] Tracking: al abrir ficha y al clic en CTA no debe romper; puede fallar en silencio si no hay DB.
- [ ] Rutas /terminos y /privacidad cargan; 404 lleva a NotFoundPage.

**Panel**
- [ ] Sin VITE_API_URL: login no exigido; datos desde localStorage (demo).
- [ ] Con VITE_API_URL: login obligatorio; tras login se cargan vehículos, contactos y test-drives.
- [ ] CRUD vehículos: crear, editar, eliminar; imágenes vía API.
- [ ] Reordenar vehículos: actualiza UI; verificar si el orden persiste tras recarga (depende de B1).
- [ ] Leads: listado, filtros, actualizar estado/notas, eliminar.
- [ ] Escenas: listado, crear, editar, hotspots, activar una escena, duplicar.
- [ ] Cambio de contraseña desde configuración con Bearer.
- [ ] Vista previa web: iframe/enlace carga; formulario de contacto (actualmente no envía a API, ver B2).

**End-to-end**
- [ ] En producción: web y panel con VITE_API_URL apuntando al mismo backend; CORS con sus orígenes.
- [ ] Envío de contacto desde la web → lead visible en panel y email a RECIPIENT_EMAIL si SendGrid configurado.
- [ ] Envío de prueba de manejo desde la web → lead visible en panel y email.
- [ ] Escena activa en panel → home de la web muestra hotspots de esa escena (si la lógica de “primera escena” incluye la activa); escenas en /experiencia excluyen nombre “garaje”/“garage”.

---

## F. Variables de entorno reales

**Backend (Bestcars_Back_DEF)**  
- `PORT`: opcional; por defecto 3001.  
- `NODE_ENV`: opcional; recomendado `production` en producción.  
- `DATABASE_URL`: **obligatoria** para persistencia real; si falta, modo mock (vehículos/escenas en memoria; contactos en memoria; test-drive no persistido en memoria).  
- `CORS_ORIGINS`: **obligatoria** en producción; lista de orígenes separados por coma (sin espacios raros); ej. `https://web.dominio.com,https://panel.dominio.com`.  
- `JWT_SECRET`: **obligatoria**; usada en auth; debe ser fuerte y único.  
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`: **obligatorias** para login del panel; valores por defecto `admin`/`admin` (inseguros en producción).  
- `SENDGRID_API_KEY`: opcional; si falta, contacto y test-drive siguen guardando lead pero no envían email.  
- `FROM_EMAIL`, `RECIPIENT_EMAIL`: opcionales; por defecto dev@theaibusiness.com; deben ser válidos/verificados en SendGrid.  

**Riesgo si faltan:** Sin DATABASE_URL no hay persistencia. Sin CORS_ORIGINS en producción el navegador puede bloquear peticiones. Sin JWT_SECRET el servidor lanza al arrancar. Sin ADMIN_* el panel usa admin/admin.

**Web (Bestcars_front_DEF)**  
- `VITE_API_URL`: **obligatoria** en producción; URL base del backend sin barra final; ej. `https://api.dominio.com`.  

**Riesgo si falta:** Las peticiones van a localhost:3001 y fallan en producción.

**Panel (BestCars_Panel)**  
- `VITE_API_URL`: opcional; si falta, modo demo con localStorage.  
- `VITE_WEB_PREVIEW_URL`: opcional; URL de la web para el iframe/enlace de vista previa; debe ser URL completa con `https://`.  

**Riesgo si falta VITE_API_URL:** Panel solo funciona en modo demo (datos locales).

---

## G. Cambios mínimos que harías ya (priorizados)

1. **Backend: persistir orden de vehículos** — Añadir `priority` a Prisma y a updateVehicle; ordenar getAllVehicles por priority (archivos: schema.prisma, vehicleController.ts).  
2. **Backend: formato error changePassword** — Unificar respuestas 400/500 a `{ error: { message, code? } }` (authController.ts).  
3. **Backend: test-drive en memoria** — Almacén en memoria para test-drive cuando !useDatabase y exponerlo en GET/PATCH/DELETE (testDriveController.ts).  
4. **Panel: formulario vista previa** — Conectar formulario de contacto del web-preview-modal a POST /api/contact o documentar que es solo visual (web-preview-modal.tsx).  
5. **Backend: 404 vehículo** — Cambiar a `{ error: { message: 'Vehicle not found', code: 'NOT_FOUND' } }` (vehicleController.ts).  
6. **Backend: logs PII** — Reducir o condicionar logs de contact/testDrive a producción (contactController.ts, testDriveController.ts).  
7. **Documentación** — README o DEPLOY.md: cambio de contraseña en entornos efímeros; variables obligatorias por app; que la vista previa del panel no envía el formulario si no se implementa B2.

El resto (priceUtils tests, CORS, rate limit, health, auth JWT, escenas, sitemap, manejo de errores global) está correcto para entrega.

---

## H. Parches propuestos

### H1. Backend: añadir priority a Vehicle y persistirlo

**prisma/schema.prisma** — En el modelo Vehicle añadir:
```prisma
  priority      Int      @default(0)
```
Luego ejecutar `npx prisma db push` o crear migración.

**vehicleController.ts** — En `getAllVehicles` con useDatabase, ordenar:
```ts
orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }],
```
En `updateVehicle`, en el objeto `data` y en `updatePayload` añadir:
```ts
if (body.priority !== undefined) data.priority = Math.max(0, Number(body.priority) || 0);
// y en updatePayload:
...(data.priority !== undefined && { priority: data.priority }),
```
(Asumiendo que Prisma.VehicleUpdateInput acepta priority tras el cambio de schema.)

### H2. Backend: errores de changePassword unificados

**authController.ts** — Sustituir todos los `res.status(400).json({ error: '...' })` por:
```ts
res.status(400).json({ error: { message: 'Contraseña actual incorrecta', code: 'VALIDATION_ERROR' } });
// y análogo para "currentPassword and newPassword...", "La nueva contraseña...", y el 500:
res.status(500).json({ error: { message: 'No se pudo guardar la contraseña', code: 'INTERNAL_ERROR' } });
```

### H3. Backend: 404 vehículo con objeto

**vehicleController.ts** — Donde haya:
```ts
res.status(404).json({ error: 'Vehicle not found' });
```
sustituir por:
```ts
res.status(404).json({ error: { message: 'Vehicle not found', code: 'NOT_FOUND' } });
```
(trackVehicle línea 189 y getVehicleById 228 y 252.)

### H4. Test-drive en memoria (resumen)

En testDriveController.ts: declarar `inMemoryTestDrives` y `inMemoryTestDriveNextId`; en submitTestDrive cuando !useDatabase push al array; en getAllTestDrives cuando !useDatabase devolver copia del array; en updateTestDrive y deleteTestDrive cuando !useDatabase actuar sobre el array (igual que en contactController para contact).

---

## I. Documentación pendiente

- **README raíz o DEPLOY.md:** Indicar que en Railway/containers el cambio de contraseña vía archivo no persiste; listar variables por app (obligatorias/opcionales) y formato; mencionar que la vista previa del panel puede tener el formulario de contacto solo visual.
- **Bestcars_Back_DEF/README.md:** Ya describe rutas y env; añadir que sin DATABASE_URL los test-drive no se listan en GET (hasta aplicar B4).
- **BestCars_Panel/README.md:** Añadir que VITE_WEB_PREVIEW_URL debe ser URL completa con https y que el formulario de la vista previa no envía a la API salvo que se implemente la conexión.

---

*Fin del informe. Auditoría basada únicamente en el código del repositorio.*
