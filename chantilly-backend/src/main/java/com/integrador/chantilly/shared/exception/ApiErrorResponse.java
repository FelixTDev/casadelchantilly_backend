package com.integrador.chantilly.shared.exception;

import java.time.OffsetDateTime;

public class ApiErrorResponse {

    private final OffsetDateTime timestamp = OffsetDateTime.now();
    private final int status;
    private final String code;
    private final String message;

    public ApiErrorResponse(int status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public int getStatus() {
        return status;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}
