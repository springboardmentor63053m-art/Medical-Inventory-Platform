package com.medistock.medistockbackend.controller;

import com.medistock.medistockbackend.entity.PurchaseOrderItem;
import com.medistock.medistockbackend.service.PurchaseOrderItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/purchaseorderitems")
@RequiredArgsConstructor
public class PurchaseOrderItemController {

    private final PurchaseOrderItemService service;

    @GetMapping
    public ResponseEntity<List<PurchaseOrderItem>> getAll() { return ResponseEntity.ok(service.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderItem> getById(@PathVariable Long id) { return ResponseEntity.ok(service.findById(id)); }

    @PostMapping
    public ResponseEntity<PurchaseOrderItem> create(@RequestBody PurchaseOrderItem entity) { return ResponseEntity.ok(service.save(entity)); }

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderItem> update(@PathVariable Long id, @RequestBody PurchaseOrderItem entity) {
        entity.setId(id);
        return ResponseEntity.ok(service.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.deleteById(id); return ResponseEntity.ok().build(); }
}
