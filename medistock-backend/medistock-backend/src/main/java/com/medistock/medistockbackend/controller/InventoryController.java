package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.entity.Inventory;
import com.medistock.medistockbackend.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventories")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService service;

    @GetMapping
    public ResponseEntity<List<Inventory>> getAll() { return ResponseEntity.ok(service.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getById(@PathVariable Long id) { return ResponseEntity.ok(service.findById(id)); }

    @PostMapping
    public ResponseEntity<Inventory> create(@RequestBody Inventory entity) { return ResponseEntity.ok(service.save(entity)); }

    @PutMapping("/{id}")
    public ResponseEntity<Inventory> update(@PathVariable Long id, @RequestBody Inventory entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.deleteById(id); return ResponseEntity.ok().build(); }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Inventory> updateStock(@PathVariable Long id, @RequestParam Integer quantity) {
        return ResponseEntity.ok(service.updateStock(id, quantity));
    }
}
