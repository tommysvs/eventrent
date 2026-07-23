# EventRent Web App

Plataforma web para gestión de eventos y alquiler de inventario. La aplicación combina un frontend comercial, un demo operativo y un panel de auditoría para administrar cotizaciones, reservas, entregas y logs de seguridad.

## Qué hace la aplicación

- Permite crear y administrar cotizaciones para eventos.
- Convierte cotizaciones en reservas y reserva inventario de forma transaccional.
- Registra movimientos de inventario para entradas, salidas, ajustes y liberaciones.
- Gestiona entregas asociadas a una reserva existente.
- Expone un panel de logs para usuarios administradores.
- Incluye un flujo demo respaldado por Postgres para explorar el producto sin depender de datos mock en memoria.

## Reglas del negocio

### Cotizaciones

- El total de una cotización se calcula a partir de sus ítems: cantidad × días × precio.
- Las cotizaciones pueden estar en estado de borrador, enviada, aceptada o cancelada.
- No se permiten fechas pasadas en cotizaciones nuevas o editadas.

### Reservas

- Una reserva puede nacer desde una cotización o desde ítems cargados manualmente.
- Al crear una reserva, el inventario se reserva y se descuenta disponibilidad.
- Si una reserva se cancela, el inventario reservado se libera.
- El valor total de la reserva se calcula desde los ítems reservados.

### Inventario

- El inventario mantiene unidades totales, disponibles, reservadas y en mantenimiento.
- Cada cambio relevante genera un movimiento de inventario.
- Las actualizaciones de stock no son invisibles: quedan reflejadas como ajustes en el historial.

### Entregas

- Una entrega solo puede crearse si existe una reserva previa.
- La información logística se conserva junto con la reserva para mantener trazabilidad.

### Demo y API

- El backend demo expone solo recursos permitidos: inventario, reservas, cotizaciones, entregas y movimientos.
- Los movimientos de inventario son de solo lectura por API.
- Las operaciones de edición y borrado requieren un `id` válido.

## Tecnologías usadas

- [Next.js 16](https://nextjs.org) con App Router.
- [React 19](https://react.dev).
- TypeScript.
- [PostgreSQL](https://www.postgresql.org) como base de datos.
- [pg](https://www.npmjs.com/package/pg) para acceso directo a Postgres.
- [bcryptjs](https://www.npmjs.com/package/bcryptjs) para hashing de contraseñas.
- [Tailwind CSS 4](https://tailwindcss.com) para estilos.
- Componentes UI construidos con primitives de [shadcn](https://ui.shadcn.com) y [@base-ui/react](https://base-ui.com).
- [lucide-react](https://lucide.dev) para iconografía.

## Seguridad

La aplicación incluye varias medidas de seguridad concretas:

- Sesiones firmadas con HMAC en `lib/auth.ts`, con expiración de 7 días.
- La secret de autenticación (`AUTH_SECRET`) es obligatoria en producción.
- Passwords almacenadas con hashing mediante bcrypt.
- Registro centralizado de eventos de seguridad en `lib/security-log.ts`.
- Auditoría de login, logout, registro, denegaciones y errores del sistema.
- Hash del token de sesión en los logs para evitar guardar el token en claro.
- Captura de IP, user-agent, endpoint y método HTTP para trazabilidad.
- Bloqueo previo de patrones sospechosos en el login con `lib/sql-injection-guard.ts`.
- Consultas SQL parametrizadas para reducir riesgo de inyección.
- Acceso al panel `/admin/logs` protegido por sesión válida y rol administrador.
- Filtros de logs validados contra listas permitidas y límite de consulta acotado.

## Variables de entorno

- `DATABASE_URL`: conexión principal a Postgres en local.
- `DATABASE_POSTGRES_URL`: alternativa aceptada en despliegues con Supabase/Vercel.
- `DATABASE_POSTGRES_URL_NON_POOLING`: alternativa aceptada en despliegues con Supabase/Vercel.
- `AUTH_SECRET`: clave para firmar y verificar la sesión.

## Más información

- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de Next.js](https://nextjs.org/learn)
