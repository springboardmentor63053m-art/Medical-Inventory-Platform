package com.medistock.medistock_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ErrorResponse {
    private boolean success;
    private String message;
    private List<String> errors;
    private int status;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
