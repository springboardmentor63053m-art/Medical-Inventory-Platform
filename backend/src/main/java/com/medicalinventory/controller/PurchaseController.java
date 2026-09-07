package com.medicalinventory.controller;

import com.medicalinventory.entity.*;
import com.medicalinventory.repository.UserRepository;
import com.medicalinventory.service.PurchaseService;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final UserRepository  userRepository;

    public PurchaseController(PurchaseService purchaseService, UserRepository userRepository) {
        this.purchaseService = purchaseService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Purchase>> getAll() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    @PostMapping
    public ResponseEntity<Purchase> create(
            @RequestBody Purchase purchase,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(purchaseService.createPurchase(purchase, user));
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<Purchase> receive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(purchaseService.receivePurchase(id, user));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Purchase> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.cancelPurchase(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.noContent().build();
    }
}
