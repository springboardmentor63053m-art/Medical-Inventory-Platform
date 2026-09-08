package com.medistock.unit.controller;

import com.medistock.notification.controller.NotificationController;
import com.medistock.notification.dto.response.NotificationResponse;
import com.medistock.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
public class NotificationControllerTest {

    private MockMvc mockMvc;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(notificationController).build();
    }

    @Test
    @DisplayName("PATCH /api/notifications/{id}/read succeeds and returns notification")
    void testMarkAsReadPatchSucceeds() throws Exception {
        NotificationResponse response = NotificationResponse.builder()
                .id("10")
                .isRead(true)
                .read(true)
                .message("Test notification")
                .build();
        when(notificationService.markAsRead(10L)).thenReturn(response);

        mockMvc.perform(patch("/api/notifications/10/read"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("10"))
                .andExpect(jsonPath("$.isRead").value(true));

        verify(notificationService).markAsRead(10L);
    }

    @Test
    @DisplayName("POST /api/notifications/{id}/read is removed and rejected with 405 Method Not Allowed")
    void testMarkAsReadPostRemoved() throws Exception {
        mockMvc.perform(post("/api/notifications/10/read"))
                .andExpect(status().isMethodNotAllowed());

        verify(notificationService, never()).markAsRead(anyLong());
    }

    @Test
    @DisplayName("PATCH /api/notifications/read-all succeeds and marks all as read")
    void testMarkAllAsReadPatchSucceeds() throws Exception {
        doNothing().when(notificationService).markAllAsRead();

        mockMvc.perform(patch("/api/notifications/read-all"))
                .andExpect(status().isOk());

        verify(notificationService).markAllAsRead();
    }

    @Test
    @DisplayName("POST /api/notifications/read-all is removed and rejected with 405 Method Not Allowed")
    void testMarkAllAsReadPostRemoved() throws Exception {
        mockMvc.perform(post("/api/notifications/read-all"))
                .andExpect(status().isMethodNotAllowed());

        verify(notificationService, never()).markAllAsRead();
    }

    @Test
    @DisplayName("PATCH /api/notifications/{id}/dismiss succeeds")
    void testDismissPatchSucceeds() throws Exception {
        doNothing().when(notificationService).dismissNotification(5L);

        mockMvc.perform(patch("/api/notifications/5/dismiss"))
                .andExpect(status().isOk());

        verify(notificationService).dismissNotification(5L);
    }

    @Test
    @DisplayName("DELETE /api/notifications/{id} succeeds with 204 No Content")
    void testDismissDeleteSucceeds() throws Exception {
        doNothing().when(notificationService).dismissNotification(5L);

        mockMvc.perform(delete("/api/notifications/5"))
                .andExpect(status().isNoContent());

        verify(notificationService).dismissNotification(5L);
    }
}
