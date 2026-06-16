# AGENTS

## Alcance
- `chantilly-frontend`: React + Vite para experiencia cliente y panel admin.
- `chantilly-backend`: Spring Boot con seguridad JWT, módulos por dominio y PDF/reportes.

## Reglas de trabajo
- Antes de editar, revisar el flujo completo afectado en frontend, backend y consumo API.
- Hacer cambios pequeños y compatibles con el estilo actual; evitar refactors amplios sin necesidad.
- Mantener validaciones compartidas en utilidades y no duplicar reglas de negocio en múltiples pantallas.
- Para cambios de UX en formularios, validar escritura, pegado, blur, estados vacíos y mensajes de error.
- Para cambios backend, revisar seguridad, DTOs, códigos HTTP y efectos en endpoints admin/cliente.
- No exponer mensajes técnicos al usuario final. En frontend, usar mensajes amigables centralizados; en backend, responder con códigos y payloads consistentes.
- Si el cambio toca checkout, pagos, pedidos o autenticación, validar tanto el flujo cliente como el panel admin relacionado.

## Estructura recomendada
- Frontend: priorizar separación por dominio en `src/app/features`, `src/app/pages`, `src/services` y `src/app/lib`.
- Backend: mantener controladores delgados, servicios con reglas de negocio y repositorios solo para acceso a datos.
- Pruebas E2E: mantener helpers reutilizables en `chantilly-frontend/tests/e2e/helpers` y evitar ids o textos ambiguos en selectores.

## Comandos base
- Frontend lint: `npm run lint` en `chantilly-frontend`
- Frontend unit tests: `npm test` en `chantilly-frontend`
- Frontend build: `npm run build` en `chantilly-frontend`
- Frontend E2E: `npm run test:e2e` en `chantilly-frontend`
- Backend unit/integration: `.\mvnw.cmd verify` en `chantilly-backend`
- Backend local: `.\mvnw.cmd spring-boot:run` en `chantilly-backend`

## Validación mínima antes de cerrar
- Frontend: `npm run build`
- Backend: `.\mvnw.cmd test`
- Si el cambio toca flujos críticos, validar login, checkout y al menos un flujo admin de punta a punta.

## Checklist de cierre
- Confirmar que el frontend no rompe `localhost` ni `127.0.0.1` al resolver la API.
- Confirmar que el perfil `dev` del backend levanta con la base local sin fallos de validación de esquema.
- Confirmar que `*IT` se ejecuta con `verify`, no solo con `test`.
