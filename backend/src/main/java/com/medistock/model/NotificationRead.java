package com.medistock.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Records that a specific user has read a specific notification. Read state
 * used to be a single shared boolean on Notification, which meant one
 * user marking a notification read hid it for every other user targeted by
 * it. This join table makes read state per-(notification, user) instead
 * (requirement 17): the presence of a row here means "this user has read
 * this notification"; absence means unread. One row per (notification,
 * user) pair is enforced by the unique constraint below.
 */
@Entity
@Table(name = "notification_reads",
        uniqueConstraints = @UniqueConstraint(columnNames = {"notification_id", "user_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "notification_id")
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime readAt = LocalDateTime.now();
}
