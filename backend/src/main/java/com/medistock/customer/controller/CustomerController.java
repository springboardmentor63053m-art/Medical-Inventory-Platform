package com.medistock.customer.controller;

import com.medistock.customer.dto.CreateCustomerRequest;
import com.medistock.customer.dto.CustomerDTO;
import com.medistock.customer.service.CustomerService;
import com.medistock.prescription.dto.response.StorePurchaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/lookup")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomerDTO> lookupCustomer(@RequestParam("phone") String phone) {
        CustomerDTO dto = customerService.lookupByPhone(phone);
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomerDTO> createCustomer(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerDTO dto = customerService.createOrGetCustomer(request);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<CustomerDTO>> getAllCustomers(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<CustomerDTO> customers = customerService.getAllCustomers(search, status, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(customers);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CustomerDTO> getCustomerDetails(@PathVariable("id") Long id) {
        CustomerDTO dto = customerService.getCustomerDetails(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/purchases")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<StorePurchaseResponse>> getCustomerPurchases(@PathVariable("id") Long id) {
        List<StorePurchaseResponse> purchases = customerService.getCustomerPurchases(id);
        return ResponseEntity.ok(purchases);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<CustomerDTO> updateCustomerStatus(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> statusMap
    ) {
        String status = statusMap.getOrDefault("status", "ACTIVE");
        CustomerDTO dto = customerService.updateCustomerStatus(id, status);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<CustomerDTO> patchCustomer(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "ACTIVE");
        CustomerDTO dto = customerService.updateCustomerStatus(id, status);
        return ResponseEntity.ok(dto);
    }
}
