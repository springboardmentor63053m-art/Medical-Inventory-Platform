package com.medistock.dto;

import com.medistock.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String severity;
    private String title;
    private String message;
    private Long relatedMedicineId;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType().name())
                .severity(n.getSeverity().name())
                .title(n.getTitle())
                .message(n.getMessage())
                .relatedMedicineId(n.getRelatedMedicineId())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
