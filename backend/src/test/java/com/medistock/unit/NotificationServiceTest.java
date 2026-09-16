package com.medistock.unit;

import com.medistock.inventory.entity.Inventory;
import com.medistock.inventory.repository.InventoryRepository;
import com.medistock.medicine.entity.Medicine;
import com.medistock.notification.dto.response.NotificationResponse;
import com.medistock.notification.entity.Notification;
import com.medistock.notification.repository.NotificationRepository;
import com.medistock.notification.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private Medicine testMedicine;
    private Inventory testBatch;

    @BeforeEach
    void setUp() {
        testMedicine = Medicine.builder()
                .id(101L)
                .medicineCode("MED-1001")
                .name("Nitrofurantoin 100 mg")
                .reorderLevel(59)
                .build();

        testBatch = Inventory.builder()
                .id(1L)
                .medicine(testMedicine)
                .batchNumber("BAT-2026-014")
                .quantity(49)
                .minimumStock(59)
                .expiryDate(LocalDate.now().plusMonths(6))
                .build();
    }

    @Test
    @DisplayName("TEST 1: quantity = 49 < threshold = 59 produces LOW_STOCK notification")
    void test1_LowStockNotificationCreated() {
        testBatch.setQuantity(49);
        testBatch.setMinimumStock(59);

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(notificationRepository.findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(1L, "LOW_STOCK")).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("LOW_STOCK", saved.getType());
        assertEquals("WARNING", saved.getSeverity());
        assertTrue(saved.getIsActive());
        assertFalse(saved.getIsRead());
        assertTrue(saved.getMessage().contains("below the reorder threshold of 59"));
    }

    @Test
    @DisplayName("TEST 2: quantity = 59, threshold = 59 is NOT low stock")
    void test2_ExactThresholdNotLowStock() {
        testBatch.setQuantity(59);
        testBatch.setMinimumStock(59);

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("TEST 3: quantity = 0 produces OUT_OF_STOCK notification")
    void test3_OutOfStockNotificationCreated() {
        testBatch.setQuantity(0);
        testBatch.setMinimumStock(59);

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(notificationRepository.findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(1L, "OUT_OF_STOCK")).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("OUT_OF_STOCK", saved.getType());
        assertEquals("CRITICAL", saved.getSeverity());
        assertTrue(saved.getMessage().contains("has 0 units remaining"));
    }

    @Test
    @DisplayName("TEST 4: quantity = 100 > threshold = 59 produces NO low-stock notification")
    void test4_NormalStockNoNotification() {
        testBatch.setQuantity(100);
        testBatch.setMinimumStock(59);

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        verify(notificationRepository, never()).save(any(Notification.class));
    }

    @Test
    @DisplayName("TEST 5: Expired date produces EXPIRED notification")
    void test5_ExpiredNotificationCreated() {
        testBatch.setQuantity(100);
        testBatch.setMinimumStock(59);
        testBatch.setExpiryDate(LocalDate.now().minusDays(5));

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(notificationRepository.findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(1L, "EXPIRED")).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("EXPIRED", saved.getType());
        assertEquals("CRITICAL", saved.getSeverity());
        assertTrue(saved.getMessage().contains("Expired medicine"));
    }

    @Test
    @DisplayName("TEST 6: Expiry date inside 30-day warning window produces EXPIRING_SOON notification")
    void test6_ExpiringSoonNotificationCreated() {
        testBatch.setQuantity(100);
        testBatch.setMinimumStock(59);
        testBatch.setExpiryDate(LocalDate.now().plusDays(15));

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(notificationRepository.findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(1L, "EXPIRING_SOON")).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification saved = captor.getValue();
        assertEquals("EXPIRING_SOON", saved.getType());
        assertEquals("WARNING", saved.getSeverity());
        assertTrue(saved.getMessage().contains("Expiring soon"));
    }

    @Test
    @DisplayName("TEST 7: Repeated sync operations do NOT create duplicate notifications")
    void test7_DeduplicationStrategy() {
        testBatch.setQuantity(45);
        testBatch.setMinimumStock(59);

        Notification existingNotif = Notification.builder()
                .id(501L)
                .inventory(testBatch)
                .type("LOW_STOCK")
                .severity("WARNING")
                .title("Low Stock: Nitrofurantoin 100 mg")
                .message("Existing low stock msg")
                .isRead(true)
                .isActive(true)
                .build();

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(List.of(existingNotif));
        when(notificationRepository.findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(1L, "LOW_STOCK")).thenReturn(List.of(existingNotif));

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification updated = captor.getValue();
        assertEquals(501L, updated.getId());
        assertTrue(updated.getIsRead(), "User's read status MUST be preserved!");
    }

    @Test
    @DisplayName("TEST 8: Mark notification as read updates isRead flag but keeps notification active")
    void test8_MarkAsReadPreservesActiveState() {
        Notification notif = Notification.builder()
                .id(701L)
                .inventory(testBatch)
                .type("LOW_STOCK")
                .severity("WARNING")
                .title("Low Stock: Nitrofurantoin 100 mg")
                .message("Low stock message")
                .isRead(false)
                .isActive(true)
                .build();

        when(notificationRepository.findById(701L)).thenReturn(Optional.of(notif));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArgument(0));

        NotificationResponse response = notificationService.markAsRead(701L);

        assertTrue(response.getIsRead());
        assertTrue(response.getRead());
        assertTrue(response.getIsActive());
    }

    @Test
    @DisplayName("TEST 9: Low stock -> restock (45 -> 100) resolves active LOW_STOCK condition")
    void test9_RestockResolvesLowStockCondition() {
        testBatch.setQuantity(100);
        testBatch.setMinimumStock(59);

        Notification activeLowStock = Notification.builder()
                .id(801L)
                .inventory(testBatch)
                .type("LOW_STOCK")
                .severity("WARNING")
                .title("Low Stock")
                .message("Low stock")
                .isRead(false)
                .isActive(true)
                .build();

        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(List.of(activeLowStock));

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification resolved = captor.getValue();
        assertFalse(resolved.getIsActive());
        assertNotNull(resolved.getResolvedAt());
    }

    @Test
    @DisplayName("TEST 10: Restock -> low stock again creates new active notification without uncontrolled duplicates")
    void test10_RestockAndRedropRecreatesNotification() {
        testBatch.setQuantity(40);
        testBatch.setMinimumStock(59);

        // Previous notification resolved
        when(inventoryRepository.findAll()).thenReturn(List.of(testBatch));
        when(notificationRepository.findByInventoryIdAndIsActiveTrue(1L)).thenReturn(Collections.emptyList());
        when(notificationRepository.findByInventoryIdAndTypeAndIsActiveTrueOrderByCreatedAtDesc(1L, "LOW_STOCK")).thenReturn(Collections.emptyList());

        notificationService.syncInventoryNotifications();

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, times(1)).save(captor.capture());

        Notification created = captor.getValue();
        assertEquals("LOW_STOCK", created.getType());
        assertTrue(created.getIsActive());
        assertFalse(created.getIsRead());
    }
}
