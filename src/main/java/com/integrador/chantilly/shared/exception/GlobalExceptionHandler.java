package com.integrador.chantilly.shared.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException e) {
        String message = "Los datos ingresados no son válidos.";
        FieldError fieldError = e.getBindingResult().getFieldError();
        if (fieldError != null && fieldError.getDefaultMessage() != null) {
            message = fieldError.getDefaultMessage();
        }
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", message);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiErrorResponse> handleRuntimeException(RuntimeException e) {
        RuntimeErrorDescriptor descriptor = classifyRuntimeException(e.getMessage());
        return buildResponse(descriptor.status(), descriptor.code(), descriptor.message());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
        return buildResponse(HttpStatus.FORBIDDEN, "FORBIDDEN", "No tienes permisos para realizar esta acción.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleException(Exception e) {
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "UNEXPECTED_ERROR",
                "Ocurrió un problema inesperado. Intenta nuevamente más tarde."
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(status.value(), code, message));
    }

    private RuntimeErrorDescriptor classifyRuntimeException(String originalMessage) {
        String normalized = originalMessage == null ? "" : originalMessage.toLowerCase();

        if (normalized.contains("no encontrado")) {
            return new RuntimeErrorDescriptor(HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND", "No encontramos la información solicitada.");
        }
        if (normalized.contains("credenciales invalid")) {
            return new RuntimeErrorDescriptor(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos.");
        }
        if (normalized.contains("demasiados intentos")) {
            return new RuntimeErrorDescriptor(HttpStatus.TOO_MANY_REQUESTS, "RATE_LIMITED", "Has realizado demasiados intentos. Espera unos minutos e inténtalo nuevamente.");
        }
        if (normalized.contains("ya esta registrado") || normalized.contains("ya existe") || normalized.contains("conflicto")) {
            return new RuntimeErrorDescriptor(HttpStatus.CONFLICT, "RESOURCE_CONFLICT", "La información ya existe o entra en conflicto con un registro existente.");
        }
        if (normalized.contains("no pertenece") || normalized.contains("no tiene permisos")) {
            return new RuntimeErrorDescriptor(HttpStatus.FORBIDDEN, "FORBIDDEN", "No tienes permisos para realizar esta acción.");
        }
        if (normalized.contains("inval")
                || normalized.contains("obligat")
                || normalized.contains("vacio")
                || normalized.contains("insuficiente")
                || normalized.contains("expir")
                || normalized.contains("vigent")
                || normalized.contains("transicion")
                || normalized.contains("seleccionar")) {
            return new RuntimeErrorDescriptor(HttpStatus.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_ERROR", "Los datos ingresados no son válidos.");
        }

        return new RuntimeErrorDescriptor(HttpStatus.BAD_REQUEST, "REQUEST_ERROR", "No fue posible procesar la solicitud.");
    }

    private record RuntimeErrorDescriptor(HttpStatus status, String code, String message) {
    }
}
