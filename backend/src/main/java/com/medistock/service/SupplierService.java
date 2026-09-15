package com.medistock.service;

import com.medistock.dto.SupplierRequest;
import com.medistock.dto.SupplierSummaryResponse;
import com.medistock.model.Medicine;
import com.medistock.model.Purchase;
import com.medistock.model.PurchaseOrderStatus;
import com.medistock.model.Supplier;
import com.medistock.repository.MedicineRepository;
import com.medistock.repository.PurchaseRepository;
import com.medistock.repository.SupplierRepository;
import com.medistock.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.OptionalDouble;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public List<Supplier> getAll() {
        return supplierRepository.findAll();
    }

    /** Enriched supplier directory — medicines supplied, stock health, and real purchase activity per supplier. */
    public List<SupplierSummaryResponse> getSummaries() {
        return supplierRepository.findAll().stream()
                .map(this::toSummary)
                .toList();
    }

    private SupplierSummaryResponse toSummary(Supplier supplier) {
        List<Medicine> supplied = medicineRepository.findBySupplier_Id(supplier.getId());
        List<Purchase> purchases = purchaseRepository.findBySupplier_IdOrderByPurchaseDateDesc(supplier.getId());

        long lowStock = supplied.stream().filter(m -> m.getQuantity() > 0 && m.getQuantity() <= m.getReorderLevel()).count();
        long outOfStock = supplied.stream().filter(m -> m.getQuantity() == 0).count();
        BigDecimal totalValue = purchases.stream().map(Purchase::getTotalAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        String lastPurchase = purchases.isEmpty() ? null : purchases.get(0).getPurchaseDate().format(FMT);

        long accepted = purchases.stream().filter(p -> p.getOrderStatus() == PurchaseOrderStatus.ACCEPTED
                || p.getOrderStatus() == PurchaseOrderStatus.DISPATCHED
                || p.getOrderStatus() == PurchaseOrderStatus.RECEIVED).count();
        long rejected = purchases.stream().filter(p -> p.getOrderStatus() == PurchaseOrderStatus.REJECTED).count();
        long pendingResponse = purchases.stream().filter(p -> p.getOrderStatus() == PurchaseOrderStatus.PENDING).count();
        Double acceptanceRate = (accepted + rejected) == 0 ? null : (100.0 * accepted / (accepted + rejected));

        Double avgResponseHours = averageHours(purchases, p -> p.getRespondedDate() != null
                ? Duration.between(p.getPurchaseDate(), p.getRespondedDate()) : null);
        Double avgDispatchHours = averageHours(purchases, p -> p.getDispatchedDate() != null && p.getRespondedDate() != null
                ? Duration.between(p.getRespondedDate(), p.getDispatchedDate()) : null);
        Double avgFulfillmentHours = averageHours(purchases, p -> p.getReceivedDate() != null && p.getDispatchedDate() != null
                ? Duration.between(p.getDispatchedDate(), p.getReceivedDate()) : null);

        Integer performanceScore = computePerformanceScore(acceptanceRate, avgResponseHours, avgFulfillmentHours);

        return SupplierSummaryResponse.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactNumber(supplier.getContactNumber())
                .email(supplier.getEmail())
                .address(supplier.getAddress())
                .medicinesSuppliedCount(supplied.size())
                .lowStockAmongSupplied(lowStock)
                .outOfStockAmongSupplied(outOfStock)
                .totalPurchaseCount(purchases.size())
                .totalPurchaseValue(totalValue)
                .lastPurchaseDate(lastPurchase)
                .hasLogin(userRepository.existsBySupplierId(supplier.getId()))
                .acceptanceRatePercent(acceptanceRate)
                .acceptedCount(accepted)
                .rejectedCount(rejected)
                .pendingResponseCount(pendingResponse)
                .avgResponseHours(avgResponseHours)
                .avgDispatchHours(avgDispatchHours)
                .avgFulfillmentHours(avgFulfillmentHours)
                .performanceScore(performanceScore)
                .build();
    }

    private Double averageHours(List<Purchase> purchases, java.util.function.Function<Purchase, Duration> extractor) {
        OptionalDouble avg = purchases.stream()
                .map(extractor)
                .filter(java.util.Objects::nonNull)
                .mapToDouble(d -> d.toMinutes() / 60.0)
                .average();
        return avg.isPresent() ? Math.round(avg.getAsDouble() * 10) / 10.0 : null;
    }

    /**
     * Composite 0-100 score: acceptance rate weighted 50%, response speed
     * and fulfillment speed 25% each. Any component with no data yet is
     * dropped and the remaining weights renormalized, so a brand-new
     * supplier with only an acceptance rate isn't unfairly penalized for
     * missing dispatch/receive history. Returns null only when there's
     * nothing to score at all (supplier hasn't responded to a single order).
     */
    private Integer computePerformanceScore(Double acceptanceRate, Double avgResponseHours, Double avgFulfillmentHours) {
        if (acceptanceRate == null && avgResponseHours == null && avgFulfillmentHours == null) {
            return null;
        }
        double totalWeight = 0;
        double weightedSum = 0;
        if (acceptanceRate != null) {
            totalWeight += 0.5;
            weightedSum += 0.5 * acceptanceRate;
        }
        if (avgResponseHours != null) {
            // Full marks within 24h, linearly down to 0 at 7 days (168h).
            double speedScore = Math.max(0, Math.min(100, 100 - (avgResponseHours - 24) * 100.0 / 144.0));
            totalWeight += 0.25;
            weightedSum += 0.25 * speedScore;
        }
        if (avgFulfillmentHours != null) {
            // Full marks within 48h of dispatch, linearly down to 0 at 10 days (240h).
            double speedScore = Math.max(0, Math.min(100, 100 - (avgFulfillmentHours - 48) * 100.0 / 192.0));
            totalWeight += 0.25;
            weightedSum += 0.25 * speedScore;
        }
        return (int) Math.round(weightedSum / totalWeight);
    }

    public Supplier getById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
    }

    @Transactional
    public Supplier create(SupplierRequest request) {
        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactNumber(request.getContactNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .build();
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier update(Long id, SupplierRequest request) {
        Supplier supplier = getById(id);
        supplier.setName(request.getName());
        supplier.setContactNumber(request.getContactNumber());
        supplier.setEmail(request.getEmail());
        supplier.setAddress(request.getAddress());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void delete(Long id) {
        Supplier supplier = getById(id);
        supplierRepository.delete(supplier);
    }
}
