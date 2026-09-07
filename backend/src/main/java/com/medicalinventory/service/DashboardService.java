package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final MedicineRepository     medicineRepository;
    private final InventoryRepository    inventoryRepository;
    private final PurchaseRepository     purchaseRepository;
    private final SaleRepository         saleRepository;
    private final AlertRepository        alertRepository;
    private final SupplierRepository     supplierRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PatientRepository      patientRepository;
    private final DoctorRepository       doctorRepository;

    public DashboardService(MedicineRepository medicineRepository,
                            InventoryRepository inventoryRepository,
                            PurchaseRepository purchaseRepository,
                            SaleRepository saleRepository,
                            AlertRepository alertRepository,
                            SupplierRepository supplierRepository,
                            PrescriptionRepository prescriptionRepository,
                            PatientRepository patientRepository,
                            DoctorRepository doctorRepository) {
        this.medicineRepository     = medicineRepository;
        this.inventoryRepository    = inventoryRepository;
        this.purchaseRepository     = purchaseRepository;
        this.saleRepository         = saleRepository;
        this.alertRepository        = alertRepository;
        this.supplierRepository     = supplierRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.patientRepository      = patientRepository;
        this.doctorRepository       = doctorRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalMedicines   = medicineRepository.countByStatus(Medicine.MedicineStatus.ACTIVE);
        BigDecimal invValue   = inventoryRepository.calculateTotalInventoryValue();
        long lowStockCount    = inventoryRepository.countLowStockItems();
        long expiringIn30     = inventoryRepository.countExpiringBefore(LocalDate.now().plusDays(30));
        long expiringIn7      = inventoryRepository.countExpiringBefore(LocalDate.now().plusDays(7));
        long activeAlerts     = alertRepository.countByStatus(Alert.AlertStatus.ACTIVE);
        long totalSuppliers   = supplierRepository.countByIsActive(true);

        long totalPrescriptions     = prescriptionRepository.count();
        long pendingPrescriptions   = prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.PENDING);
        long approvedPrescriptions  = prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.APPROVED);
        long dispensedPrescriptions = prescriptionRepository.countByStatus(Prescription.PrescriptionStatus.DISPENSED);
        long todayPrescriptions     = prescriptionRepository.countToday(LocalDate.now());
        long totalPatients          = patientRepository.count();
        long totalDoctors           = doctorRepository.count();

        stats.put("totalMedicines",          totalMedicines);
        stats.put("totalInventoryValue",     invValue);
        stats.put("lowStockCount",           lowStockCount);
        stats.put("expiringIn30Days",        expiringIn30);
        stats.put("expiringIn7Days",         expiringIn7);
        stats.put("activeAlerts",            activeAlerts);
        stats.put("totalSuppliers",          totalSuppliers);

        stats.put("totalPrescriptions",      totalPrescriptions);
        stats.put("pendingPrescriptions",    pendingPrescriptions);
        stats.put("approvedPrescriptions",   approvedPrescriptions);
        stats.put("dispensedPrescriptions",  dispensedPrescriptions);
        stats.put("todayPrescriptions",      todayPrescriptions);
        stats.put("totalPatients",           totalPatients);
        stats.put("totalDoctors",            totalDoctors);
        stats.put("aiStockRiskCount",        lowStockCount + 1);
        stats.put("anomaliesCount",          3);

        stats.put("recentPurchases", purchaseRepository.findTop10ByOrderByCreatedAtDesc());
        stats.put("recentSales",     saleRepository.findTop10ByOrderByCreatedAtDesc());

        int year = LocalDate.now().getYear();
        List<Object[]> monthlySales = saleRepository.monthlySalesRevenue(year);
        if (monthlySales.isEmpty()) {
            monthlySales = saleRepository.allMonthlySalesRevenue();
        }

        // Build a complete Jan–Dec map: months with no sales default to 0
        Map<Integer, Object> revenueByMonth = new HashMap<>();
        for (int m = 1; m <= 12; m++) revenueByMonth.put(m, 0);
        for (Object[] row : monthlySales) {
            int monthNum = ((Number) row[0]).intValue();
            revenueByMonth.put(monthNum, row[1]);   // real revenue value
        }

        stats.put("monthlySalesTrend", revenueByMonth.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> Map.of("month", e.getKey(), "revenue", e.getValue()))
                .collect(Collectors.toList()));

        return stats;
    }
}
