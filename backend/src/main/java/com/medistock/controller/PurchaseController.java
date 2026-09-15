package com.medistock.controller;

import com.medistock.dto.PurchaseRequest;
import com.medistock.model.Purchase;
import com.medistock.model.User;
import com.medistock.security.CurrentUserProvider;
import com.medistock.service.PurchaseService;
import com.medistock.service.UserActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Purchase-order workflow: Admin creates -> Supplier accepts/rejects ->
 * Supplier dispatches -> Admin receives (stock updates here, and only
 * here). Viewing the ledger stays open to ADMIN, PHARMACIST and STAFF;
 * SUPPLIER logins act on their own orders through the /respond and
 * /dispatch endpoints below, scoped to orders placed with them.
 */
@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final UserActivityService userActivityService;
    private final CurrentUserProvider currentUserProvider;

    /** Full purchase-order history. Any of the three core roles may view. */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<Purchase>> getAll() {
        return ResponseEntity.ok(purchaseService.getAll());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST','STAFF')")
    public ResponseEntity<List<Purchase>> getMine() {
        var user = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(user == null ? List.of() : purchaseService.getForUser(user.getId()));
    }

    /** Step 1 — Admin or Pharmacist places a purchase order with a supplier. Does not touch stock. */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Purchase> create(@Valid @RequestBody PurchaseRequest request) {
        Purchase purchase = purchaseService.createOrder(request);
        userActivityService.log(currentUserProvider.getCurrentUser(), "PURCHASE_ORDER_CREATED",
                "Ordered " + request.getQuantity() + " units of medicine #" + request.getMedicineId());
        return ResponseEntity.ok(purchase);
    }

    /** Step 2 — Supplier accepts or rejects one of their own orders. */
    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Purchase> respond(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        boolean accept = Boolean.TRUE.equals(body.get("accept"));
        String note = body.get("note") != null ? body.get("note").toString() : null;
        User supplierUser = currentUserProvider.getCurrentUser();
        Purchase purchase = purchaseService.respondToOrder(id, accept, note, supplierUser);
        userActivityService.log(supplierUser, accept ? "PURCHASE_ORDER_ACCEPTED" : "PURCHASE_ORDER_REJECTED",
                "Order #" + id + (accept ? " accepted" : " rejected"));
        return ResponseEntity.ok(purchase);
    }

    /** Step 3 — Supplier marks an accepted order as dispatched. */
    @PatchMapping("/{id}/dispatch")
    @PreAuthorize("hasRole('SUPPLIER')")
    public ResponseEntity<Purchase> dispatch(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String note = body != null && body.get("note") != null ? body.get("note").toString() : null;
        User supplierUser = currentUserProvider.getCurrentUser();
        Purchase purchase = purchaseService.markDispatched(id, note, supplierUser);
        userActivityService.log(supplierUser, "PURCHASE_ORDER_DISPATCHED", "Order #" + id + " dispatched");
        return ResponseEntity.ok(purchase);
    }

    /** Step 4 — Admin receives the medicines. Stock increases here. */
    @PatchMapping("/{id}/receive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Purchase> receive(@PathVariable Long id) {
        Purchase purchase = purchaseService.receivePurchase(id);
        userActivityService.log(currentUserProvider.getCurrentUser(), "PURCHASE_ORDER_RECEIVED",
                "Order #" + id + " received into stock");
        return ResponseEntity.ok(purchase);
    }

    /** Admin or Pharmacist cancels an order that hasn't been received yet. */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','PHARMACIST')")
    public ResponseEntity<Purchase> cancel(@PathVariable Long id) {
        Purchase purchase = purchaseService.cancelOrder(id);
        userActivityService.log(currentUserProvider.getCurrentUser(), "PURCHASE_ORDER_CANCELLED", "Order #" + id + " cancelled");
        return ResponseEntity.ok(purchase);
    }
}
