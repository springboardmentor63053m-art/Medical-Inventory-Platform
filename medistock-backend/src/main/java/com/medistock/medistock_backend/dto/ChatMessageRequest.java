package com.medistock.medistock_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatMessageRequest {
    @NotBlank(message = "Receiver ID is required")
    private String receiverId;

    @NotBlank(message = "Message text is required")
    private String text;
}
