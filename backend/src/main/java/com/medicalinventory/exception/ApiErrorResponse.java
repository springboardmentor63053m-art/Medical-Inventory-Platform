package com.medicalinventory.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ApiErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    private Map<String, String> validationErrors;

    public ApiErrorResponse() {}

    public ApiErrorResponse(int status, String error, String message, String path, LocalDateTime timestamp, Map<String, String> validationErrors) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = timestamp;
        this.validationErrors = validationErrors;
    }

    public static ApiErrorResponseBuilder builder() { return new ApiErrorResponseBuilder(); }

    public static class ApiErrorResponseBuilder {
        private int status;
        private String error;
        private String message;
        private String path;
        private LocalDateTime timestamp;
        private Map<String, String> validationErrors;

        public ApiErrorResponseBuilder status(int status) { this.status = status; return this; }
        public ApiErrorResponseBuilder error(String error) { this.error = error; return this; }
        public ApiErrorResponseBuilder message(String message) { this.message = message; return this; }
        public ApiErrorResponseBuilder path(String path) { this.path = path; return this; }
        public ApiErrorResponseBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public ApiErrorResponseBuilder validationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; return this; }

        public ApiErrorResponse build() {
            return new ApiErrorResponse(status, error, message, path, timestamp, validationErrors);
        }
    }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public Map<String, String> getValidationErrors() { return validationErrors; }
    public void setValidationErrors(Map<String, String> validationErrors) { this.validationErrors = validationErrors; }
}
