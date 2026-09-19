package com.medistock.controller;

import com.medistock.dto.ApiResponse;
import com.medistock.dto.CreateSaleRequest;
import com.medistock.dto.PageResponse;
import com.medistock.dto.SaleDTO;
import com.medistock.enums.SaleType;
import com.medistock.security.CustomUserDetails;
import com.medistock.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
@Tag(name = "Sales", description = "Pharmacist Walk-in & Prescription Sales APIs")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    @Operation(summary = "Record Sale", description = "Create a walk-in or prescription-based sale and deduct inventory stock")
    public ResponseEntity<ApiResponse<SaleDTO>> createSale(
            @Valid @RequestBody CreateSaleRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        SaleDTO created = saleService.createSale(request, userDetails.getUser().getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created, "Sale recorded successfully and stock updated."));
    }

    @GetMapping
    @Operation(summary = "Get All Sales", description = "Paginated list with optional saleType filter")
    public ResponseEntity<ApiResponse<PageResponse<SaleDTO>>> getAllSales(
            @RequestParam(required = false) SaleType saleType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PageResponse<SaleDTO> sales = saleService.getAllSales(saleType, pageable);
        return ResponseEntity.ok(ApiResponse.success(sales));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Sale Details", description = "Fetch detailed sale with itemized breakdown")
    public ResponseEntity<ApiResponse<SaleDTO>> getSaleById(@PathVariable Long id) {
        SaleDTO sale = saleService.getSaleById(id);
        return ResponseEntity.ok(ApiResponse.success(sale));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get Customer Sales History", description = "List all sales for a customer")
    public ResponseEntity<ApiResponse<List<SaleDTO>>> getCustomerSales(@PathVariable Long customerId) {
        List<SaleDTO> sales = saleService.getCustomerSales(customerId);
        return ResponseEntity.ok(ApiResponse.success(sales));
    }
}
