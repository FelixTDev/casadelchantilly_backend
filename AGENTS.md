# AGENTS

## Alcance
- Raíz del repo: Spring Boot con seguridad JWT, módulos por dominio y PDF/reportes.

## Reglas de trabajo
- Antes de editar, revisar el flujo completo afectado en backend y el contrato API involucrado.
- Hacer cambios pequeños y compatibles con el estilo actual; evitar refactors amplios sin necesidad.
- Mantener controladores delgados, servicios con reglas de negocio y repositorios solo para acceso a datos.
- Revisar seguridad, DTOs, códigos HTTP y efectos en endpoints admin/cliente.
- No exponer mensajes técnicos al usuario final; responder con códigos y payloads consistentes.
- Si el cambio toca pagos, pedidos o autenticación, validar reglas de negocio, permisos y pruebas de integración.

## Estructura recomendada
- Centralizar configuración técnica en `shared/config`, seguridad en `shared/security` y errores en `shared/exception`.
- Mantener pruebas `*IT` ejecutándose con `verify`, no solo con `test`.

## Comandos base
- Backend unit/integration: `.\mvnw.cmd verify` en la raíz
- Backend local: `.\mvnw.cmd spring-boot:run` en la raíz

## Validación mínima antes de cerrar
- Backend: `.\mvnw.cmd test`
- Si el cambio toca flujos críticos, validar autenticación y al menos un flujo admin/cliente afectado vía pruebas o integración.

## Checklist de cierre
- Confirmar que el perfil `dev` del backend levanta con la base local sin fallos de validación de esquema.
- Confirmar que `*IT` se ejecuta con `verify`, no solo con `test`.
