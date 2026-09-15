package com.medistock.service;

import com.medistock.dto.NotificationResponse;
import com.medistock.model.Notification;
import com.medistock.model.NotificationRead;
import com.medistock.model.NotificationType;
import com.medistock.model.Role;
import com.medistock.model.Severity;
import com.medistock.model.User;
import com.medistock.repository.NotificationReadRepository;
import com.medistock.repository.NotificationRepository;
import com.medistock.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * The whole point of this pass's notification rewrite (requirement 17) is
 * that read state is per (notification, user), not a single shared flag.
 * These tests exercise that directly: the same notification set must be
 * able to show as read for one user and unread for another, and marking
 * read for one user must never touch another user's row.
 */
@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    @Mock private NotificationReadRepository notificationReadRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private Notification notification(Long id) {
        return Notification.builder().id(id).type(NotificationType.LOW_STOCK).severity(Severity.WARNING)
                .title("Low stock").message("Paracetamol is low").targetRole("ALL").build();
    }

    @Test
    void getForRole_marksReadForOneUserAndUnreadForAnother() {
        Notification n1 = notification(1L);
        Notification n2 = notification(2L);
        when(notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(List.of("STAFF", "ALL")))
                .thenReturn(List.of(n1, n2));

        // User A has read notification 1 but not 2.
        when(notificationReadRepository.findReadNotificationIds(List.of(1L, 2L), 100L))
                .thenReturn(Set.of(1L));
        List<NotificationResponse> forUserA = notificationService.getForRole("STAFF", 100L);
        assertThat(forUserA).extracting(NotificationResponse::getId, NotificationResponse::isRead)
                .containsExactlyInAnyOrder(
                        org.assertj.core.groups.Tuple.tuple(1L, true),
                        org.assertj.core.groups.Tuple.tuple(2L, false));

        // User B (different id) has read neither — same underlying notifications, independent state.
        when(notificationReadRepository.findReadNotificationIds(List.of(1L, 2L), 200L))
                .thenReturn(Set.of());
        List<NotificationResponse> forUserB = notificationService.getForRole("STAFF", 200L);
        assertThat(forUserB).extracting(NotificationResponse::isRead).containsExactly(false, false);
    }

    @Test
    void getForRole_treatsAnonymousCallerAsAllUnread() {
        Notification n1 = notification(1L);
        when(notificationRepository.findByTargetRoleInOrderByCreatedAtDesc(List.of("STAFF", "ALL")))
                .thenReturn(List.of(n1));

        List<NotificationResponse> result = notificationService.getForRole("STAFF", null);

        assertThat(result).extracting(NotificationResponse::isRead).containsExactly(false);
        verifyNoInteractions(notificationReadRepository);
    }

    @Test
    void markRead_onlyAffectsTheCallingUser() {
        Notification n = notification(1L);
        User user = User.builder().id(100L).fullName("Staff Sam").role(Role.STAFF).build();
        when(notificationReadRepository.existsByNotification_IdAndUser_Id(1L, 100L)).thenReturn(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));

        notificationService.markRead(1L, 100L);

        ArgumentCaptor<NotificationRead> captor = ArgumentCaptor.forClass(NotificationRead.class);
        verify(notificationReadRepository).save(captor.capture());
        assertThat(captor.getValue().getNotification()).isEqualTo(n);
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        // Nothing here ever references or could affect any OTHER user's id — the write is
        // scoped entirely to the (notification, user) pair passed in.
    }

    @Test
    void markRead_isIdempotentIfAlreadyRead() {
        when(notificationReadRepository.existsByNotification_IdAndUser_Id(1L, 100L)).thenReturn(true);

        notificationService.markRead(1L, 100L);

        verify(notificationReadRepository, never()).save(any());
        verifyNoInteractions(notificationRepository, userRepository);
    }

    @Test
    void markRead_noOpsForAnonymousCaller() {
        notificationService.markRead(1L, null);
        verifyNoInteractions(notificationRepository, notificationReadRepository, userRepository);
    }

    @Test
    void markAllReadForRole_onlyCreatesRowsForUnreadOnes() {
        when(notificationRepository.findIdsByTargetRoleIn(List.of("STAFF", "ALL")))
                .thenReturn(List.of(1L, 2L, 3L));
        when(notificationReadRepository.findReadNotificationIds(List.of(1L, 2L, 3L), 100L))
                .thenReturn(Set.of(1L)); // already read #1

        User user = User.builder().id(100L).fullName("Staff Sam").role(Role.STAFF).build();
        when(userRepository.findById(100L)).thenReturn(Optional.of(user));
        when(notificationRepository.getReferenceById(2L)).thenReturn(notification(2L));
        when(notificationRepository.getReferenceById(3L)).thenReturn(notification(3L));

        notificationService.markAllReadForRole("STAFF", 100L);

        // Exactly two new rows created — for #2 and #3, not #1 (already read).
        verify(notificationReadRepository, times(2)).save(any(NotificationRead.class));
        verify(notificationRepository, never()).getReferenceById(1L);
    }

    @Test
    void markAllReadForRole_noOpsWhenNothingTargetsThisRole() {
        when(notificationRepository.findIdsByTargetRoleIn(List.of("STAFF", "ALL"))).thenReturn(List.of());

        notificationService.markAllReadForRole("STAFF", 100L);

        verifyNoInteractions(notificationReadRepository, userRepository);
    }

    @Test
    void unreadCountForRole_subtractsReadFromTotal() {
        when(notificationRepository.findIdsByTargetRoleIn(List.of("ADMIN", "ALL")))
                .thenReturn(List.of(1L, 2L, 3L, 4L));
        when(notificationReadRepository.countByUser_IdAndNotification_IdIn(100L, List.of(1L, 2L, 3L, 4L)))
                .thenReturn(1L);

        assertThat(notificationService.unreadCountForRole("ADMIN", 100L)).isEqualTo(3L);
    }

    @Test
    void unreadCountForRole_returnsTotalForAnonymousCaller() {
        when(notificationRepository.findIdsByTargetRoleIn(List.of("ADMIN", "ALL")))
                .thenReturn(List.of(1L, 2L));

        assertThat(notificationService.unreadCountForRole("ADMIN", null)).isEqualTo(2L);
        verifyNoInteractions(notificationReadRepository);
    }

    @Test
    void markRead_throwsWhenNotificationDoesNotExist() {
        when(notificationReadRepository.existsByNotification_IdAndUser_Id(999L, 100L)).thenReturn(false);
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> notificationService.markRead(999L, 100L))
                .isInstanceOf(EntityNotFoundException.class);
    }
}
