package com.medicalinventory.controller;

import com.medicalinventory.entity.Inventory;
import com.medicalinventory.entity.User;
import com.medicalinventory.repository.UserRepository;
import com.medicalinventory.service.InventoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository   userRepository;

    public InventoryController(InventoryService inventoryService, UserRepository userRepository) {
        this.inventoryService = inventoryService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Inventory>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<Inventory> getByMedicine(@PathVariable Long medicineId) {
        return ResponseEntity.ok(inventoryService.getInventoryByMedicineId(medicineId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Inventory>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @GetMapping("/expiring")
    public ResponseEntity<List<Inventory>> getExpiring(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(inventoryService.getExpiringItems(days));
    }

    @PostMapping
    public ResponseEntity<Inventory> createInventory(
            @RequestBody Inventory inventory,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetails != null ? userRepository.findByEmail(userDetails.getUsername()).orElse(null) : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createOrUpdateInventory(inventory, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> updateInventory(
            @PathVariable Long id,
            @RequestBody Inventory inventory,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userDetails != null ? userRepository.findByEmail(userDetails.getUsername()).orElse(null) : null;
        return ResponseEntity.ok(inventoryService.updateInventory(id, inventory, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/adjust")
    public ResponseEntity<Inventory> adjustStock(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long medicineId = Long.valueOf(body.get("medicineId").toString());
        int  adjustment = Integer.parseInt(body.get("adjustment").toString());
        String reason   = body.getOrDefault("reason", "Manual adjustment").toString();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();

        return ResponseEntity.ok(inventoryService.adjustStock(medicineId, adjustment, reason, user));
    }
}

