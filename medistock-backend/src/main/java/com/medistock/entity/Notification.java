package com.medistock.entity;

import com.medistock.enums.NotificationSeverity;
import com.medistock.enums.NotificationType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false, length = 30)
    private NotificationType notificationType;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NotificationSeverity severity;

    @Column(name = "related_medicine_id")
    private Long relatedMedicineId;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public Notification() {}

    public Notification(Long id, String title, String message, NotificationType notificationType, NotificationSeverity severity, Long relatedMedicineId, String status, LocalDateTime createdAt, LocalDateTime readAt) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.severity = severity != null ? severity : NotificationSeverity.INFO;
        this.relatedMedicineId = relatedMedicineId;
        this.status = status;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) this.status = "UNREAD";
        if (this.severity == null) this.severity = NotificationSeverity.INFO;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationType getNotificationType() { return notificationType; }
    public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }

    public NotificationSeverity getSeverity() { return severity; }
    public void setSeverity(NotificationSeverity severity) { this.severity = severity; }

    public Long getRelatedMedicineId() { return relatedMedicineId; }
    public void setRelatedMedicineId(Long relatedMedicineId) { this.relatedMedicineId = relatedMedicineId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReadAt() { return readAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }

    public static NotificationBuilder builder() { return new NotificationBuilder(); }

    public static class NotificationBuilder {
        private Long id;
        private String title;
        private String message;
        private NotificationType notificationType;
        private NotificationSeverity severity;
        private Long relatedMedicineId;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime readAt;

        public NotificationBuilder id(Long id) { this.id = id; return this; }
        public NotificationBuilder title(String title) { this.title = title; return this; }
        public NotificationBuilder message(String message) { this.message = message; return this; }
        public NotificationBuilder notificationType(NotificationType notificationType) { this.notificationType = notificationType; return this; }
        public NotificationBuilder severity(NotificationSeverity severity) { this.severity = severity; return this; }
        public NotificationBuilder relatedMedicineId(Long relatedMedicineId) { this.relatedMedicineId = relatedMedicineId; return this; }
        public NotificationBuilder status(String status) { this.status = status; return this; }
        public NotificationBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public NotificationBuilder readAt(LocalDateTime readAt) { this.readAt = readAt; return this; }

        public Notification build() {
            return new Notification(id, title, message, notificationType, severity, relatedMedicineId, status, createdAt, readAt);
        }
    }
}

