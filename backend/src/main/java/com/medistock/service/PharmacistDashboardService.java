package com.medistock.service;

import com.medistock.dto.PharmacistDashboardResponse;
import com.medistock.dto.SaleResponse;
import com.medistock.model.Medicine;
import com.medistock.model.Sale;
import com.medistock.model.User;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.SaleRepository;
import com.medistock.security.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PharmacistDashboardService {

    private final MedicineRepository medicineRepository;
    private final StockMovementService stockMovementService;
    private final SaleRepository saleRepository;
    private final CurrentUserProvider currentUserProvider;
    private final DashboardMapper dashboardMapper;

    public PharmacistDashboardResponse getStats() {
        List<Medicine> all = medicineRepository.findAll();
        List<Medicine> lowStock = medicineRepository.findLowStock();
        List<Medicine> expiring = medicineRepository.findNearExpiry(LocalDate.now().plusDays(30));

        User current = currentUserProvider.getCurrentUser();
        List<Sale> mySales = current != null
                ? saleRepository.findBySoldBy_IdOrderBySaleDateDesc(current.getId())
                : Collections.emptyList();
        BigDecimal salesTotal = mySales.stream().map(Sale::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        return PharmacistDashboardResponse.builder()
                .totalMedicines(all.size())
                .availableStock(all.stream().mapToLong(Medicine::getQuantity).sum())
                .lowStockCount(lowStock.size())
                .outOfStockCount(medicineRepository.findOutOfStock().size())
                .nearExpiryCount(expiring.size())
                .expiredCount(medicineRepository.findExpired().size())
                .lowStockMedicines(lowStock.stream().limit(10).toList())
                .expiringMedicines(expiring.stream().limit(10).toList())
                .recentStockMovements(stockMovementService.getAll().stream().limit(8).map(dashboardMapper::toMovementSummary).toList())
                .mySalesCount(mySales.size())
                .mySalesTotal(salesTotal)
                .recentSales(mySales.stream().limit(8).map(this::toSaleResponse).toList())
                .build();
    }

    private SaleResponse toSaleResponse(Sale sale) {
        List<SaleResponse.SaleItemResponse> items = sale.getItems().stream()
                .map(i -> SaleResponse.SaleItemResponse.builder()
                        .medicineId(i.getMedicine().getId())
                        .medicineName(i.getMedicine().getName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build())
                .toList();
        return SaleResponse.builder()
                .id(sale.getId())
                .billNumber(sale.getBillNumber())
                .customerName(sale.getCustomerName())
                .soldByName(sale.getSoldBy() != null ? sale.getSoldBy().getFullName() : "—")
                .totalAmount(sale.getTotalAmount())
                .saleDate(sale.getSaleDate())
                .items(items)
                .build();
    }
}
