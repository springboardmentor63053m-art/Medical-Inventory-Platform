package com.medistock.controller;

import com.medistock.dto.PurchaseRequest;
import com.medistock.model.Purchase;
import com.medistock.security.CurrentUserProvider;
import com.medistock.service.PurchaseService;
import com.medistock.service.UserActivityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;
    private final UserActivityService userActivityService;
    private final CurrentUserProvider currentUserProvider;

    /** Full purchase history. Any authenticated role may view — staff use it for their own record-keeping context too. */
    @GetMapping
    public ResponseEntity<List<Purchase>> getAll() {
        return ResponseEntity.ok(purchaseService.getAll());
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Purchase>> getMine() {
        var user = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(user == null ? List.of() : purchaseService.getForUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Purchase> create(@Valid @RequestBody PurchaseRequest request) {
        Purchase purchase = purchaseService.recordPurchase(request);
        userActivityService.log(currentUserProvider.getCurrentUser(), "PURCHASE_RECORDED",
                "Purchased " + request.getQuantity() + " units of medicine #" + request.getMedicineId());
        return ResponseEntity.ok(purchase);
    }
}
