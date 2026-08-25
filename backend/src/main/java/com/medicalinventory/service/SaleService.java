package com.medicalinventory.service;

import com.medicalinventory.entity.*;
import com.medicalinventory.exception.*;
import com.medicalinventory.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class SaleService {

    private static final Logger log = LoggerFactory.getLogger(SaleService.class);

    private final SaleRepository     saleRepository;
    private final MedicineRepository medicineRepository;
    private final InventoryService   inventoryService;

    public SaleService(SaleRepository saleRepository, MedicineRepository medicineRepository, InventoryService inventoryService) {
        this.saleRepository = saleRepository;
        this.medicineRepository = medicineRepository;
        this.inventoryService = inventoryService;
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public Sale getSaleById(Long id) {
        return saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale", id));
    }

    @Transactional
    public Sale createSale(Sale sale, User creator) {
        sale.setCreatedBy(creator);
        sale.setSaleDate(sale.getSaleDate() != null ? sale.getSaleDate() : LocalDate.now());
        if (sale.getStatus() == null) {
            sale.setStatus(Sale.SaleStatus.COMPLETED);
        }

        if (sale.getSaleNumber() == null || sale.getSaleNumber().isBlank()) {
            String saleNumber = "SALE-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                    + "-" + String.format("%04d", (int)(Math.random() * 9000) + 1000);
            sale.setSaleNumber(saleNumber);
        }

        BigDecimal total = BigDecimal.ZERO;
        if (sale.getItems() != null) {
            for (SaleItem item : sale.getItems()) {
                Medicine med = medicineRepository.findById(item.getMedicine().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Medicine", item.getMedicine().getId()));
                item.setMedicine(med);
                item.setSale(sale);
                if (item.getUnitPrice() == null) {
                    item.setUnitPrice(med.getUnitPrice());
                }
                item.setTotalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                total = total.add(item.getTotalPrice());
            }
        }

        sale.setTotalAmount(total);
        BigDecimal discount = sale.getDiscount() != null ? sale.getDiscount() : BigDecimal.ZERO;
        BigDecimal tax      = sale.getTaxAmount() != null ? sale.getTaxAmount() : BigDecimal.ZERO;
        sale.setNetAmount(total.subtract(discount).add(tax));

        Sale saved = saleRepository.save(sale);

        if (saved.getItems() != null) {
            for (SaleItem item : saved.getItems()) {
                try {
                    inventoryService.decreaseStock(item.getMedicine(), item.getQuantity(), saved.getId(), creator);
                } catch (Exception e) {
                    log.warn("Could not decrease inventory for sale item: {}", e.getMessage());
                }
            }
        }

        log.info("Sale created: {} total: {}", saved.getSaleNumber(), saved.getNetAmount());
        return saved;
    }

    @Transactional
    public Sale cancelSale(Long saleId, User user) {
        Sale sale = getSaleById(saleId);
        if (sale.getStatus() == Sale.SaleStatus.CANCELLED) {
            throw new BadRequestException("Sale is already cancelled.");
        }

        if (sale.getItems() != null) {
            for (SaleItem item : sale.getItems()) {
                inventoryService.increaseStock(
                        item.getMedicine(), item.getQuantity(), saleId, user, null, null);
            }
        }

        sale.setStatus(Sale.SaleStatus.CANCELLED);
        return saleRepository.save(sale);
    }

    @Transactional
    public void deleteSale(Long id) {
        Sale sale = getSaleById(id);
        saleRepository.delete(sale);
        log.info("Deleted sale invoice: {}", sale.getSaleNumber());
    }
}
